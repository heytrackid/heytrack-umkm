import { Database } from '@/types'
import type { CostBreakdown, IngredientCost, OperationalCost } from '@/types/hpp-tracking'
import { createSupabaseClient } from './supabase'
import { validateHPPCalculation } from './business-validation'
import { dbLogger } from './logger'

type Recipe = Database['public']['Tables']['recipes']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']
type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']
type OperationalCostRow = Database['public']['Tables']['operational_costs']['Row']

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
    // Basic validation
    if (!recipe.id || !recipe.name) {
      throw new Error('Recipe must have valid id and name')
    }

    if (!recipe.recipe_ingredients || recipe.recipe_ingredients.length === 0) {
      throw new Error('Recipe must have at least one ingredient')
    }

    // Validate ingredients data
    const validatedIngredients = recipe.recipe_ingredients.map((recipeIngredient) => {
      if (!recipeIngredient.ingredients) {
        throw new Error(`Recipe ingredient missing ingredient data`)
      }

      const ingredient = recipeIngredient.ingredients
      if (!ingredient.id || !ingredient.name) {
        throw new Error(`Ingredient ${ingredient.id || 'unknown'} missing required data`)
      }

      if (!ingredient.price_per_unit || ingredient.price_per_unit <= 0) {
        throw new Error(`Ingredient ${ingredient.name} has invalid price`)
      }

      if (!recipeIngredient.quantity || recipeIngredient.quantity <= 0) {
        throw new Error(`Recipe ingredient ${ingredient.name} has invalid quantity`)
      }

      return {
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        quantity: recipeIngredient.quantity,
        unit: recipeIngredient.unit,
        pricePerUnit: ingredient.price_per_unit,
        totalCost: recipeIngredient.quantity * ingredient.price_per_unit,
        percentage: 0 // Will be calculated after total cost
      }
    })

    const totalCost = validatedIngredients.reduce((sum: number, item) => sum + item.totalCost, 0)
    const servings = recipe.servings || 1
    const costPerServing = totalCost / servings
    const costPerUnit = totalCost // For single unit recipes

    // Calculate percentage for each ingredient
    validatedIngredients.forEach((item) => {
      item.percentage = totalCost > 0 ? (item.totalCost / totalCost) * 100 : 0
    })

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      servings: servings,
      totalCost: totalCost,
      costPerServing: costPerServing,
      costPerUnit: costPerUnit,
      ingredientBreakdown: validatedIngredients
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
      const availableStock = ingredient.current_stock || 0

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
    return ingredients.filter(ingredient => (ingredient.current_stock ?? 0) <= (ingredient.min_stock || 0))
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
    const safetyStock = ingredient.min_stock || 0
    const reorderPoint = leadTimeUsage + safetyStock

    // Simple EOQ calculation (simplified version)
    const monthlyDemand = averageUsagePerMonth
    const economicOrderQuantity = Math.sqrt(monthlyDemand * 2) // Simplified EOQ

    const currentStock = ingredient.current_stock || 0
    const suggestedOrder = Math.max(economicOrderQuantity, reorderPoint - currentStock)

    return {
      reorderPoint,
      economicOrderQuantity,
      suggestedOrder: Math.max(0, suggestedOrder)
    }
  }
}

// New interface for HPP calculation result (for historical tracking)
export interface HPPCalculationResult {
  total_hpp: number
  material_cost: number
  operational_cost: number
  breakdown: CostBreakdown
}

/**
 * Calculate HPP for historical tracking with operational costs
 * This function calculates the complete HPP including material and operational costs
 */
export async function calculateHPP(recipeId: string, userId: string): Promise<HPPCalculationResult> {
  const supabase = createSupabaseClient()

  // 1. Get recipe with ingredients
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (
        *,
        ingredients (*)
      )
    `)
    .eq('id', recipeId)
    .eq('user_id', userId)
    .single()

  if (recipeError || !recipe) {
    throw new Error(`Failed to fetch recipe: ${recipeError?.message || 'Recipe not found'}`)
  }

  // 2. Calculate material cost from ingredients
  const ingredientBreakdown: IngredientCost[] = []
  let materialCost = 0

  if (recipe.recipe_ingredients && Array.isArray(recipe.recipe_ingredients)) {
    for (const recipeIngredient of recipe.recipe_ingredients) {
      const ingredient = recipeIngredient.ingredients
      if (ingredient) {
        const cost = recipeIngredient.quantity * ingredient.price_per_unit
        materialCost += cost

        ingredientBreakdown.push({
          id: ingredient.id,
          name: ingredient.name,
          cost: cost,
          percentage: 0 // Will calculate after total
        })
      }
    }
  }

  // 3. Get operational costs for the user (last 30 days to calculate monthly average)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: operationalCosts, error: opCostError } = await supabase
    .from('operational_costs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', thirtyDaysAgo.toISOString())

  if (opCostError) {
    dbLogger.warn({ err: opCostError }, 'Failed to fetch operational costs')
  }

  // 4. Calculate monthly operational cost
  const operationalBreakdown: OperationalCost[] = []
  let monthlyOpCost = 0

  if (operationalCosts && operationalCosts.length > 0) {
    // Group by category and sum
    const categoryTotals = new Map<string, number>()

    for (const cost of operationalCosts) {
      const category = cost.category || 'Other'
      const amount = calculateMonthlyCost(cost)
      categoryTotals.set(category, (categoryTotals.get(category) || 0) + amount)
      monthlyOpCost += amount
    }

    // Convert to breakdown array
    for (const [category, cost] of categoryTotals.entries()) {
      operationalBreakdown.push({
        category,
        cost,
        percentage: 0 // Will calculate after total
      })
    }
  }

  // 5. Estimate production volume per month
  // Get production history for this recipe in the last 30 days
  const { data: productions } = await supabase
    .from('productions')
    .select('quantity')
    .eq('recipe_id', recipeId)
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString())

  let estimatedMonthlyProduction = 100 // Default fallback

  if (productions && productions.length > 0) {
    const totalProduced = productions.reduce((sum: number, p: any) => sum + (p.quantity || 0), 0)
    estimatedMonthlyProduction = Math.max(totalProduced, 1) // Avoid division by zero
  }

  // 6. Calculate operational cost per unit
  const operationalCostPerUnit = monthlyOpCost / estimatedMonthlyProduction

  // Adjust operational breakdown to per-unit costs
  const operationalBreakdownPerUnit = operationalBreakdown.map(item => ({
    ...item,
    cost: item.cost / estimatedMonthlyProduction
  }))

  // 7. Calculate total HPP
  const totalHPP = materialCost + operationalCostPerUnit

  // 8. Calculate percentages
  if (totalHPP > 0) {
    ingredientBreakdown.forEach(item => {
      item.percentage = (item.cost / totalHPP) * 100
    })

    operationalBreakdownPerUnit.forEach(item => {
      item.percentage = (item.cost / totalHPP) * 100
    })
  }

  return {
    total_hpp: totalHPP,
    material_cost: materialCost,
    operational_cost: operationalCostPerUnit,
    breakdown: {
      ingredients: ingredientBreakdown,
      operational: operationalBreakdownPerUnit
    }
  }
}

/**
 * Calculate monthly cost from operational cost entry
 * Handles recurring costs with different frequencies
 */
function calculateMonthlyCost(cost: OperationalCostRow): number {
  const amount = cost.amount || 0

  if (!cost.recurring) {
    // One-time cost, return as-is
    return amount
  }

  // Handle recurring costs based on frequency
  const frequency = cost.frequency?.toLowerCase() || 'monthly'

  switch (frequency) {
    case 'daily':
      return amount * 30
    case 'weekly':
      return amount * 4
    case 'monthly':
      return amount
    case 'quarterly':
      return amount / 3
    case 'yearly':
      return amount / 12
    default:
      return amount
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