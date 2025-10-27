import { dbLogger } from '@/lib/logger'
import supabase from '@/utils/supabase'

/**
 * Recipe with ingredients for validation
 */
interface RecipeValidationQueryResult {
  id: string
  name: string
  recipe_ingredients: Array<{
    quantity: number
    unit: string
    ingredient: Array<{
      id: string
      name: string
      current_stock: number | null
      reorder_point: number | null
      unit_type: string | null
      is_active: boolean | null
    }>
  }>
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

        const typedRecipe = recipe as RecipeValidationQueryResult

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
