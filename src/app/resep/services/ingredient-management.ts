// Production Ingredient Management
import type { IngredientAvailability } from './production-orders-integration-types'

export class IngredientManagementService {
  /**
   * Check ingredient availability for all batches
   */
  checkIngredientAvailability(
    batchSizes: number[],
    recipe: any,
    ingredientInventory: IngredientAvailability[]
  ): {
    available: boolean
    shortages: Array<{
      ingredient_id: string
      ingredient_name: string
      required: number
      available: number
      shortage: number
    }>
  } {
    const shortages: Array<{
      ingredient_id: string
      ingredient_name: string
      required: number
      available: number
      shortage: number
    }> = []

    // Calculate total ingredients needed for all batches
    const totalIngredientNeeds: Record<string, number> = {}

    batchSizes.forEach(batchSize => {
      recipe.recipe_ingredients?.forEach((recipeIngredient: any) => {
        const needed = (recipeIngredient.quantity * batchSize) / recipe.servings
        totalIngredientNeeds[recipeIngredient.ingredient_id] =
          (totalIngredientNeeds[recipeIngredient.ingredient_id] || 0) + needed
      })
    })

    // Check availability for each ingredient
    Object.entries(totalIngredientNeeds).forEach(([ingredientId, totalNeeded]) => {
      const inventory = ingredientInventory.find(inv => inv.ingredient_id === ingredientId)

      if (!inventory) {
        shortages.push({
          ingredient_id: ingredientId,
          ingredient_name: `Unknown ingredient ${ingredientId}`,
          required: totalNeeded,
          available: 0,
          shortage: totalNeeded
        })
        return
      }

      const available = inventory.available_stock
      if (available < totalNeeded) {
        shortages.push({
          ingredient_id: ingredientId,
          ingredient_name: inventory.ingredient_name,
          required: totalNeeded,
          available,
          shortage: totalNeeded - available
        })
      }
    })

    return {
      available: shortages.length === 0,
      shortages
    }
  }

  /**
   * Create ingredient allocations for a batch
   */
  createIngredientAllocations(
    recipe: any,
    batchSize: number,
    batchId: string,
    currency: string
  ): any[] {
    if (!recipe.recipe_ingredients) return []

    return recipe.recipe_ingredients.map((recipeIngredient: any) => {
      const neededQuantity = (recipeIngredient.quantity * batchSize) / recipe.servings
      const ingredient = recipeIngredient.ingredient

      return {
        id: `alloc_${Date.now()}_${recipeIngredient.id}`,
        batch_id: batchId,
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        planned_quantity: neededQuantity,
        unit: recipeIngredient.unit,
        allocated_at: new Date().toISOString(),
        cost_per_unit: ingredient.price_per_unit || 0,
        total_cost: neededQuantity * (ingredient.price_per_unit || 0),
        currency: currency
      }
    })
  }
}

export const ingredientManagementService = new IngredientManagementService()
