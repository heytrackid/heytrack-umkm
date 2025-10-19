// Production Cost Calculation Service
export class CostCalculationService {
  /**
   * Calculate material cost for a recipe batch
   */
  calculateMaterialCost(recipe: any, batchSize: number): number {
    if (!recipe.recipe_ingredients) return 0

    return recipe.recipe_ingredients.reduce((total: number, recipeIngredient: any) => {
      const neededQuantity = (recipeIngredient.quantity * batchSize) / recipe.servings
      const ingredientCost = recipeIngredient.ingredient?.price_per_unit || 0
      return total + (neededQuantity * ingredientCost)
    }, 0)
  }

  /**
   * Calculate labor cost based on production time
   */
  calculateLaborCost(durationMinutes: number, hourlyRate: number = 25000): number {
    const hours = durationMinutes / 60
    return hours * hourlyRate
  }

  /**
   * Calculate total production cost including overhead
   */
  calculateTotalCost(
    recipe: any,
    batchSize: number,
    durationMinutes: number,
    overheadRate: number = 0.15
  ): {
    materialCost: number
    laborCost: number
    overheadCost: number
    totalCost: number
    costPerUnit: number
  } {
    const materialCost = this.calculateMaterialCost(recipe, batchSize)
    const laborCost = this.calculateLaborCost(durationMinutes)
    const overheadCost = materialCost * overheadRate
    const totalCost = materialCost + laborCost + overheadCost
    const costPerUnit = totalCost / batchSize

    return {
      materialCost,
      laborCost,
      overheadCost,
      totalCost,
      costPerUnit
    }
  }
}

export const costCalculationService = new CostCalculationService()
