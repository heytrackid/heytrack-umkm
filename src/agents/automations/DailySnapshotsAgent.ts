import type {
  AgentContext,
  AgentTask,
  AgentResult} from '@/agents/base';
import {
  createAgentContext,
  createAgentLogger,
  executeAgentTask
} from '@/agents/base'
import { HppCalculatorService } from '@/modules/hpp'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase-generated'

type Recipe = Database['public']['Tables']['recipes']['Row']
type HppSnapshot = Database['public']['Tables']['hpp_snapshots']['Row']
type HppSnapshotInsert = Database['public']['Tables']['hpp_snapshots']['Insert']

/**
 * Generate a simple correlation ID
 */
function generateCorrelationId(): string {
  return `hpp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

interface DailySnapshotTaskData {
  targetDate?: string // Optional, defaults to yesterday
  recipeIds?: string[] // Optional, defaults to all active recipes
  [key: string]: unknown // Index signature to make it compatible with Record<string, unknown>
}

interface SnapshotResult {
  snapshotsCreated: number
  recipesProcessed: number
  errors: Array<{
    recipeId: string
    error: string
  }>
  [key: string]: unknown // Index signature to make it compatible with Record<string, unknown>
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
    // const logger = createAgentLogger('DailySnapshotsAgent', correlationId)

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
    const snapshotDateStr: string = snapshotDate.toISOString().split('T')[0]!

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
        logger.error({ message: `Failed to create snapshot for recipe ${recipeId}: ${errorMessage}` })
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
      const snapshotData: {
        snapshot_date: string
        recipe_id: string
        hpp_value: number
        previous_hpp: number | null
        change_percentage: number
        material_cost_breakdown: {
          totalMaterialCost: number
          breakdown: Array<{
            ingredientId: string
            ingredientName: string
            quantity: number
            unit: string
            unitPrice: number
            totalCost: number
          }>
        }
      } = {
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

      const { error: insertError } = await context.supabase
        .from('hpp_snapshots')
        .insert([snapshotData] as any)

      if (insertError) {
        // Check if it's a duplicate key error (snapshot already exists)
        if (insertError.code === '23505') { // unique_violation
          logger.warn(`Snapshot already exists for recipe ${recipeId} on ${snapshotDate}`)
          return false
        }
        throw new Error(`Failed to create snapshot: ${insertError.message || 'Unknown error'}`)
      }

      logger.info(`Created HPP snapshot for recipe ${recipeId}: ${hppResult.totalHpp}`)
      return true

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error({ message: `Failed to create snapshot for recipe ${recipeId}: ${errorMessage}` })
      throw error
    }
  }

  /**
   * Get previous snapshot for comparison
   */
  private async getPreviousSnapshot(recipeId: string, currentDate: string): Promise<{ hpp_value: number } | null> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('hpp_snapshots')
        .select('hpp_value')
        .eq('recipe_id', recipeId)
        .lt('snapshot_date', currentDate)
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .single<{ hpp_value: number }>()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Failed to fetch previous snapshot: ${error.message}`)
      }

      return data || null

    } catch (error: unknown) {
      // Log but don't fail the whole process
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error({ message: `Failed to get previous snapshot for recipe ${recipeId}: ${errorMessage}` })
      return null
    }
  }

  /**
   * Get all active recipe IDs
   */
  private async getActiveRecipeIds(): Promise<string[]> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('recipes')
        .select('id')
        .eq('is_active', true)

      if (error) {
        throw new Error(`Failed to fetch active recipes: ${error.message}`)
      }

      return data?.map((r: { id: string }) => r.id) || []

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error({ message: `Failed to get active recipe IDs: ${errorMessage}` })
      throw error
    }
  }

  /**
   * Clean up old snapshots (keep only last 365 days)
   */
  async cleanupOldSnapshots(): Promise<void> {
    try {
      const supabase = createClient()
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error({ message: `Failed to cleanup old snapshots: ${errorMessage}` })
      throw error
    }
  }
}
