import { Database } from '@/types'

type Recipe = Database['public']['Tables']['recipes']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']
type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']

export interface RecipeWithIngredients extends Recipe {
  recipe_ingredients: Array<
    RecipeIngredient & {
      ingredients: Ingredient
    }
  >
}

export interface HPPCalculation {
  recipeId: string
  recipeName: string
  servings: number
  totalCost: number
  costPerServing: number
  costPerUnit: number
  ingredientBreakdown: Array<{
    ingredientId: string
    ingredientName: string
    quantity: number
    unit: string
    pricePerUnit: number
    totalCost: number
    percentage: number
  }>
  profitMargin?: number
  suggestedPrice?: number
}

export class HPPCalculator {
  /**
   * Calculate HPP (Harga Pokok Produksi) for a recipe
   */
  static calculateRecipeHPP(recipe: RecipeWithIngredients): HPPCalculation {
    const ingredientBreakdown = recipe.recipe_ingredients.map((recipeIngredient) => {
      const ingredient = recipeIngredient.ingredients
      const quantity = recipeIngredient.quantity
      const pricePerUnit = ingredient.price_per_unit
      const totalCost = quantity * pricePerUnit

      return {
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        quantity: quantity,
        unit: recipeIngredient.unit,
        pricePerUnit: pricePerUnit,
        totalCost: totalCost,
        percentage: 0 // Will be calculated after total cost
      }
    })

    const totalCost = ingredientBreakdown.reduce((sum, item) => sum + item.totalCost, 0)
    const costPerServing = totalCost / recipe.servings
    const costPerUnit = totalCost // For single unit recipes

    // Calculate percentage for each ingredient
    ingredientBreakdown.forEach((item) => {
      item.percentage = totalCost > 0 ? (item.totalCost / totalCost) * 100 : 0
    })

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      servings: recipe.servings,
      totalCost: totalCost,
      costPerServing: costPerServing,
      costPerUnit: costPerUnit,
      ingredientBreakdown: ingredientBreakdown
    }
  }

  /**
   * Calculate suggested selling price with profit margin
   */
  static calculateSuggestedPrice(
    hpp: HPPCalculation,
    profitMarginPercentage: number
  ): HPPCalculation {
    const suggestedPrice = hpp.costPerUnit * (1 + profitMarginPercentage / 100)

    return {
      ...hpp,
      profitMargin: profitMarginPercentage,
      suggestedPrice: suggestedPrice
    }
  }

  /**
   * Calculate batch production cost
   */
  static calculateBatchCost(
    hpp: HPPCalculation,
    batchQuantity: number
  ): {
    totalBatchCost: number
    costPerUnit: number
    totalUnits: number
  } {
    const totalUnits = hpp.servings * batchQuantity
    const totalBatchCost = hpp.totalCost * batchQuantity
    const costPerUnit = hpp.costPerUnit

    return {
      totalBatchCost,
      costPerUnit,
      totalUnits
    }
  }

  /**
   * Calculate profit margin from selling price
   */
  static calculateProfitMargin(costPrice: number, sellingPrice: number): {
    profitAmount: number
    profitPercentage: number
  } {
    const profitAmount = sellingPrice - costPrice
    const profitPercentage = costPrice > 0 ? (profitAmount / costPrice) * 100 : 0

    return {
      profitAmount,
      profitPercentage
    }
  }

  /**
   * Check ingredient availability for production
   */
  static checkIngredientAvailability(
    recipe: RecipeWithIngredients,
    productionQuantity: number
  ): {
    canProduce: boolean
    maxProducible: number
    missingIngredients: Array<{
      ingredientName: string
      required: number
      available: number
      shortage: number
      unit: string
    }>
  } {
    let canProduce = true
    let maxProducible = Infinity
    const missingIngredients: Array<{
      ingredientName: string
      required: number
      available: number
      shortage: number
      unit: string
    }> = []

    recipe.recipe_ingredients.forEach((recipeIngredient) => {
      const ingredient = recipeIngredient.ingredients
      const requiredQuantity = recipeIngredient.quantity * productionQuantity
      const availableStock = ingredient.current_stock

      if (availableStock < requiredQuantity) {
        canProduce = false
        missingIngredients.push({
          ingredientName: ingredient.name,
          required: requiredQuantity,
          available: availableStock,
          shortage: requiredQuantity - availableStock,
          unit: recipeIngredient.unit
        })
      }

      // Calculate max producible quantity based on this ingredient
      const maxFromThisIngredient = Math.floor(availableStock / recipeIngredient.quantity)
      maxProducible = Math.min(maxProducible, maxFromThisIngredient)
    })

    if (maxProducible === Infinity) {
      maxProducible = 0
    }

    return {
      canProduce,
      maxProducible,
      missingIngredients
    }
  }

  /**
   * Calculate low stock ingredients that need restocking
   */
  static checkLowStockIngredients(ingredients: Ingredient[]): Ingredient[] {
    return ingredients.filter(ingredient => ingredient.current_stock <= ingredient.min_stock)
  }

  /**
   * Calculate reorder quantity suggestion
   */
  static calculateReorderQuantity(
    ingredient: Ingredient,
    averageUsagePerMonth: number,
    leadTimeDays: number = 7
  ): {
    reorderPoint: number
    economicOrderQuantity: number
    suggestedOrder: number
  } {
    const dailyUsage = averageUsagePerMonth / 30
    const leadTimeUsage = dailyUsage * leadTimeDays
    const safetyStock = ingredient.min_stock
    const reorderPoint = leadTimeUsage + safetyStock

    // Simple EOQ calculation (can be enhanced with carrying costs, order costs)
    const monthlyDemand = averageUsagePerMonth
    const economicOrderQuantity = Math.sqrt(2 * monthlyDemand * 100 / (ingredient.price_per_unit * 0.2)) // Assuming 20% carrying cost

    const suggestedOrder = Math.max(economicOrderQuantity, reorderPoint - ingredient.current_stock)

    return {
      reorderPoint,
      economicOrderQuantity,
      suggestedOrder: Math.max(0, suggestedOrder)
    }
  }
}

// Utility functions for formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

export const formatNumber = (number: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number)
}

export const formatPercentage = (percentage: number, decimals: number = 1): string => {
  return `${formatNumber(percentage, decimals)}%`
}