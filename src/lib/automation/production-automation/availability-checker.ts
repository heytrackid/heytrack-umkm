/**
 * Availability Checker Module
 * Handles ingredient availability checking for production
 */

import type { Recipe, Ingredient, RecipeIngredient, AvailabilityCheck, IngredientRequirement } from '../types'

export class AvailabilityChecker {
  /**
   * Check if ingredients are available for production
   */
  static checkIngredientAvailability(
    recipe: Recipe & { recipe_ingredients: Array<RecipeIngredient & { ingredient: Ingredient }> },
    quantity: number,
    inventory: Ingredient[]
  ): AvailabilityCheck {
    const requirements: IngredientRequirement[] = recipe.recipe_ingredients.map(ri => {
      const needed = ri.quantity * quantity
      const inventoryItem = inventory.find(inv => inv.id === ri.ingredient_id)
      const available = inventoryItem?.current_stock || 0

      return {
        ingredient: ri.ingredient,
        needed,
        available,
        sufficient: available >= needed,
        shortage: Math.max(0, needed - available)
      }
    })

    return {
      canProduce: requirements.every(r => r.sufficient),
      requirements,
      totalShortage: requirements.reduce((sum, r) => sum + r.shortage, 0)
    }
  }
}
