// External libraries
import { NextResponse } from 'next/server'

// Internal modules
import { createApiRoute } from '@/lib/api/route-factory'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { handleAPIError } from '@/lib/errors/api-error-handler'

// Types and schemas
import type { CostChangeAlert } from '@/types/recipes/cost'

// Constants and config
export const runtime = 'nodejs'

type IngredientWithPricingRelations = {
  id: string
  name: string
  price_per_unit: number | null
  weighted_average_cost: number | null
  updated_at: string | null
  recipe_ingredients: Array<{
    quantity: number | null
    recipes: { id: string; name: string } | null
  }> | null
}

type IngredientPurchaseHistoryRow = {
  ingredient_id: string | null
  unit_price: number | null
  purchase_date: string | null
}

/**
 * GET /api/ingredients/cost-alerts
 * Get cost change alerts for ingredients that affect recipes
 */
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/ingredients/cost-alerts',
    securityPreset: SecurityPresets.enhanced(),
  },
  async ({ supabase }) => {
    try {
      const windowHours = 24
      const since = new Date(Date.now() - windowHours * 60 * 60 * 1000)

      const { data: ingredients, error } = await supabase
        .from('ingredients')
        .select(`
          id,
          name,
          price_per_unit,
          weighted_average_cost,
          updated_at,
          recipe_ingredients (
            quantity,
            recipes (
              id,
              name
            )
          )
        `)

      if (error) {
        throw error
      }

      const alerts: CostChangeAlert[] = []

      const typedIngredients = (ingredients ?? []) as IngredientWithPricingRelations[]

      const ingredientIds = typedIngredients.map((ingredient) => ingredient.id)

      const purchasesByIngredient = new Map<string, { unit_price: number | null; purchase_date: string | null }[]>()

      if (ingredientIds.length > 0) {
        const { data: purchases, error: purchasesError } = await supabase
          .from('ingredient_purchases')
          .select('ingredient_id, unit_price, purchase_date')
          .in('ingredient_id', ingredientIds)
          .order('purchase_date', { ascending: false })

        if (purchasesError) {
          throw purchasesError
        }

        const purchaseRows = (purchases ?? []) as IngredientPurchaseHistoryRow[]

        for (const purchase of purchaseRows) {
          if (!purchase.ingredient_id) {
            continue
          }

          const list = purchasesByIngredient.get(purchase.ingredient_id) ?? []
          if (list.length < 2) {
            list.push({
              unit_price: purchase.unit_price,
              purchase_date: purchase.purchase_date
            })
            purchasesByIngredient.set(purchase.ingredient_id, list)
          }
        }
      }

      for (const ingredient of typedIngredients) {
        const purchases = purchasesByIngredient.get(ingredient.id) ?? []
        if (purchases.length < 2) {
          continue
        }

        const latestPurchase = purchases[0]
        const previousPurchase = purchases[1]

        if (!latestPurchase?.purchase_date || new Date(latestPurchase.purchase_date) < since) {
          continue
        }

        const latestPrice = latestPurchase.unit_price ?? ingredient.weighted_average_cost ?? ingredient.price_per_unit ?? 0
        const previousPrice = previousPurchase?.unit_price ?? ingredient.price_per_unit ?? 0

        if (!previousPrice || previousPrice <= 0) {
          continue
        }

        const changeAmount = latestPrice - previousPrice
        const changePercent = (changeAmount / previousPrice) * 100

        if (Math.abs(changePercent) < 1) {
          continue
        }

        const affectedRecipes = (ingredient.recipe_ingredients ?? [])
          .filter((relation): relation is { quantity: number | null; recipes: { id: string; name: string } } => Boolean(relation?.recipes))
          .map((relation) => ({
            recipeId: relation.recipes.id,
            recipeName: relation.recipes.name,
            impactAmount: changeAmount * (relation.quantity ?? 0)
          }))
          .filter((impact) => impact.impactAmount !== 0)

        if (affectedRecipes.length === 0) {
          continue
        }

        alerts.push({
          ingredientId: ingredient.id,
          ingredientName: ingredient.name,
          previousPrice,
          currentPrice: latestPrice,
          changePercent,
          changeAmount,
          lastPurchaseDate: latestPurchase.purchase_date,
          affectedRecipes
        })
      }

      return NextResponse.json({ alerts })
    } catch (error) {
      return handleAPIError(error, 'GET /api/ingredients/cost-alerts')
    }
  }
)