import type {
  AgentContext,
  AgentTask,
  AgentResult} from '@/agents/base';
import {
  createAgentContext,
  createAgentLogger,
  executeAgentTask
} from '@/agents/base'
import supabase from '@/utils/supabase'

interface AlertDetectionTaskData {
  threshold?: number // percentage threshold for alerts (default 10%)
  recipeIds?: string[] // optional, check all if not specified
  [key: string]: unknown // Index signature to make it compatible with Record<string, unknown>
}

interface AlertResult {
  alertsCreated: number
  recipesChecked: number
  significantChanges: Array<{
    recipeId: string
    changePercentage: number
    currentHpp: number
    previousHpp: number
  }>
  [key: string]: unknown // Index signature to make it compatible with Record<string, unknown>
}

/**
 * Alert Detection Agent
 * Monitors HPP changes and creates alerts for significant price movements
 */
export class HppAlertAgent {
  private logger = createAgentLogger('HppAlertAgent', 'system')

  /**
   * Execute alert detection for HPP changes
   */
  async executeAlertDetection(data: AlertDetectionTaskData = {}): Promise<AgentResult> {
    const correlationId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const context = createAgentContext(correlationId)
    // const logger = createAgentLogger('HppAlertAgent', correlationId)

    const task: AgentTask = {
      id: `hpp-alert-detection-${Date.now()}`,
      type: 'HPP_ALERT_DETECTION',
      priority: 'medium',
      data,
      metadata: {
        createdAt: new Date()
      }
    }

    return executeAgentTask(
      'HppAlertAgent',
      task,
      context,
      this.detectAlerts.bind(this)
    )
  }

  /**
   * Detect significant HPP changes and create alerts
   */
  private async detectAlerts(task: AgentTask, context: AgentContext): Promise<AlertResult> {
    const { threshold = 10, recipeIds } = task.data as AlertDetectionTaskData
    const logger = createAgentLogger('HppAlertAgent', context.correlationId)

    logger.info(`Detecting HPP alerts with ${threshold}% threshold`)

    // Get recipes to check
    const recipesToCheck = recipeIds || await this.getActiveRecipeIds()

    if (recipesToCheck.length === 0) {
      logger.warn('No recipes found to check for alerts')
      return {
        alertsCreated: 0,
        recipesChecked: 0,
        significantChanges: []
      }
    }

    logger.info(`Checking ${recipesToCheck.length} recipes for HPP changes`)

    const significantChanges: AlertResult['significantChanges'] = []
    let alertsCreated = 0

    // Check each recipe for significant changes
    for (const recipeId of recipesToCheck) {
      try {
        const change = await this.checkRecipeHppChange(recipeId, threshold, context)
        if (change) {
          significantChanges.push(change)
          const alertCreated = await this.createAlert(change, threshold, context)
          if (alertCreated) {
            alertsCreated++
          }
        }
      } catch (error: unknown) {
        logger.error({ error, recipeId }, `Failed to check alerts for recipe ${recipeId}`)
      }
    }

    const result: AlertResult = {
      alertsCreated,
      recipesChecked: recipesToCheck.length,
      significantChanges
    }

    logger.info(`Alert detection completed: ${alertsCreated} alerts created from ${significantChanges.length} significant changes`)

    // Add telemetry
    context.telemetry.events.push({
      event: 'agent.alert_detection.complete',
      timestamp: new Date(),
      data: result
    })

    return result
  }

  /**
   * Check if a recipe has significant HPP change
   */
  private async checkRecipeHppChange(
    recipeId: string,
    threshold: number,
    context: AgentContext
  ): Promise<AlertResult['significantChanges'][0] | null> {
    try {
      // Get the latest two snapshots for this recipe
      const { data: snapshots, error } = await supabase
        .from('hpp_snapshots')
        .select('snapshot_date, hpp_value')
        .eq('recipe_id', recipeId)
        .order('snapshot_date', { ascending: false })
        .limit(2) as { data: Array<{ snapshot_date: string; hpp_value: number }> | null, error: Error | null }

      if (error) {
        throw new Error(`Failed to fetch snapshots: ${error.message}`)
      }

      if (!snapshots || snapshots.length < 2) {
        // Not enough data for comparison
        return null
      }

      const [latest, previous] = snapshots as [{ snapshot_date: string; hpp_value: number }, { snapshot_date: string; hpp_value: number }]
      if (!latest || !previous) {
        return null // Not enough snapshots for comparison
      }
      const changePercentage = ((latest.hpp_value - previous.hpp_value) / previous.hpp_value) * 100

      // Check if change exceeds threshold
      if (Math.abs(changePercentage) >= threshold) {
        return {
          recipeId,
          changePercentage,
          currentHpp: latest.hpp_value,
          previousHpp: previous.hpp_value
        }
      }

      return null

    } catch (error: unknown) {
      const logger = createAgentLogger('HppAlertAgent', context.correlationId)
      logger.error({ error, recipeId }, `Failed to check HPP change for recipe ${recipeId}`)
      throw error
    }
  }

  /**
   * Create an alert for significant HPP change
   */
  private async createAlert(
    change: AlertResult['significantChanges'][0],
    threshold: number,
    context: AgentContext
  ): Promise<boolean> {
    try {
      const logger = createAgentLogger('HppAlertAgent', context.correlationId)

      // Check if alert already exists for this change (avoid duplicates)
      const { data: existingAlert, error: checkError } = await supabase
        .from('hpp_alerts')
        .select('id')
        .eq('recipe_id', change.recipeId)
        .eq('current_value', change.currentHpp)
        .eq('previous_value', change.previousHpp)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Failed to check existing alerts: ${checkError.message}`)
      }

      if (existingAlert) {
        logger.info(`Alert already exists for recipe ${change.recipeId} change`)
        return false
      }

      // Get recipe name for better alert message
      const { data: recipe } = await supabase
        .from('recipes')
        .select('name')
        .eq('id', change.recipeId)
        .single()

      const recipeName = recipe && 'name' in recipe ? (recipe as { name: string }).name : `Recipe ${change.recipeId}`

      // Create alert
      const alertData: {
        recipe_id: string
        alert_type: 'COST_INCREASE' | 'COST_DECREASE'
        threshold: number
        current_value: number
        previous_value: number
        change_percentage: number
        message: string
        is_read: boolean
      } = {
        recipe_id: change.recipeId,
        alert_type: change.changePercentage > 0 ? 'COST_INCREASE' : 'COST_DECREASE',
        threshold,
        current_value: change.currentHpp,
        previous_value: change.previousHpp,
        change_percentage: change.changePercentage,
        message: `${recipeName}: HPP ${change.changePercentage > 0 ? 'increased' : 'decreased'} by ${Math.abs(change.changePercentage).toFixed(1)}% (Rp ${change.previousHpp.toLocaleString()} → Rp ${change.currentHpp.toLocaleString()})`,
        is_read: false
      }

      const { error: insertError } = await supabase
        .from('hpp_alerts')
        .insert([alertData])

      if (insertError) {
        throw new Error(`Failed to create alert: ${insertError.message}`)
      }

      logger.info(`Created HPP alert for recipe ${change.recipeId}: ${change.changePercentage.toFixed(1)}% change`)
      return true

    } catch (error: unknown) {
      const logger = createAgentLogger('HppAlertAgent', context.correlationId)
      logger.error({ error, recipeId: change.recipeId }, `Failed to create alert for recipe ${change.recipeId}`)
      return false
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

      return data?.map((r: { id: string }) => r.id) || []

    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to get active recipe IDs')
      throw error
    }
  }

  /**
   * Get unread alerts for a user
   */
  async getUnreadAlerts(): Promise<Array<{ id: string; message: string; alert_type: string; severity: string; recipe_id: string | null; created_at: string }>> {
    try {
      const { data, error } = await supabase
        .from('hpp_alerts')
        .select(`
          *,
          recipes:recipe_id (
            name
          )
        `)
        .eq('is_read', false)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch unread alerts: ${error.message}`)
      }

      return data || []

    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to get unread alerts')
      throw error
    }
  }

  /**
   * Mark alert as read
   */
  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('hpp_alerts')
        .update([{ is_read: true }])
        .eq('id', alertId)

      if (error) {
        throw new Error(`Failed to mark alert as read: ${error.message}`)
      }

    } catch (error: unknown) {
      this.logger.error({ error, alertId }, `Failed to mark alert ${alertId} as read`)
      throw error
    }
  }
}
