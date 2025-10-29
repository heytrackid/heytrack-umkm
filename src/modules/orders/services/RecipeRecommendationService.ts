import 'server-only'
import { dbLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase-generated'
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
              price
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
      type Order = Database['public']['Tables']['orders']['Row']
      type OrderItem = Database['public']['Tables']['order_items']['Row']
      type Recipe = Database['public']['Tables']['recipes']['Row']

      type OrderQueryResult = Order & {
        order_items: Array<OrderItem & {
          recipe: Pick<Recipe, 'id' | 'name' | 'category' | 'selling_price'>[] | null
        }> | null
      }

      // Analyze order patterns - use type instead of interface
      type RecipeFrequencyData = {
        count: number
        recipe: {
          id: string
          name: string
          category: string | null
          price: number | null
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
                  price: recipe.selling_price
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
        .map(([recipeId, data]) => ({
          id: data.recipe.id,
          name: data.recipe.name,
          category: data.recipe.category,
          servings: 1, // Default
          price: data.recipe.price || 0,
          hpp_cost: 0, // Would need to calculate
          margin: 0, // Would need to calculate
          is_available: true, // Would need to check
          estimated_prep_time: 0 // Would need to calculate
        } as RecipeOption))

      return recommendations
    } catch (err: unknown) {
      dbLogger.error({ error: err }, 'Error getting recipe recommendations')
      return []
    }
  }
}
