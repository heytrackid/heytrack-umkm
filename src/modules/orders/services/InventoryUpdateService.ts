import { dbLogger } from '@/lib/logger'
import { createServiceRoleClient } from '@/utils/supabase'
import { extractFirst, ensureArray } from '@/lib/type-guards'
import type { TablesInsert, TablesUpdate } from '@/types/supabase-generated'
import { InventoryAlertService } from '@/services/inventory/InventoryAlertService'

/**
 * Recipe ingredients query result type
 */
interface RecipeIngredientsQueryResult {
  recipe_ingredients: Array<{
    quantity: number
    ingredient: Array<{
      id: string
      current_stock: number | null
    }>
  }>
}

/**
 * Service for updating inventory after order confirmation
 */
export class InventoryUpdateService {
  /**
   * Update ingredient inventory after order confirmation
   */
  static async updateInventoryForOrder(
    order_id: string,
    user_id: string,
    items: Array<{
      recipe_id: string
      quantity: number
    }>
  ): Promise<void> {
    try {
      const supabase = createServiceRoleClient()
      
      // This would be called when order status changes to 'in_production'
      for (const item of items) {
        const { data: recipe, error } = await supabase
          .from('recipes')
          .select(`
            recipe_ingredients (
              quantity,
              ingredient:ingredients (
                id,
                current_stock
              )
            )
          `)
          .eq('id', item.recipe_id)
          .single()

        if (error || !recipe) {continue}

        const typedRecipe = recipe as unknown as RecipeIngredientsQueryResult

        // Update ingredient stock
        for (const ri of typedRecipe.recipe_ingredients || []) {
          // Supabase returns arrays for joined data, extract safely
          const ingredient = extractFirst(ri.ingredient)
          if (ingredient) {
            const usedQuantity = ri.quantity * item.quantity
            const currentStock = ingredient.current_stock ?? 0
            const newStock = Math.max(0, currentStock - usedQuantity)

            const ingredientUpdate: TablesUpdate<'ingredients'> = {
              current_stock: newStock,
              updated_at: new Date().toISOString()
            }

            const { error: updateError } = await supabase
              .from('ingredients')
              .update(ingredientUpdate)
              .eq('id', ingredient.id)

            if (updateError) {
              dbLogger.error({ err: updateError }, 'Error updating ingredient stock')
            }

            // Create stock transaction record
            const stockTransaction: TablesInsert<'stock_transactions'> = {
              ingredient_id: ingredient.id,
              type: 'USAGE',
              quantity: -usedQuantity, // Negative for usage
              reference: order_id,
              notes: `Used for order production`,
              user_id: user_id
            }

            await supabase
              .from('stock_transactions')
              .insert(stockTransaction)

            // Check and create inventory alert if needed (async, don't wait)
            const alertService = new InventoryAlertService()
            alertService.checkIngredientAlert(ingredient.id, user_id)
              .catch(err => {
                dbLogger.error({ error: err }, 'Failed to check inventory alert')
              })
          }
        }
      }
    } catch (err: unknown) {
      dbLogger.error({ error: err }, 'Error updating inventory for order')
      throw new Error('Failed to update inventory')
    }
  }
}
