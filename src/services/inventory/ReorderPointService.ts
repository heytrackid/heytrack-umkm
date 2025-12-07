/**
 * Reorder Point Service
 * Calculates optimal reorder points based on usage patterns
 * 
 * Formula: Reorder Point = (Average Daily Usage × Lead Time Days) + Safety Stock
 * Safety Stock = Average Daily Usage × Safety Days
 */

import { dbLogger } from '@/lib/logger'
import { BaseService, type ServiceContext } from '@/services/base'

export interface ReorderPointCalculation {
  ingredient_id: string
  ingredient_name: string
  current_reorder_point: number
  calculated_reorder_point: number
  average_daily_usage: number
  lead_time_days: number
  safety_stock: number
  recommendation: 'increase' | 'decrease' | 'keep' | 'set'
}

export class ReorderPointService extends BaseService {
  private readonly logger = dbLogger

  // Configuration
  private readonly DEFAULT_LEAD_TIME_DAYS = 7 // Default supplier lead time
  private readonly DEFAULT_SAFETY_DAYS = 3 // Default safety stock buffer
  private readonly LOOKBACK_DAYS = 30 // Period to analyze usage

  constructor(context: ServiceContext) {
    super(context)
  }

  /**
   * Calculate optimal reorder point for an ingredient
   */
  async calculateReorderPoint(ingredientId: string): Promise<ReorderPointCalculation> {
    // Get ingredient details
    const { data: ingredient, error: ingredientError } = await this.context.supabase
      .from('ingredients')
      .select('id, name, reorder_point, lead_time_days')
      .eq('id', ingredientId)
      .eq('user_id', this.context.userId)
      .single()

    if (ingredientError || !ingredient) {
      throw new Error(`Ingredient not found: ${ingredientId}`)
    }

    // Get usage history from stock transactions
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.LOOKBACK_DAYS)

    const { data: transactions, error: txError } = await this.context.supabase
      .from('stock_transactions')
      .select('quantity, created_at, type')
      .eq('ingredient_id', ingredientId)
      .eq('user_id', this.context.userId)
      .eq('type', 'USAGE')
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: true })

    if (txError) {
      this.logger.warn({ error: txError, ingredientId }, 'Failed to fetch usage transactions')
    }

    // Calculate average daily usage
    const totalUsage = (transactions || []).reduce(
      (sum, tx) => sum + Math.abs(Number(tx.quantity ?? 0)),
      0
    )
    const averageDailyUsage = totalUsage / this.LOOKBACK_DAYS

    // Get lead time (from ingredient or use default)
    const leadTimeDays = Number(ingredient.lead_time_days ?? this.DEFAULT_LEAD_TIME_DAYS)

    // Calculate safety stock
    const safetyStock = averageDailyUsage * this.DEFAULT_SAFETY_DAYS

    // Calculate reorder point
    const calculatedReorderPoint = Math.ceil(
      (averageDailyUsage * leadTimeDays) + safetyStock
    )

    const currentReorderPoint = Number(ingredient.reorder_point ?? 0)

    // Determine recommendation
    let recommendation: 'increase' | 'decrease' | 'keep' | 'set' = 'keep'
    if (currentReorderPoint === 0) {
      recommendation = 'set'
    } else if (calculatedReorderPoint > currentReorderPoint * 1.2) {
      recommendation = 'increase'
    } else if (calculatedReorderPoint < currentReorderPoint * 0.8) {
      recommendation = 'decrease'
    }

    return {
      ingredient_id: ingredientId,
      ingredient_name: ingredient.name,
      current_reorder_point: currentReorderPoint,
      calculated_reorder_point: calculatedReorderPoint,
      average_daily_usage: averageDailyUsage,
      lead_time_days: leadTimeDays,
      safety_stock: safetyStock,
      recommendation
    }
  }

  /**
   * Calculate reorder points for all ingredients
   */
  async calculateAllReorderPoints(): Promise<ReorderPointCalculation[]> {
    // Get all active ingredients
    const { data: ingredients, error } = await this.context.supabase
      .from('ingredients')
      .select('id')
      .eq('user_id', this.context.userId)
      .eq('is_active', true)

    if (error || !ingredients) {
      throw new Error('Failed to fetch ingredients')
    }

    const results: ReorderPointCalculation[] = []

    for (const ingredient of ingredients) {
      try {
        const calculation = await this.calculateReorderPoint(ingredient.id)
        results.push(calculation)
      } catch (err) {
        this.logger.error({ error: err, ingredientId: ingredient.id }, 'Failed to calculate reorder point')
      }
    }

    return results
  }

  /**
   * Apply calculated reorder point to ingredient
   */
  async applyReorderPoint(ingredientId: string): Promise<void> {
    return this.executeWithAudit(
      async () => {
        const calculation = await this.calculateReorderPoint(ingredientId)

        const { error } = await this.context.supabase
          .from('ingredients')
          .update({
            reorder_point: calculation.calculated_reorder_point,
            updated_at: new Date().toISOString(),
            updated_by: this.context.userId
          })
          .eq('id', ingredientId)
          .eq('user_id', this.context.userId)

        if (error) {
          throw new Error(`Failed to update reorder point: ${error.message}`)
        }

        this.logger.info({
          ingredientId,
          ingredientName: calculation.ingredient_name,
          oldReorderPoint: calculation.current_reorder_point,
          newReorderPoint: calculation.calculated_reorder_point
        }, 'Reorder point updated')
      },
      'UPDATE',
      'INGREDIENT',
      ingredientId,
      { action: 'apply_calculated_reorder_point' }
    )
  }

  /**
   * Apply calculated reorder points to all ingredients
   */
  async applyAllReorderPoints(): Promise<{ updated: number; failed: number }> {
    const calculations = await this.calculateAllReorderPoints()
    
    let updated = 0
    let failed = 0

    for (const calc of calculations) {
      // Only update if recommendation is not 'keep'
      if (calc.recommendation !== 'keep') {
        try {
          await this.applyReorderPoint(calc.ingredient_id)
          updated++
        } catch (err) {
          this.logger.error({ error: err, ingredientId: calc.ingredient_id }, 'Failed to apply reorder point')
          failed++
        }
      }
    }

    return { updated, failed }
  }
}
