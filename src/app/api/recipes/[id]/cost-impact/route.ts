import { NextResponse } from 'next/server'

import { createApiRoute } from '@/lib/api/route-factory'
import {
  calculateMaterialCost,
  extractIngredientContributions,
  resolveLatestCostUpdate
} from '@/lib/costs/cost-calculations'
import { apiLogger } from '@/lib/logger'
import { isRecipeCostRecord } from '@/types/recipes/cost'
import type { RecipeCostImpact, RecipeCostImpactChange, RecipeCostRecord } from '@/types/recipes/cost'

/**
 * GET /api/recipes/[id]/cost-impact
 * Get cost impact analysis for a specific recipe
 */
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/recipes/[id]/cost-impact',
    requireAuth: true,
  },
  async ({ supabase, params }) => {
    const recipeId = params?.['id']
    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID required' }, { status: 400 })
    }

    try {
      // Get recipe with ingredients
      const { data, error: recipeError } = await supabase
        .from('recipes')
        .select(`
          id,
          name,
          servings,
          updated_at,
          recipe_ingredients (
            quantity,
            ingredients (
              id,
              name,
              price_per_unit,
              weighted_average_cost,
              updated_at
            )
          )
        `)
        .eq('id', recipeId)
        .single()

      const recipe = data as RecipeCostRecord | null

      if (recipeError || !recipe || !isRecipeCostRecord(recipe)) {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
      }

      const contributions = extractIngredientContributions(recipe)
      const ingredientIds = contributions.map((entry) => entry.ingredientId)

      const purchaseHistory = new Map<string, { unit_price: number | null; purchase_date: string | null }[]>()

      await Promise.all(
        ingredientIds.map(async (ingredientId) => {
          const { data: purchases, error: purchaseError } = await supabase
            .from('ingredient_purchases')
            .select('ingredient_id, unit_price, purchase_date')
            .eq('ingredient_id', ingredientId)
            .order('purchase_date', { ascending: false })
            .limit(2)

          if (purchaseError) {
            apiLogger.warn({ purchaseError, ingredientId }, 'Failed to fetch ingredient purchase history')
            return
          }

          purchaseHistory.set(ingredientId, purchases ?? [])
        })
      )

      const changes: RecipeCostImpactChange[] = contributions.map((entry) => {
        const history = purchaseHistory.get(entry.ingredientId) ?? []
        const latestPurchase = history[0]
        const previousPurchase = history[1]

        const latestPrice = latestPurchase?.unit_price ?? entry.unitPrice
        const previousPrice = previousPurchase?.unit_price ?? entry.unitPrice
        const changeAmount = latestPrice - previousPrice
        const changePercent = previousPrice > 0 ? ((latestPrice - previousPrice) / previousPrice) * 100 : null
        const impactAmount = changeAmount * entry.quantity

        return {
          ingredientId: entry.ingredientId,
          ingredientName: entry.ingredientName,
          latestPrice,
          previousPrice,
          changeAmount,
          changePercent,
          quantity: entry.quantity,
          impactAmount,
          lastUpdated: latestPurchase?.purchase_date ?? entry.lastUpdated
        }
      })

      const { materialCost: totalCost } = calculateMaterialCost(recipe)
      const costPerServing = recipe.servings && recipe.servings > 0
        ? totalCost / recipe.servings
        : totalCost

      const priceChangeImpact = changes.reduce((total, change) => total + change.impactAmount, 0)
      const latestPurchaseDate = changes.reduce<string | null>((latest, change) => {
        if (!change.lastUpdated) {
          return latest
        }

        if (!latest || change.lastUpdated > latest) {
          return change.lastUpdated
        }

        return latest
      }, null)

      const result: RecipeCostImpact = {
        totalCost,
        costPerServing,
        lastPriceUpdate: resolveLatestCostUpdate(recipe, latestPurchaseDate),
        priceChangeImpact,
        changes
      }

      return NextResponse.json(result)
    } catch (error) {
      apiLogger.error({ error }, 'Error fetching recipe cost impact')
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)