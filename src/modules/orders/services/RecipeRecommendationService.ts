import 'server-only'
import { dbLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'
import type { OrdersTable, OrderItemsTable, RecipesTable } from '@/types/database'
import type { RecipeOption } from '../types'



/**
 * Service for handling recipe recommendations based on order history
 * SERVER-ONLY: Uses server client for database operations
 */
export class RecipeRecommendationService {
  /**
   * Get recipe recommendations based on order history
   */
  static async getRecipeRecommendations(
    customer_name?: string,
    limit = 5
  ): Promise<RecipeOption[]> {
    try {
      const supabase = await createClient()
      let query = supabase
        .from('orders')
        .select(`
          order_items (
            recipe_id,
            quantity,
            recipe:recipes (
              id,
              name,
              category,
              selling_price,
              cost_per_unit,
              margin_percentage,
              prep_time,
              cook_time,
              servings
            )
          )
        `)

      if (customer_name) {
        query = query.eq('customer_name', customer_name)
      }

      query = query
        .eq('status', 'DELIVERED')
        .order('created_at', { ascending: false })
        .limit(50) // Get recent orders

      const { data: orders, error } = await query

      if (error) {throw error}
      if (!orders) {return []}

      // Define types for order query result using generated types
      type Order = OrdersTable
      type OrderItem = OrderItemsTable
      type Recipe = RecipesTable

      type OrderQueryResult = Order & {
        order_items: Array<OrderItem & {
          recipe: Array<Pick<Recipe, 'id' | 'name' | 'category' | 'selling_price' | 'cost_per_unit' | 'margin_percentage' | 'prep_time' | 'cook_time'>> | null
        }> | null
      }

      // Analyze order patterns - use type instead of interface
      interface RecipeFrequencyData {
        count: number
        recipe: {
          id: string
          name: string
          category: string | null
          selling_price: number | null
          cost_per_unit: number | null
          margin_percentage: number | null
          prep_time: number | null
          cook_time: number | null
        }
      }
      const recipeFrequency = new Map<string, RecipeFrequencyData>()

      orders.forEach((order: unknown) => {
        const typedOrder = order as OrderQueryResult
        typedOrder.order_items?.forEach((item) => {
          // Supabase returns arrays for joins, get first element
          const recipe = item.recipe?.[0]
          if (recipe) {
            const existing = recipeFrequency.get(recipe.id)
            if (existing) {
              existing.count += item.quantity
            } else {
              recipeFrequency.set(recipe.id, {
                count: item.quantity,
                recipe: {
                  id: recipe.id,
                  name: recipe.name,
                  category: recipe.category,
                  selling_price: recipe.selling_price,
                  cost_per_unit: recipe.cost_per_unit,
                  margin_percentage: recipe.margin_percentage,
                  prep_time: recipe.prep_time,
                  cook_time: recipe.cook_time
                }
              })
            }
          }
        })
      })

      // Sort by frequency and convert to RecipeOption format
      const recommendations = Array.from(recipeFrequency.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, limit)
        .map(([, data]) => ({
          id: data.recipe.id,
          name: data.recipe.name,
          category: data.recipe.category,
          servings: 1, // Default
          selling_price: data.recipe.selling_price ?? 0,
          cost_per_unit: data.recipe.cost_per_unit ?? null,
          margin_percentage: data.recipe.margin_percentage ?? null,
          is_available: true, // Would need to check
          prep_time: data.recipe.prep_time ?? null,
          cook_time: data.recipe.cook_time ?? null
        } as RecipeOption))

      return recommendations
    } catch (err: unknown) {
      dbLogger.error({ error: err }, 'Error getting recipe recommendations')
      return []
    }
  }
}
