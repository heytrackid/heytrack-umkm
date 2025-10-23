/**
 * HPP Calculator Module for Edge Functions
 * 
 * Calculates HPP (Harga Pokok Produksi / Cost of Goods Manufactured) for recipes.
 * Ported from src/lib/hpp-calculator.ts to work with Deno runtime.
 * 
 * @see .kiro/specs/hpp-edge-function-migration/design.md
 */

import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'
import type {
    HPPCalculationResult,
    IngredientCost,
    OperationalCost,
    OperationalCostRow,
    Production,
    Recipe,
    RecipeIngredient
} from './types.ts'
import { calculatePercentage, logError, logInfo, logWarn, roundToDecimals } from './utils.ts'

/**
 * Calculate HPP for a recipe including material and operational costs
 * 
 * @param recipeId - Recipe UUID
 * @param userId - User UUID
 * @param supabase - Supabase client instance
 * @returns Complete HPP calculation result
 */
export async function calculateHPP(
    recipeId: string,
    userId: string,
    supabase: SupabaseClient
): Promise<HPPCalculationResult> {
    try {
        logInfo('Starting HPP calculation', { recipe_id: recipeId, user_id: userId })

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
        const { materialCost, ingredientBreakdown } = await calculateMaterialCost(recipe)

        // 3. Calculate operational cost per unit
        const { operationalCostPerUnit, operationalBreakdown } = await calculateOperationalCost(
            recipeId,
            userId,
            supabase
        )

        // 4. Calculate total HPP
        const totalHPP = materialCost + operationalCostPerUnit

        // 5. Calculate percentages for breakdown
        const finalIngredientBreakdown = ingredientBreakdown.map(item => ({
            ...item,
            percentage: roundToDecimals(calculatePercentage(item.cost, totalHPP), 2)
        }))

        const finalOperationalBreakdown = operationalBreakdown.map(item => ({
            ...item,
            percentage: roundToDecimals(calculatePercentage(item.cost, totalHPP), 2)
        }))

        const result: HPPCalculationResult = {
            total_hpp: roundToDecimals(totalHPP, 2),
            material_cost: roundToDecimals(materialCost, 2),
            operational_cost: roundToDecimals(operationalCostPerUnit, 2),
            breakdown: {
                ingredients: finalIngredientBreakdown,
                operational: finalOperationalBreakdown
            }
        }

        logInfo('HPP calculation completed', {
            recipe_id: recipeId,
            total_hpp: result.total_hpp,
            material_cost: result.material_cost,
            operational_cost: result.operational_cost
        })

        return result

    } catch (error) {
        logError('HPP calculation failed', {
            recipe_id: recipeId,
            user_id: userId,
            error: error instanceof Error ? error.message : String(error)
        })
        throw error
    }
}

/**
 * Calculate material cost from recipe ingredients
 */
function calculateMaterialCost(recipe: Recipe & { recipe_ingredients: RecipeIngredient[] }): {
    materialCost: number
    ingredientBreakdown: IngredientCost[]
} {
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
                    cost: roundToDecimals(cost, 2),
                    percentage: 0 // Will be calculated later
                })
            }
        }
    }

    return { materialCost, ingredientBreakdown }
}

/**
 * Calculate operational cost per unit
 */
async function calculateOperationalCost(
    recipeId: string,
    userId: string,
    supabase: SupabaseClient
): Promise<{
    operationalCostPerUnit: number
    operationalBreakdown: OperationalCost[]
}> {
    // Get operational costs for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: operationalCosts, error: opCostError } = await supabase
        .from('operational_costs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', thirtyDaysAgo.toISOString())

    if (opCostError) {
        logWarn('Failed to fetch operational costs', {
            user_id: userId,
            error: opCostError.message
        })
    }

    // Calculate monthly operational cost by category
    const operationalBreakdown: OperationalCost[] = []
    let monthlyOpCost = 0

    if (operationalCosts && operationalCosts.length > 0) {
        // Group by category and sum
        const categoryTotals = new Map<string, number>()

        for (const cost of operationalCosts) {
            const category = cost.category || 'Other'
            const amount = calculateMonthlyCost(cost as OperationalCostRow)
            categoryTotals.set(category, (categoryTotals.get(category) || 0) + amount)
            monthlyOpCost += amount
        }

        // Convert to breakdown array
        for (const [category, cost] of categoryTotals.entries()) {
            operationalBreakdown.push({
                category,
                cost: roundToDecimals(cost, 2),
                percentage: 0 // Will be calculated later
            })
        }
    }

    // Estimate monthly production volume
    const estimatedMonthlyProduction = await estimateMonthlyProduction(recipeId, userId, supabase)

    // Calculate operational cost per unit
    const operationalCostPerUnit = monthlyOpCost / estimatedMonthlyProduction

    // Adjust operational breakdown to per-unit costs
    const operationalBreakdownPerUnit = operationalBreakdown.map(item => ({
        ...item,
        cost: roundToDecimals(item.cost / estimatedMonthlyProduction, 2)
    }))

    return {
        operationalCostPerUnit,
        operationalBreakdown: operationalBreakdownPerUnit
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

/**
 * Estimate monthly production volume for a recipe
 * Uses production history from last 30 days
 */
async function estimateMonthlyProduction(
    recipeId: string,
    userId: string,
    supabase: SupabaseClient
): Promise<number> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: productions, error } = await supabase
        .from('productions')
        .select('quantity')
        .eq('recipe_id', recipeId)
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())

    if (error) {
        logWarn('Failed to fetch production history', {
            recipe_id: recipeId,
            user_id: userId,
            error: error.message
        })
    }

    let estimatedMonthlyProduction = 100 // Default fallback

    if (productions && productions.length > 0) {
        const totalProduced = productions.reduce(
            (sum: number, p: Production) => sum + (p.quantity || 0),
            0
        )
        estimatedMonthlyProduction = Math.max(totalProduced, 1) // Avoid division by zero
    }

    return estimatedMonthlyProduction
}
