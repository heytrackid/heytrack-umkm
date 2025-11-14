import { apiLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'
import { DEFAULT_OPERATIONAL_COST_PERCENTAGE, ESTIMATED_DAILY_PRODUCTION, ESTIMATED_MARGIN, SUGGESTED_MARKUP } from '../constants'
import type { GeneratedRecipe, HPPCalculation, IngredientSubset } from '../types'
import { findBestIngredientMatch } from './ingredient-matcher'

function convertToBaseUnit(quantity: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === 'kg' && toUnit === 'gram') return quantity * 1000
  if (fromUnit === 'liter' && toUnit === 'ml') return quantity * 1000
  if (fromUnit === 'gram' && toUnit === 'kg') return quantity / 1000
  if (fromUnit === 'ml' && toUnit === 'liter') return quantity / 1000
  return quantity
}

export async function calculateRecipeHPP(
  recipe: GeneratedRecipe,
  availableIngredients: IngredientSubset[],
  userId: string
): Promise<HPPCalculation> {
  let totalMaterialCost = 0
  const ingredientBreakdown: HPPCalculation['ingredientBreakdown'] = []
  
  const supabase = await createClient()
  const recipeIngredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : []

  for (const recipeIng of recipeIngredients) {
    const ingredient = findBestIngredientMatch(recipeIng.name, availableIngredients)

    if (!ingredient) {
      apiLogger.warn({ ingredientName: recipeIng.name }, 'Ingredient not found in inventory')
      continue
    }

    const quantityInBaseUnit = convertToBaseUnit(recipeIng.quantity, recipeIng.unit, ingredient.unit)
    const cost = quantityInBaseUnit * ingredient.price_per_unit
    totalMaterialCost += cost

    ingredientBreakdown.push({
      name: ingredient.name,
      quantity: recipeIng.quantity,
      unit: recipeIng.unit,
      pricePerUnit: ingredient.price_per_unit,
      totalCost: cost,
      percentage: 0
    })
  }

  ingredientBreakdown.forEach((item) => {
    item.percentage = totalMaterialCost > 0 ? (item.totalCost / totalMaterialCost) * 100 : 0
  })

  const today = new Date().toISOString().split('T')[0]
  const { data: opCosts } = await supabase
    .from('operational_costs')
    .select('amount')
    .eq('user_id', userId)
    .eq('is_active', true)
    .gte('date', today)
    .lte('date', today)

  const typedOpCosts = opCosts as Array<{ amount: number }> | null
  const dailyOpCost = typedOpCosts?.reduce((sum, cost) => sum + cost.amount, 0) ?? 0
  
  const recipeServings = recipe.servings ?? 1
  const operationalCostPerBatch = dailyOpCost > 0 
    ? (dailyOpCost / ESTIMATED_DAILY_PRODUCTION) * recipeServings
    : totalMaterialCost * DEFAULT_OPERATIONAL_COST_PERCENTAGE

  const totalHPP = totalMaterialCost + operationalCostPerBatch
  const servings = recipe.servings ?? 1
  const hppPerUnit = servings > 0 ? totalHPP / servings : 0

  return {
    totalMaterialCost,
    operationalCost: operationalCostPerBatch,
    totalHPP,
    hppPerUnit,
    servings,
    ingredientBreakdown,
    breakdown: {
      materials: totalMaterialCost,
      operational: operationalCostPerBatch,
      labor: operationalCostPerBatch * 0.4,
      utilities: operationalCostPerBatch * 0.3,
      overhead: operationalCostPerBatch * 0.3
    },
    suggestedSellingPrice: hppPerUnit * SUGGESTED_MARKUP,
    estimatedMargin: ESTIMATED_MARGIN,
    note: dailyOpCost > 0 
      ? 'Operational cost based on actual data'
      : 'Operational cost estimated (30% of material cost)'
  }
}
