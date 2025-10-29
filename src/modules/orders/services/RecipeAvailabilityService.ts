import 'server-only'
import { dbLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase-generated'
import type { RecipeOption } from '../types'

/**
 * Service for handling recipe availability and ingredient checking
 * SERVER-ONLY: Uses server client for database operations
 */
export class RecipeAvailabilityService {
  /**
   * Check if ingredients are available for production
   */
  static checkIngredientAvailability(recipeIngredients: Array<{
    quantity: number
    ingredient: {
      is_active: boolean
      current_stock: number | null
      reorder_point: number | null
    } | null
  }>): boolean {
    return recipeIngredients.every(ri => {
      if (!ri.ingredient?.is_active) {return false}

      // Check if current stock is above reorder point
      const currentStock = (ri.ingredient.current_stock ?? 0) || 0
      const reorderPoint = ri.ingredient.reorder_point || 0
      const requiredQuantity = ri.quantity || 0

      return currentStock >= Math.max(reorderPoint, requiredQuantity)
    })
  }

  /**
   * Get available recipes for order selection
   */
  static async getAvailableRecipes(): Promise<RecipeOption[]> {
    try {
      const supabase = await createClient()
      
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select(`
          id,
          name,
          category,
          servings,
          description,
          selling_price,
          is_active,
          recipe_ingredients!inner (
            quantity,
            unit,
            ingredient:ingredients (
              id,
              name,
              current_stock,
              reorder_point,
              is_active
            )
          )
        `)
        .eq('is_active', true)
        .order('name')

      if (error) {throw error}
      if (!recipes) {return []}

      // Process recipes and check availability
      const recipeOptions: RecipeOption[] = await Promise.all(
        recipes.map(async (recipe) => {
          // Use recipe selling_price
          const price = recipe.selling_price || 0
          const estimatedMargin = 0.3 // Default 30% margin

          // Check ingredient availability
          const isAvailable = this.checkIngredientAvailability(recipe.recipe_ingredients as any)

          return {
            id: recipe.id,
            name: recipe.name,
            category: recipe.category,
            servings: recipe.servings ?? 1,
            description: recipe.description,
            selling_price: price,
            cost_per_unit: recipe.cost_per_unit || (price * 0.7), // Use DB value or estimate
            margin_percentage: recipe.margin_percentage || estimatedMargin,
            is_available: isAvailable,
            prep_time: recipe.prep_time || null,
            cook_time: recipe.cook_time || null
          } as RecipeOption
        })
      )

      return recipeOptions
    } catch (err: unknown) {
      dbLogger.error({ error: err }, 'Error fetching available recipes')
      throw new Error('Failed to fetch available recipes')
    }
  }
}
