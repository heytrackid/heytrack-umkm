/**
 * HPP Calculator Module
 * Core HPP calculation logic for recipes
 */

import type { Database } from '@/types'
import { createClient } from '@/utils/supabase/client'
import { dbLogger } from '@/lib/logger'
import type { HPPCalculationOptions, HPPCalculationResult, IngredientCost } from './types'

export class HPPCalculator {
  /**
   * Calculate HPP for a recipe
   */
  static async calculateHPP(
    recipeId: string,
    userId: string,
    options: Partial<HPPCalculationOptions> = {}
  ): Promise<HPPCalculationResult> {
    const supabase = createClient()

    try {
      // Get recipe with ingredients
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            ingredient_id,
            quantity,
            unit,
            ingredients (
              id,
              name,
              unit_cost,
              unit
            )
          )
        `)
        .eq('id', recipeId)
        .eq('user_id', userId)
        .single()

      if (recipeError || !recipe) {
        throw new Error('Recipe not found')
      }

      // Calculate material cost
      let materialCost = 0
      const ingredientCosts: IngredientCost[] = []

      recipe.recipe_ingredients?.forEach((ri: any) => {
        if (ri.ingredients) {
          // Use weighted average cost (WAC) instead of fixed unit cost for accurate HPP calculation
          const costPerUnit = ri.ingredients.weighted_average_cost || ri.ingredients.unit_cost
          const cost = ri.quantity * costPerUnit
          materialCost += cost
          ingredientCosts.push({
            ingredient_id: ri.ingredient_id,
            ingredient_name: ri.ingredients.name,
            quantity: ri.quantity,
            unit_cost: costPerUnit,
            total_cost: cost,
            unit: ri.unit
          })
        }
      })

      // Default options
      const {
        overheadRate = 0.1, // 10%
        laborCostPerHour = 50000,
        targetMargin = 0.3 // 30%
      } = options

      // Calculate operational costs (simplified)
      const operationalCost = materialCost * overheadRate
      const laborCost = (recipe.prep_time || 30) / 60 * laborCostPerHour // Assume prep time in minutes
      const packagingCost = 2000 // Fixed packaging cost

      const totalHPP = materialCost + operationalCost + laborCost + packagingCost

      // Calculate profitability
      const breakEvenQuantity = 1
      const recommendedMargin = targetMargin
      const isViable = totalHPP > 0

      // Suggested pricing
      const suggestedPricing = {
        economy: {
          price: totalHPP * (1 + targetMargin * 0.7),
          margin: targetMargin * 0.7
        },
        standard: {
          price: totalHPP * (1 + targetMargin),
          margin: targetMargin
        },
        premium: {
          price: totalHPP * (1 + targetMargin * 1.5),
          margin: targetMargin * 1.5
        }
      }

      return {
        total_hpp: totalHPP,
        material_cost: materialCost,
        operational_cost: operationalCost + laborCost + packagingCost,
        breakdown: {
          ingredientCost: materialCost,
          laborCost,
          overheadCost: operationalCost,
          packagingCost
        },
        suggestedPricing,
        profitability: {
          isViable,
          breakEvenQuantity,
          recommendedMargin
        }
      }
    } catch (error) {
      dbLogger.error({ error: error instanceof Error ? error.message : String(error), recipeId, userId }, 'HPP calculation failed')
      throw error
    }
  }
}
