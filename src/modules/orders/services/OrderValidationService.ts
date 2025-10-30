import { dbLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase-generated'

type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']

/**
 * Recipe with ingredients for validation (query result structure)
 * Uses generated types as base
 */
type RecipeValidationQueryResult = Recipe & {
  recipe_ingredients: Array<RecipeIngredient & {
    ingredient: Ingredient[]  // Supabase returns arrays for joins
  }>
}

/**
 * Type guard for recipe validation query result
 */
function isRecipeValidationResult(data: unknown): data is RecipeValidationQueryResult {
  if (!data || typeof data !== 'object') {return false}
  const recipe = data as RecipeValidationQueryResult
  return (
    typeof recipe.id === 'string' &&
    typeof recipe.name === 'string' &&
    Array.isArray(recipe.recipe_ingredients)
  )
}

/**
 * Service for handling order validation against inventory
 */
export class OrderValidationService {
  /**
   * Validate order items against inventory
   */
  static async validateOrderAgainstInventory(
    items: Array<{
      recipe_id: string
      quantity: number
    }>
  ): Promise<{
    isValid: boolean
    warnings: string[]
    errors: string[]
  }> {
    const warnings: string[] = []
    const errors: string[] = []

    try {
      const supabase = await createClient()
      
      for (const item of items) {
        const { data: recipe, error } = await supabase
          .from('recipes')
          .select(`
            id,
            name,
            recipe_ingredients (
              quantity,
              unit,
              ingredient:ingredients (
                id,
                name,
                current_stock,
                reorder_point,
                unit_type,
                is_active
              )
            )
          `)
          .eq('id', item.recipe_id)
          .single()

        if (error || !recipe) {
          errors.push(`Recipe dengan ID ${item.recipe_id} tidak ditemukan`)
          continue
        }

        if (!isRecipeValidationResult(recipe)) {
          dbLogger.error({ recipe }, 'Invalid recipe data structure')
          errors.push(`Data recipe ${item.recipe_id} tidak valid`)
          continue
        }

        const typedRecipe = recipe

        // Check each ingredient
        for (const ri of typedRecipe.recipe_ingredients || []) {
          // Supabase returns arrays for joined data, get first element
          const ingredient = ri.ingredient?.[0]
          
          if (!ingredient?.is_active) {
            errors.push(`Ingredient ${ingredient?.name || 'unknown'} untuk ${typedRecipe.name} tidak tersedia`)
            continue
          }

          const requiredQuantity = ri.quantity * item.quantity
          const currentStock = ingredient.current_stock ?? 0
          const reorderPoint = ingredient.reorder_point ?? 0

          if (currentStock < requiredQuantity) {
            errors.push(
              `Stock ${ingredient.name} tidak cukup. Dibutuhkan: ${requiredQuantity}, Tersedia: ${currentStock}`
            )
          } else if (currentStock - requiredQuantity < reorderPoint) {
            warnings.push(
              `Stock ${ingredient.name} akan di bawah reorder point setelah produksi`
            )
          }
        }
      }

      return {
        isValid: errors.length === 0,
        warnings,
        errors
      }
    } catch (err: unknown) {
      dbLogger.error({ error: err }, 'Error validating order against inventory')
      return {
        isValid: false,
        warnings,
        errors: ['Gagal memvalidasi inventory']
      }
    }
  }
}
