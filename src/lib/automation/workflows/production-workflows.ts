import { automationLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'

import type { Row, Insert, Database } from '@/types/database'
import type { WorkflowContext, WorkflowResult } from '@/types/features/automation'

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Production Workflow Handlers
 * Workflow automation handlers for production-related events
 */

type ProductionBatchRow = Row<'productions'>
type StockTransactionInsert = Insert<'stock_transactions'>
type RecipeRow = Row<'recipes'>

export class ProductionWorkflowHandlers {
  /**
   * Handle production batch completed event
   * ✅ NEW: Auto-increase inventory when production is completed
   */
  static async handleProductionCompleted(context: WorkflowContext): Promise<WorkflowResult> {
    const { event, logger, supabase } = context
    const productionId = event.entityId

    logger.info({ productionId }, 'Processing production completed workflow')

    try {
      if (!supabase) {
        throw new Error('Supabase client is not available in workflow context')
      }

      // Get production batch with recipe details
      const { data: production, error: productionError } = await supabase
        .from('productions')
        .select(`
          *,
          recipes (
            id,
            name,
            category
          )
        `)
        .eq('id', productionId)
        .single()

      if (productionError || !production) {
        throw new Error(`Production batch not found: ${productionError?.message}`)
      }

      const productionData = production as ProductionBatchRow & { recipes: RecipeRow | null }

      // Auto-increase inventory for completed production
      await this.increaseInventoryFromProduction(productionData, supabase)

      logger.info({
        productionId,
        recipeId: productionData.recipe_id,
        quantity: productionData.quantity
      }, 'Production completed workflow finished - inventory increased')

      return {
        success: true,
        message: `Production batch ${productionId} completed - inventory updated`,
        data: {
          productionId,
          recipeId: productionData.recipe_id,
          quantityProduced: productionData.quantity
        }
      }

    } catch (error) {
      logger.error({ productionId, error: getErrorMessage(error) }, 'Production completed workflow failed')
      return {
        success: false,
        message: 'Failed to process production completion',
        error: getErrorMessage(error)
      }
    }
  }

  /**
   * Increase inventory when production is completed
   * ✅ NEW: Creates stock transaction to increase finished goods inventory
   */
  private static async increaseInventoryFromProduction(
    production: ProductionBatchRow & { recipes: RecipeRow | null },
    supabase: SupabaseClient<Database>
  ): Promise<void> {
    automationLogger.debug('Increasing inventory from completed production')

    if (!production.recipes) {
      automationLogger.warn({ productionId: production.id }, 'No recipe found for production batch')
      return
    }

    const recipe = production.recipes
    const quantityProduced = production.quantity ?? 0

    // For now, we'll create a stock transaction for the recipe as a "finished good"
    // In a more complex system, you might have a separate finished_goods table
    // But for simplicity, we'll use the recipe name as the "ingredient" identifier

    const stockTransaction: StockTransactionInsert = {
      ingredient_id: recipe.id, // Using recipe ID as pseudo-ingredient for finished goods
      quantity: quantityProduced, // Positive quantity = increase stock
      reference: `PRODUCTION-${production.id}`,
      total_price: (production.total_cost ?? 0), // Cost of production
      type: 'ADJUSTMENT', // Production completion is an adjustment
      unit_price: production.cost_per_unit ?? 0,
      user_id: production.user_id || 'automation-system',
      notes: `Finished goods from production batch ${production.id} - ${recipe.name}`
    }

    const { error: transactionError } = await supabase
      .from('stock_transactions')
      .insert(stockTransaction)

    if (transactionError) {
      automationLogger.error({ transactionError }, 'Failed to create production completion stock transaction')
      throw new Error(`Stock transaction creation failed: ${transactionError.message}`)
    }

    automationLogger.info({
      productionId: production.id,
      recipeName: recipe.name,
      quantityProduced
    }, 'Production completion inventory increase recorded')
  }
}