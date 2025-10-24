import logger from '@/lib/logger'
import { supabase } from '@/lib/supabase'

/**
 * Service for updating inventory after order confirmation
 */
export class InventoryUpdateService {
  /**
   * Update ingredient inventory after order confirmation
   */
  static async updateInventoryForOrder(
    order_id: string,
    items: Array<{
      recipe_id: string
      quantity: number
    }>
  ): Promise<void> {
    try {
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

        if (error || !recipe) continue

        // Update ingredient stock
        for (const ri of recipe.recipe_ingredients || []) {
          if (ri.ingredient) {
            const usedQuantity = ri.quantity * item.quantity
            const newStock = Math.max(0, (ri.ingredient.current_stock ?? 0 || 0) - usedQuantity)

            await supabase
              .from('ingredients')
              .update({
                current_stock: newStock,
                updated_at: new Date().toISOString()
              })
              .eq('id', ri.ingredient.id)

            // Create stock transaction record
            await supabase
              .from('stock_transactions')
              .insert({
                ingredient_id: ri.ingredient.id,
                transaction_type: 'out',
                quantity: usedQuantity,
                reference_type: 'order',
                reference_id: order_id,
                notes: `Used for order production`,
                created_at: new Date().toISOString()
              })
          }
        }
      }
    } catch (error: any) {
      logger.error({ err: error }, 'Error updating inventory for order')
      throw new Error('Failed to update inventory')
    }
  }
}
