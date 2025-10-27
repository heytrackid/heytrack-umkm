/**
 * Generate a simple correlation ID
 */
function generateCorrelationId(): string {
  return `hpp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
import type {
  AgentContext,
  AgentTask,
  AgentResult} from '@/agents/base';
import {
  createAgentContext,
  createAgentLogger,
  executeAgentTask
} from '@/agents/base'
import { HppCalculatorService } from '@/modules/orders/services/HppCalculatorService'
import supabase from '@/utils/supabase'

interface DailySnapshotTaskData {
  targetDate?: string // Optional, defaults to yesterday
  recipeIds?: string[] // Optional, defaults to all active recipes
}

interface SnapshotResult {
  snapshotsCreated: number
  recipesProcessed: number
  errors: Array<{
    recipeId: string
    error: string
  }>
}

/**
 * Daily Snapshots Automation Agent
 * Automatically creates HPP snapshots for all recipes on a daily basis
 */
export class DailySnapshotsAgent {
  private logger = createAgentLogger('DailySnapshotsAgent', 'system')
  private hppCalculator = new HppCalculatorService()

  /**
   * Execute daily snapshots for all active recipes
   */
  async executeDailySnapshots(data: DailySnapshotTaskData = {}): Promise<AgentResult> {
    const correlationId = generateCorrelationId()
    const context = createAgentContext(correlationId)
    const logger = createAgentLogger('DailySnapshotsAgent', correlationId)

    const task: AgentTask = {
      id: `daily-snapshots-${Date.now()}`,
      type: 'DAILY_HPP_SNAPSHOTS',
      priority: 'high',
      data,
      metadata: {
        createdAt: new Date()
      }
    }

    return executeAgentTask(
      'DailySnapshotsAgent',
      task,
      context,
      this.processDailySnapshots.bind(this)
    )
  }

  /**
   * Process daily snapshots for recipes
   */
  private async processDailySnapshots(task: AgentTask, context: AgentContext): Promise<SnapshotResult> {
    const { targetDate, recipeIds } = task.data as DailySnapshotTaskData
    const logger = createAgentLogger('DailySnapshotsAgent', context.correlationId)

    // Determine target date (yesterday by default)
    const snapshotDate = targetDate ? new Date(targetDate) : new Date()
    snapshotDate.setDate(snapshotDate.getDate() - 1)
    const snapshotDateStr = snapshotDate.toISOString().split('T')[0]

    logger.info(`Processing daily HPP snapshots for date: ${snapshotDateStr}`)

    // Get recipes to process
    const recipesToProcess = recipeIds || await this.getActiveRecipeIds()

    if (recipesToProcess.length === 0) {
      logger.warn('No recipes found to process')
      return {
        snapshotsCreated: 0,
        recipesProcessed: 0,
        errors: []
      }
    }

    logger.info(`Processing ${recipesToProcess.length} recipes`)

    const errors: Array<{ recipeId: string; error: string }> = []
    let snapshotsCreated = 0

    // Process each recipe
    for (const recipeId of recipesToProcess) {
      try {
        const snapshotCreated = await this.createRecipeSnapshot(recipeId, snapshotDateStr, context)
        if (snapshotCreated) {
          snapshotsCreated++
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        logger.error({ error, recipeId }, `Failed to create snapshot for recipe ${recipeId}`)
        errors.push({
          recipeId,
          error: errorMessage
        })
      }
    }

    const result: SnapshotResult = {
      snapshotsCreated,
      recipesProcessed: recipesToProcess.length,
      errors
    }

    logger.info(`Daily snapshots completed: ${snapshotsCreated}/${recipesToProcess.length} successful`)

    // Add telemetry
    context.telemetry.events.push({
      event: 'agent.daily_snapshots.complete',
      timestamp: new Date(),
      data: result
    })

    return result
  }

  /**
   * Create HPP snapshot for a specific recipe
   */
  private async createRecipeSnapshot(
    recipeId: string,
    snapshotDate: string,
    context: AgentContext
  ): Promise<boolean> {
    const logger = createAgentLogger('DailySnapshotsAgent', context.correlationId)

    try {
      // Calculate current HPP for the recipe
      const hppResult = await this.hppCalculator.calculateRecipeHpp(recipeId)

      // Get previous snapshot for comparison
      const previousSnapshot = await this.getPreviousSnapshot(recipeId, snapshotDate)

      // Calculate change percentage
      let changePercentage = 0
      if (previousSnapshot) {
        const previousValue = Number(previousSnapshot.hpp_value)
        const currentValue = hppResult.totalHpp
        if (previousValue > 0) {
          changePercentage = ((currentValue - previousValue) / previousValue) * 100
        }
      }

      // Create snapshot record
      const snapshotData = {
        snapshot_date: snapshotDate,
        recipe_id: recipeId,
        hpp_value: hppResult.totalHpp,
        previous_hpp: previousSnapshot?.hpp_value || null,
        change_percentage: changePercentage,
        material_cost_breakdown: {
          totalMaterialCost: hppResult.materialCost,
          breakdown: hppResult.materialBreakdown
        }
      }

      const { error } = await supabase
        .from('hpp_snapshots')
        .insert(snapshotData)

      if (error) {
        // Check if it's a duplicate key error (snapshot already exists)
        if (error.code === '23505') { // unique_violation
          logger.warn(`Snapshot already exists for recipe ${recipeId} on ${snapshotDate}`)
          return false
        }
        throw new Error(`Failed to create snapshot: ${error.message}`)
      }

      logger.info(`Created HPP snapshot for recipe ${recipeId}: ${hppResult.totalHpp}`)
      return true

    } catch (error: unknown) {
      logger.error({ error, recipeId }, `Failed to create snapshot for recipe ${recipeId}`)
      throw error
    }
  }

  /**
   * Get previous snapshot for comparison
   */
  private async getPreviousSnapshot(recipeId: string, currentDate: string) {
    try {
      const { data, error } = await supabase
        .from('hpp_snapshots')
        .select('hpp_value')
        .eq('recipe_id', recipeId)
        .lt('snapshot_date', currentDate)
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Failed to fetch previous snapshot: ${error.message}`)
      }

      return data || null

    } catch (error: unknown) {
      // Log but don't fail the whole process
      this.logger.error({ error }, `Failed to get previous snapshot for recipe ${recipeId}`)
      return null
    }
  }

  /**
   * Get all active recipe IDs
   */
  private async getActiveRecipeIds(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('id')
        .eq('is_active', true)

      if (error) {
        throw new Error(`Failed to fetch active recipes: ${error.message}`)
      }

      return data?.map(r => r.id) || []

    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to get active recipe IDs')
      throw error
    }
  }

  /**
   * Clean up old snapshots (keep only last 365 days)
   */
  async cleanupOldSnapshots(): Promise<void> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - 365)
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('hpp_snapshots')
        .delete()
        .lt('snapshot_date', cutoffDateStr)
        .select('id')

      if (error) {
        throw new Error(`Failed to cleanup old snapshots: ${error.message}`)
      }

      const deletedCount = data?.length || 0
      this.logger.info(`Cleaned up ${deletedCount} old HPP snapshots`)

    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to cleanup old snapshots')
      throw error
    }
  }
}
