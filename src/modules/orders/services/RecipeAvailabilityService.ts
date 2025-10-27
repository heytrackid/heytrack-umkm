import { dbLogger } from '@/lib/logger'
import supabase from '@/utils/supabase'
import type { RecipeOption } from './OrderRecipeService'

/**
 * Service for handling recipe availability and ingredient checking
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
      const currentStock = ri.ingredient.current_stock ?? 0 || 0
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
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select(`
          id,
          name,
          category,
          servings,
          description,
          price,
          margin,
          prep_time,
          cook_time,
          is_active,
          recipe_ingredients!inner (
            quantity,
            unit,
            ingredient:ingredients (
              id,
              name,
              current_stock,
              reorder_point,
              unit_cost,
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
          // Use recipe price directly (no HPP calculation)
          const price = recipe.price || 0
          const estimatedMargin = recipe.margin || 0.3 // Default 30% margin

          // Check ingredient availability
          const isAvailable = this.checkIngredientAvailability(recipe.recipe_ingredients)

          return {
            id: recipe.id,
            name: recipe.name,
            category: recipe.category,
            servings: recipe.servings,
            description: recipe.description,
            price,
            hpp_cost: price * 0.7, // Estimate cost as 70% of price
            margin: estimatedMargin,
            is_available: isAvailable,
            estimated_prep_time: (recipe.prep_time || 0) + (recipe.cook_time || 0)
          }
        })
      )

      return recipeOptions
    } catch (err: unknown) {
      dbLogger.error({ error: err }, 'Error fetching available recipes')
      throw new Error('Failed to fetch available recipes')
    }
  }
}
