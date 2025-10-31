// @ts-nocheck
import 'server-only'
import { dbLogger } from '@/lib/logger'
import { createServiceRoleClient } from '@/utils/supabase/service-role'
import { extractFirst } from '@/lib/type-guards'
import type { Database, Tables, TablesInsert, RecipesTable, RecipeIngredientsTable, IngredientsTable } from '@/types/database'
import { InventoryAlertService } from '@/services/inventory/InventoryAlertService'

type Recipe = RecipesTable
type RecipeIngredient = RecipeIngredientsTable
type Ingredient = IngredientsTable

/**
 * Recipe ingredients query result type
 * Uses generated types as base
 */
type RecipeIngredientsQueryResult = Recipe & {
  recipe_ingredients: Array<RecipeIngredient & {
    ingredient: Array<Pick<Ingredient, 'id' | 'current_stock'>>  // Supabase returns arrays
  }>
}

/**
 * Type guard for recipe ingredients query result
 */
function isRecipeIngredientsResult(data: unknown): data is RecipeIngredientsQueryResult {
  if (!data || typeof data !== 'object') {return false}
  const recipe = data as RecipeIngredientsQueryResult
  return (
    typeof recipe.id === 'string' &&
    Array.isArray(recipe.recipe_ingredients)
  )
}

/**
 * Service for updating inventory after order confirmation
 * SERVER-ONLY: Uses service role client for bypassing RLS
 */
export class InventoryUpdateService {
  /**
   * Update ingredient inventory after order confirmation
   */
  static async updateInventoryForOrder(
    order_id: string,
    user_id: string,
    items: Array<{
      recipe_id: string
      quantity: number
    }>
  ): Promise<void> {
    try {
      const supabase = createServiceRoleClient()
      
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

        if (error || !recipe) {continue}

        if (!isRecipeIngredientsResult(recipe)) {
          dbLogger.error({ recipe }, 'Invalid recipe data structure')
          continue
        }

        const typedRecipe = recipe

        // ✅ FIX: Only create stock transaction, let trigger handle stock update
        for (const ri of typedRecipe.recipe_ingredients || []) {
          // Supabase returns arrays for joined data, extract safely
          const ingredient = extractFirst(ri.ingredient)
          if (ingredient) {
            const usedQuantity = ri.quantity * item.quantity

            // Create stock transaction record - trigger will auto-update current_stock
            const stockTransaction: TablesInsert<'stock_transactions'> = {
              ingredient_id: ingredient.id,
              type: 'USAGE',
              quantity: usedQuantity, // Positive value, trigger handles the deduction
              reference: order_id,
              notes: `Used for order production`,
              user_id
            }

            const { error: transactionError } = await supabase
              .from('stock_transactions')
              .insert(stockTransaction)

            if (transactionError) {
              dbLogger.error({ error: transactionError }, 'Error creating stock transaction')
              continue
            }

            // Check and create inventory alert if needed (async, don't wait)
            const alertService = new InventoryAlertService()
            alertService.checkIngredientAlert(ingredient.id, user_id)
              .catch(err => {
                dbLogger.error({ error: err }, 'Failed to check inventory alert')
              })
          }
        }
      }
    } catch (error: unknown) {
      dbLogger.error({ error }, 'Error updating inventory for order')
      throw new Error('Failed to update inventory')
    }
  }
}
