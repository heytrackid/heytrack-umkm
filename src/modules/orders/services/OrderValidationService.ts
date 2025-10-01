import { supabase } from '@/lib/supabase'

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

        // Check each ingredient
        for (const ri of recipe.recipe_ingredients || []) {
          if (!ri.ingredient || !ri.ingredient.is_active) {
            errors.push(`Ingredient ${ri.ingredient?.name || 'unknown'} untuk ${recipe.name} tidak tersedia`)
            continue
          }

          const requiredQuantity = ri.quantity * item.quantity
          const currentStock = ri.ingredient.current_stock ?? 0 || 0
          const reorderPoint = ri.ingredient.reorder_point || 0

          if (currentStock < requiredQuantity) {
            errors.push(
              `Stock ${ri.ingredient.name} tidak cukup. Dibutuhkan: ${requiredQuantity}, Tersedia: ${currentStock}`
            )
          } else if (currentStock - requiredQuantity < reorderPoint) {
            warnings.push(
              `Stock ${ri.ingredient.name} akan di bawah reorder point setelah produksi`
            )
          }
        }
      }

      return {
        isValid: errors.length === 0,
        warnings,
        errors
      }
    } catch (error: any) {
      console.error('Error validating order against inventory:', error)
      return {
        isValid: false,
        warnings,
        errors: ['Gagal memvalidasi inventory']
      }
    }
  }
}
