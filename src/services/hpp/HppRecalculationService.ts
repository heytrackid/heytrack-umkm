import { apiLogger } from '@/lib/logger'
import { BaseService, type ServiceContext } from '@/services/base'
import { HppCalculatorService } from './HppCalculatorService'

/**
 * HPP Recalculation Service
 * Processes the HPP recalculation queue triggered by ingredient WAC or operational cost changes
 * 
 * ✅ STANDARDIZED: Extends BaseService, uses ServiceContext
 */

export interface HppRecalculationQueueItem {
  id: string
  user_id: string
  recipe_id: string
  trigger_reason: 'ingredient_wac_change' | 'operational_cost_change'
  trigger_details: Record<string, unknown>
  status: 'pending' | 'processing' | 'completed' | 'failed'
  processed_at: string | null
  error_message: string | null
  created_at: string
}

export class HppRecalculationService extends BaseService {
  private readonly logger = apiLogger
  private readonly hppCalculator: HppCalculatorService

  constructor(context: ServiceContext) {
    super(context)
    this.hppCalculator = new HppCalculatorService(context)
  }

  /**
   * Process pending HPP recalculation queue items
   * Should be called periodically (e.g., via cron job or background worker)
   */
  async processPendingRecalculations(batchSize: number = 10): Promise<{
    processed: number
    failed: number
    pending: number
  }> {
    return this.executeWithAudit(
      async () => {
        this.logger.info({ userId: this.context.userId, batchSize }, 'Processing HPP recalculation queue')

        // Get pending items
        const { data: pendingItems, error: fetchError } = await this.context.supabase
          .from('hpp_recalculation_queue')
          .select('*')
          .eq('user_id', this.context.userId)
          .eq('status', 'pending')
          .order('created_at', { ascending: true })
          .limit(batchSize)

        if (fetchError) {
          this.logger.error({ error: fetchError }, 'Failed to fetch pending recalculation items')
          throw fetchError
        }

        if (!pendingItems || pendingItems.length === 0) {
          this.logger.info({ userId: this.context.userId }, 'No pending HPP recalculations')
          return { processed: 0, failed: 0, pending: 0 }
        }

        let processedCount = 0
        let failedCount = 0

        // Process each item
        for (const item of pendingItems as HppRecalculationQueueItem[]) {
          try {
            // Mark as processing
            await this.context.supabase
              .from('hpp_recalculation_queue')
              .update({ status: 'processing' })
              .eq('id', item.id)

            // Recalculate HPP
            await this.hppCalculator.calculateRecipeHpp(item.recipe_id)

            // Mark as completed
            await this.context.supabase
              .from('hpp_recalculation_queue')
              .update({
                status: 'completed',
                processed_at: new Date().toISOString()
              })
              .eq('id', item.id)

            processedCount++
            this.logger.info({
              queueItemId: item.id,
              recipeId: item.recipe_id,
              triggerReason: item.trigger_reason
            }, 'HPP recalculation completed')

          } catch (error) {
            failedCount++
            this.logger.error({
              error,
              queueItemId: item.id,
              recipeId: item.recipe_id
            }, 'HPP recalculation failed')

            // Mark as failed
            await this.context.supabase
              .from('hpp_recalculation_queue')
              .update({
                status: 'failed',
                error_message: error instanceof Error ? error.message : 'Unknown error',
                processed_at: new Date().toISOString()
              })
              .eq('id', item.id)
          }
        }

        // Get remaining pending count
        const { count: remainingPending } = await this.context.supabase
          .from('hpp_recalculation_queue')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', this.context.userId)
          .eq('status', 'pending')

        this.logger.info({
          userId: this.context.userId,
          processed: processedCount,
          failed: failedCount,
          pending: remainingPending ?? 0
        }, 'HPP recalculation batch completed')

        return {
          processed: processedCount,
          failed: failedCount,
          pending: remainingPending ?? 0
        }
      },
      'UPDATE',
      'recipes',
      this.context.userId
    )
  }

  /**
   * Get recalculation queue status
   */
  async getQueueStatus(): Promise<{
    pending: number
    processing: number
    completed_today: number
    failed_today: number
  }> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [pending, processing, completedToday, failedToday] = await Promise.all([
      this.context.supabase
        .from('hpp_recalculation_queue')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', this.context.userId)
        .eq('status', 'pending'),
      
      this.context.supabase
        .from('hpp_recalculation_queue')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', this.context.userId)
        .eq('status', 'processing'),
      
      this.context.supabase
        .from('hpp_recalculation_queue')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', this.context.userId)
        .eq('status', 'completed')
        .gte('processed_at', today.toISOString()),
      
      this.context.supabase
        .from('hpp_recalculation_queue')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', this.context.userId)
        .eq('status', 'failed')
        .gte('processed_at', today.toISOString())
    ])

    return {
      pending: pending.count ?? 0,
      processing: processing.count ?? 0,
      completed_today: completedToday.count ?? 0,
      failed_today: failedToday.count ?? 0
    }
  }

  /**
   * Manually trigger HPP recalculation for a recipe
   */
  async triggerManualRecalculation(recipeId: string, reason?: string): Promise<void> {
    return this.executeWithAudit(
      async () => {
        await this.context.supabase
          .from('hpp_recalculation_queue')
          .insert({
            user_id: this.context.userId,
            recipe_id: recipeId,
            trigger_reason: 'operational_cost_change', // Generic reason for manual triggers
            trigger_details: {
              manual_trigger: true,
              reason: reason ?? 'Manual recalculation requested'
            },
            status: 'pending'
          })

        this.logger.info({ recipeId, reason }, 'Manual HPP recalculation queued')
      },
      'CREATE',
      'recipes',
      recipeId
    )
  }

  /**
   * Clear old completed/failed queue items (cleanup)
   */
  async cleanupOldQueueItems(daysToKeep: number = 7): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const { data, error } = await this.context.supabase
      .from('hpp_recalculation_queue')
      .delete()
      .eq('user_id', this.context.userId)
      .in('status', ['completed', 'failed'])
      .lt('processed_at', cutoffDate.toISOString())
      .select('id')

    if (error) {
      this.logger.error({ error }, 'Failed to cleanup old queue items')
      throw error
    }

    const deletedCount = data?.length ?? 0
    this.logger.info({ deletedCount, daysToKeep }, 'Cleaned up old HPP recalculation queue items')

    return deletedCount
  }
}
