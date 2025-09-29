import { supabase } from '@/lib/supabase'
import type { RecipeOption } from './OrderRecipeService'

/**
 * Service for handling recipe recommendations based on order history
 */
export class RecipeRecommendationService {
  /**
   * Get recipe recommendations based on order history
   */
  static async getRecipeRecommendations(
    customer_name?: string,
    limit: number = 5
  ): Promise<RecipeOption[]> {
    try {
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
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(50) // Get recent orders

      const { data: orders, error } = await query

      if (error) throw error
      if (!orders) return []

      // Analyze order patterns
      const recipeFrequency = new Map<string, { count: number; recipe: any }>()

      orders.forEach(order => {
        order.order_items?.forEach((item: any) => {
          if (item.recipe) {
            const existing = recipeFrequency.get(item.recipe.id)
            if (existing) {
              existing.count += item.quantity
            } else {
              recipeFrequency.set(item.recipe.id, {
                count: item.quantity,
                recipe: item.recipe
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
        }))

      return recommendations
    } catch (error) {
      console.error('Error getting recipe recommendations:', error)
      return []
    }
  }
}
