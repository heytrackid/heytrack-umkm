/**
 * HPP Calculator Module
 * Core HPP calculation logic for recipes
 */

import type {
  RecipeData,
  RecipeHPP,
  IngredientCostResult,
  LaborCostResult,
  OverheadCostResult,
  PackagingCostResult,
  OperationalCost
} from './types'

export class HPPCalculator {
  /**
   * Calculate comprehensive HPP for a recipe
   */
  static calculateRecipeHPP(recipeData: RecipeData, operationalCosts: OperationalCost[]): RecipeHPP {
    // Calculate ingredient costs
    const ingredientCosts = this.calculateIngredientCosts(recipeData.ingredients)

    // Calculate labor costs
    const laborCosts = this.calculateLaborCosts(recipeData.prepTime, recipeData.cookTime, operationalCosts)

    // Calculate overhead costs
    const overheadCosts = this.calculateOverheadCosts(recipeData.servings, recipeData.estimatedDuration, operationalCosts)

    // Calculate packaging costs
    const packagingCosts = this.calculatePackagingCosts(recipeData.packaging || [])

    // Build comprehensive HPP
    const recipeHPP: RecipeHPP = {
      id: `hpp_${recipeData.id}_${Date.now()}`,
      recipeName: recipeData.name,
      recipeId: recipeData.id,
      servings: recipeData.servings,
      components: {
        ingredients: ingredientCosts.items,
        labor: laborCosts,
        overhead: overheadCosts,
        packaging: packagingCosts.items
      },
      totalDirectCost: ingredientCosts.total + laborCosts.totalLaborCost,
      totalIndirectCost: overheadCosts.totalOverheadCost + packagingCosts.total,
      totalHPP: 0,
      hppPerServing: 0,
      suggestedSellingPrice: [],
      lastCalculated: new Date().toISOString(),
      needsRecalculation: false
    }

    // Calculate totals
    recipeHPP.totalHPP = recipeHPP.totalDirectCost + recipeHPP.totalIndirectCost
    recipeHPP.hppPerServing = recipeHPP.totalHPP / recipeData.servings

    // Generate smart pricing suggestions
    recipeHPP.suggestedSellingPrice = this.generateSmartPricing(recipeHPP.hppPerServing)

    return recipeHPP
  }

  /**
   * Calculate ingredient costs
   */
  private static calculateIngredientCosts(ingredients: any[]): IngredientCostResult {
    const items: IngredientCostResult['items'] = []
    let total = 0

    for (const ing of ingredients) {
      // Get latest price (simplified - in real implementation, this would fetch from database)
      const pricePerUnit = ing.pricePerUnit || 0
      const totalCost = (ing.quantity * pricePerUnit) / this.getUnitMultiplier(ing.unit)

      items.push({
        ingredientId: ing.ingredientId,
        ingredientName: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        pricePerUnit,
        totalCost
      })

      total += totalCost
    }

    return { items, total }
  }

  /**
   * Calculate labor costs
   */
  private static calculateLaborCosts(prepTime: number, cookTime: number, operationalCosts: OperationalCost[]): LaborCostResult {
    const hourlyRate = operationalCosts.find(cost => cost.id === 'labor_hourly_rate')?.amount || 50000 // Default Rp 50k/hour
    const totalMinutes = prepTime + cookTime
    const totalHours = totalMinutes / 60
    const totalLaborCost = totalHours * hourlyRate

    return {
      prepTime,
      cookTime,
      hourlyRate,
      totalLaborCost
    }
  }

  /**
   * Calculate overhead costs
   */
  private static calculateOverheadCosts(servings: number, durationMinutes: number, operationalCosts: OperationalCost[]): OverheadCostResult {
    // Auto-allocate overhead costs
    const electricity = this.allocateOverheadCost('electricity', servings, durationMinutes, operationalCosts)
    const gas = this.allocateOverheadCost('gas', servings, durationMinutes, operationalCosts)
    const rent = this.allocateOverheadCost('rent', servings, durationMinutes, operationalCosts)
    const depreciation = this.allocateOverheadCost('depreciation', servings, durationMinutes, operationalCosts)
    const other = this.allocateOverheadCost('other', servings, durationMinutes, operationalCosts)

    return {
      electricity,
      gas,
      rent,
      depreciation,
      other,
      totalOverheadCost: electricity + gas + rent + depreciation + other
    }
  }

  /**
   * Calculate packaging costs
   */
  private static calculatePackagingCosts(packagingItems: any[]): PackagingCostResult {
    let total = 0
    const items: PackagingCostResult['items'] = []

    for (const item of packagingItems) {
      const totalCost = item.quantity * item.costPerUnit
      items.push({
        itemName: item.name,
        quantity: item.quantity,
        unit: item.unit,
        costPerUnit: item.costPerUnit,
        totalCost
      })
      total += totalCost
    }

    return { items, total }
  }

  /**
   * Generate smart pricing suggestions
   */
  private static generateSmartPricing(hppPerServing: number) {
    return [
      {
        tier: 'economy' as const,
        price: Math.ceil((hppPerServing * 1.3) / 500) * 500, // 30% margin, rounded to 500
        margin: 30
      },
      {
        tier: 'standard' as const,
        price: Math.ceil((hppPerServing * 1.6) / 500) * 500, // 60% margin
        margin: 60
      },
      {
        tier: 'premium' as const,
        price: Math.ceil((hppPerServing * 2.0) / 1000) * 1000, // 100% margin, rounded to 1000
        margin: 100
      }
    ]
  }

  /**
   * Get unit multiplier for cost calculations
   */
  private static getUnitMultiplier(unit: string): number {
    const multipliers: Record<string, number> = {
      'g': 1000, // per kg
      'gram': 1000,
      'ml': 1000, // per liter
      'butir': 1,
      'lembar': 1,
      'kg': 1,
      'liter': 1
    }
    return multipliers[unit] || 1
  }

  /**
   * Allocate overhead cost based on servings and duration
   */
  private static allocateOverheadCost(key: string, servings: number, durationMinutes: number, operationalCosts: OperationalCost[]): number {
    // Simplified allocation based on duration and servings
    const baseCost = operationalCosts.find(cost => cost.id === `overhead_${key}`)?.amount || 0
    const durationFactor = durationMinutes / 60 // convert to hours
    const servingFactor = servings / 10 // normalized per 10 servings

    return baseCost * durationFactor * servingFactor
  }
}
