import 'server-only'
import { dbLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'
import { RecipeAvailabilityService } from '@/services/recipes/RecipeAvailabilityService'
import { typed } from '@/types/type-utilities'

/**
 * Inventory Restock Service
 * Handles restock suggestions and inventory management
 * SERVER-ONLY: Uses server client for database operations
 */
export class InventoryRestockService {
  /**
   * Get restock suggestions for ingredients that are low in stock
   */
  static async getRestockSuggestions(userId: string): Promise<Array<{
    ingredient_id: string
    ingredient_name: string
    current_stock: number
    reserved_stock: number
    available_stock: number
    reorder_point: number
    suggested_order_quantity: number
    lead_time_days: number | null
    urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
    reason: string
  }>> {
    try {
      // Use the existing RecipeAvailabilityService for restock suggestions
      return await RecipeAvailabilityService.getRestockSuggestions(userId)
    } catch (err) {
      dbLogger.error({ error: err, userId }, 'Failed to get restock suggestions')
      throw err
    }
  }

  /**
   * Get ingredients that need restocking based on current stock levels
   */
  static async getLowStockIngredients(userId: string): Promise<Array<{
    ingredient_id: string
    ingredient_name: string
    current_stock: number
    reorder_point: number
    unit: string
    lead_time_days: number | null
  }>> {
    try {
      const client = await createClient()
      const supabase = typed(client)

      // Get ingredients below reorder point or out of stock
      const { data: ingredients, error } = await supabase
        .from('ingredients')
        .select('id, name, current_stock, reorder_point, lead_time_days, unit')
        .eq('user_id', userId)
        .or('current_stock.lte.reorder_point,current_stock.eq.0')

      if (error || !ingredients) {
        throw new Error('Failed to fetch low stock ingredients')
      }

      return ingredients.map(ing => ({
        ingredient_id: ing.id,
        ingredient_name: ing.name,
        current_stock: ing.current_stock ?? 0,
        reorder_point: ing.reorder_point ?? 0,
        unit: ing.unit,
        lead_time_days: ing.lead_time_days
      }))

    } catch (err) {
      dbLogger.error({ error: err, userId }, 'Failed to get low stock ingredients')
      throw err
    }
  }

  /**
   * Calculate suggested order quantities for ingredients
   */
  static calculateSuggestedOrderQuantity(
    currentStock: number,
    reorderPoint: number,
    bufferPercentage = 0.5
  ): number {
    if (currentStock >= reorderPoint) {
      return 0
    }

    const targetStock = reorderPoint + (reorderPoint * bufferPercentage)
    const suggestedQuantity = Math.max(0, targetStock - currentStock)

    return Math.ceil(suggestedQuantity)
  }
}