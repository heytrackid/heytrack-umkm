// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
import { handleAPIError } from '@/lib/errors/api-error-handler'
export const runtime = 'nodejs'



import { createSuccessResponse } from '@/lib/api-core'
import { createApiRoute } from '@/lib/api/route-factory'
import { cacheInvalidation } from '@/lib/cache'
import { apiLogger } from '@/lib/logger'
import { HppService } from '@/services/hpp/HppService'
import { SecurityPresets } from '@/utils/security/api-middleware'



// POST /api/hpp/calculate - Calculate HPP for a recipe
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/hpp',
    securityPreset: SecurityPresets.basic(),
  },
  async (context, _query: unknown, body: unknown) => {
    const { user } = context

    if (!body || typeof body !== 'object') {
      return handleAPIError(new Error('Request body is required'), 'POST /api/hpp/calculate')
    }

    const { recipeId } = body as { recipeId: string }

    try {
      const hppService = new HppService({
        userId: user.id,
        supabase: context.supabase
      })
      const calculation = await hppService.calculateRecipeHpp(recipeId)

      cacheInvalidation.hpp()

      apiLogger.info({
        userId: user.id,
        recipeId,
        totalHpp: calculation.total_hpp,
        costPerUnit: calculation.cost_per_unit
      }, 'HPP calculation completed')

      return createSuccessResponse(calculation)
    } catch (error) {
      return handleAPIError(error, 'GET /api/hpp/calculate')
    }
  }
)

// PUT /api/hpp/calculate - Batch calculate HPP for all recipes
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/hpp',
    securityPreset: SecurityPresets.basic(),
  },
  async (context) => {
    const { user } = context

    try {
      const hppService = new HppService({
        userId: user.id,
        supabase: context.supabase
      })
      const results = await hppService.batchCalculateHpp()

      cacheInvalidation.hpp()

      apiLogger.info({
        userId: user.id,
        calculatedCount: results.length
      }, 'Batch HPP calculation completed')

      return createSuccessResponse({
        results,
        summary: {
          total: results.length
        }
      })
    } catch (error) {
      return handleAPIError(error, 'POST /api/hpp/batch-calculate')
    }
  }
)

// PATCH /api/hpp - Batch calculate HPP for all recipes (alias for PUT)
export const PATCH = createApiRoute(
  {
    method: 'PATCH',
    path: '/api/hpp',
    securityPreset: SecurityPresets.basic(),
  },
  async (context) => {
    const { user } = context

    try {
      const hppService = new HppService({
        userId: user.id,
        supabase: context.supabase
      })
      const results = await hppService.batchCalculateHpp()

      cacheInvalidation.hpp()

      apiLogger.info({
        userId: user.id,
        calculatedCount: results.length
      }, 'Batch HPP calculation completed')

      return createSuccessResponse({
        calculated: results.length,
        failed: 0,
        success: true
      })
    } catch (error) {
      return handleAPIError(error, 'PATCH /api/hpp')
    }
  }
)

// GET /api/hpp/calculations - Get HPP calculations history
const getCalculationsRoute = createApiRoute(
  {
    method: 'GET',
    path: '/api/hpp/calculations',
    securityPreset: SecurityPresets.basic(),
  },
  async (context) => {
    const { user, request } = context
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const recipeId = searchParams.get('recipe_id')

    try {
      const hppService = new HppService({
        userId: user.id,
        supabase: context.supabase
      })
      const params = { page, limit, ...(recipeId && { recipe_id: recipeId }) }
      if (recipeId) params.recipe_id = recipeId
      const result = await hppService.getCalculations(params)

      apiLogger.info({
        userId: user.id,
        page,
        limit,
        total: result.total
      }, 'HPP calculations retrieved')

      return createSuccessResponse(result)
    } catch (error) {
      return handleAPIError(error, 'GET /api/hpp/calculations')
    }
  }
)

// GET /api/hpp/[...slug] - Dynamic HPP routes
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/hpp',
    securityPreset: SecurityPresets.basic(),
  },
  async (context) => {
    const { params } = context
    const slug = params?.['slug']

    if (!slug || slug.length === 0) {
      // GET /api/hpp - Get overview (redirect to overview for backward compatibility)
      try {
        const hppService = new HppService({
          userId: context.user.id,
          supabase: context.supabase
        })
        const result = await hppService.getOverview()

        apiLogger.info({
          userId: context.user.id,
          totalRecipes: result.totalRecipes,
          calculatedRecipes: result.calculatedRecipes,
          alertCount: result.alerts.length
        }, 'HPP overview retrieved')

        return createSuccessResponse(result)
      } catch (error) {
        return handleAPIError(error, 'GET /api/hpp/overview')
      }
    } else if (slug.length === 1 && slug[0] === 'overview') {
      // GET /api/hpp/overview - Get overview
      try {
        const hppService = new HppService({
          userId: context.user.id,
          supabase: context.supabase
        })
        const result = await hppService.getOverview()

        apiLogger.info({
          userId: context.user.id,
          totalRecipes: result.totalRecipes,
          calculatedRecipes: result.calculatedRecipes,
          alertCount: result.alerts.length
        }, 'HPP overview retrieved')

        return createSuccessResponse(result)
      } catch (error) {
        return handleAPIError(error, 'GET /api/hpp/overview')
      }
    } else if (slug.length === 1 && slug[0] === 'comparison') {
      // GET /api/hpp/comparison - Get recipe comparison
      try {
        const hppService = new HppService({
          userId: context.user.id,
          supabase: context.supabase
        })
        const result = await hppService.getComparison()

        apiLogger.info({
          userId: context.user.id,
          recipeCount: result.length,
          calculatedCount: result.filter(r => r.cost_per_unit !== null).length
        }, 'Recipe comparison retrieved')

        return createSuccessResponse(result)
      } catch (error) {
        return handleAPIError(error, 'GET /api/hpp/comparison')
      }
    } else if (slug.length === 2 && slug[0] === 'recipe') {
      // GET /api/hpp/recipe/[id] - Get recipe with HPP data
      const recipeId = slug[1]

      if (!recipeId) {
        return handleAPIError(new Error('Recipe ID is required'), 'GET /api/hpp/recipe/[id]')
      }

      try {
        // Fetch recipe details
        const { data: recipe, error: recipeError } = await context.supabase
          .from('recipes')
          .select(`
            *,
            recipe_ingredients (
              *,
              ingredients (
                id,
                name,
                price_per_unit,
                weighted_average_cost,
                unit,
                category
              )
            )
          `)
          .eq('id', recipeId)
          .eq('user_id', context.user.id)
          .single()

        if (recipeError || !recipe) {
          return handleAPIError(new Error('Recipe not found'), 'GET /api/hpp/recipe/[id]')
        }

        // Try to get latest HPP calculation
        const hppService = new HppService({
          userId: context.user.id,
          supabase: context.supabase
        })
        let hppCalculation = null

        try {
          const calculations = await hppService.getCalculations({
            recipe_id: recipeId,
            limit: 1
          })

          if (calculations.data.length > 0) {
            hppCalculation = calculations.data[0]
          }
        } catch (error) {
          apiLogger.warn({ error, recipeId }, 'Failed to fetch HPP calculation, using fallback')
        }

        // Calculate costs if no HPP calculation exists
        let totalCost = 0
        let operationalCost = 0
        let laborCost = 0
        let overheadCost = 0

        if (hppCalculation) {
          // Use existing calculation
          const servings = Number(recipe.servings) || 1
          totalCost = hppCalculation.cost_per_unit
          operationalCost = (hppCalculation.overhead_cost || 0) / servings
          laborCost = (hppCalculation.labor_cost || 0) / servings
          overheadCost = (hppCalculation.overhead_cost || 0) / servings
        } else {
          // Fallback calculation
          const ingredients = Array.isArray(recipe.recipe_ingredients)
            ? recipe.recipe_ingredients.filter(ri => ri.ingredients)
            : []

          const ingredientCost = ingredients.reduce((sum: number, ri) => {
            const quantity = ri.quantity ?? 0
            const unitPrice = ri.ingredients?.weighted_average_cost ??
                             ri.ingredients?.price_per_unit ?? 0
            return sum + quantity * unitPrice
          }, 0)

          operationalCost = Math.max(
            ingredientCost * 0.15, // 15%
            2500 // Minimum 2500 IDR
          )
          totalCost = ingredientCost + operationalCost
        }

        // Transform ingredients for frontend
        const transformedIngredients = Array.isArray(recipe.recipe_ingredients)
          ? recipe.recipe_ingredients
              .filter(ri => ri.ingredients)
              .map((ri) => ({
                id: ri.ingredient_id,
                name: ri.ingredients?.name ?? 'Unknown',
                quantity: ri.quantity ?? 0,
                unit: ri.unit ?? 'unit',
                unit_price: ri.ingredients?.weighted_average_cost ??
                           ri.ingredients?.price_per_unit ?? 0,
                category: ri.ingredients?.category ?? 'Unknown'
              }))
          : []

        const result = {
          recipe,
          ingredients: transformedIngredients,
          operational_costs: operationalCost,
          labor_costs: laborCost,
          overhead_costs: overheadCost,
          total_cost: totalCost
        }

        apiLogger.info({
          userId: context.user.id,
          recipeId,
          hasHppCalculation: !!hppCalculation,
          totalCost
        }, 'Recipe with HPP data retrieved')

        return createSuccessResponse(result)
      } catch (error) {
        return handleAPIError(error, 'GET /api/hpp/recipe/[id]')
      }
    } else {
      return handleAPIError(new Error('Invalid path'), 'GET /api/hpp')
    }
  }
)

// POST /api/hpp/pricing - Generate pricing recommendation
const pricingRoute = createApiRoute(
  {
    method: 'GET',
    path: '/api/hpp/pricing',
    securityPreset: SecurityPresets.basic(),
  },
  async (context, _query: unknown, body: unknown) => {
    const { user } = context

    if (!body || typeof body !== 'object') {
      return handleAPIError(new Error('Request body is required'), 'POST /api/hpp/pricing')
    }

    const { recipeId } = body as { recipeId: string }

    try {
      const hppService = new HppService({
        userId: user.id,
        supabase: context.supabase
      })
      const result = await hppService.generatePricingRecommendation(recipeId)

      apiLogger.info({
        userId: user.id,
        recipeId,
        currentPrice: result.current_price,
        recommendedPrice: result.recommended_price
      }, 'Pricing recommendation generated successfully')

      return createSuccessResponse(result)
    } catch (error) {
      return handleAPIError(error, 'POST /api/hpp/pricing')
    }
  }
)

// Export other routes for different paths
export { getCalculationsRoute as GET_CALCULATIONS, pricingRoute as POST_PRICING }
