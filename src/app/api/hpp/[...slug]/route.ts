// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
import { handleAPIError } from '@/lib/errors/api-error-handler'
export const runtime = 'nodejs'

import { z } from 'zod'

import { createSuccessResponse } from '@/lib/api-core/responses'
import { createApiRoute } from '@/lib/api/route-factory'
import { cacheInvalidation } from '@/lib/cache'
import { apiLogger } from '@/lib/logger'
import { HppService } from '@/services/hpp/HppService'

const CalculateHppSchema = z.object({
  recipeId: z.string().min(1, 'Recipe ID is required')
})

const GeneratePricingRecommendationSchema = z.object({
  recipeId: z.string().uuid('Recipe ID harus valid'),
}).strict()

// POST /api/hpp/calculate - Calculate HPP for a recipe
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/hpp/calculate',
    bodySchema: CalculateHppSchema
  },
  async (context, _query, body) => {
    const { user } = context

    if (!body) {
      return handleAPIError(new Error('Request body is required'), 'POST /api/hpp/calculate')
    }

    const { recipeId } = body

    try {
      const hppService = new HppService(context.supabase)
      const calculation = await hppService.calculateRecipeHpp(recipeId, user.id)

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
    path: '/api/hpp/calculate'
  },
  async (context) => {
    const { user } = context

    try {
      const hppService = new HppService(context.supabase)
      const results = await hppService.batchCalculateHpp(user.id)

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

// GET /api/hpp/calculations - Get HPP calculations history
const getCalculationsRoute = createApiRoute(
  {
    method: 'GET',
    path: '/api/hpp/calculations'
  },
  async (context) => {
    const { user, request } = context
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const recipeId = searchParams.get('recipe_id')

    try {
      const hppService = new HppService(context.supabase)
      const params: any = { page, limit }
      if (recipeId) params.recipe_id = recipeId
      const result = await hppService.getCalculations(user.id, params)

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
    path: '/api/hpp'
  },
  async (context) => {
    const { params } = context
    const slug = params?.['slug']

    if (!slug || slug.length === 0) {
      // GET /api/hpp - Get overview
      try {
        const hppService = new HppService(context.supabase)
        const result = await hppService.getOverview(context.user.id)

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
        const hppService = new HppService(context.supabase)
        const result = await hppService.getComparison(context.user.id)

        apiLogger.info({
          userId: context.user.id,
          recipeCount: result.recipes.length,
          calculatedCount: result.summary.calculated_recipes
        }, 'Recipe comparison retrieved')

        return createSuccessResponse(result)
      } catch (error) {
        return handleAPIError(error, 'GET /api/hpp/comparison')
      }
    } else {
      return handleAPIError(new Error('Invalid path'), 'GET /api/hpp')
    }
  }
)

// POST /api/hpp/pricing - Generate pricing recommendation
const pricingRoute = createApiRoute(
  {
    method: 'POST',
    path: '/api/hpp/pricing',
    bodySchema: GeneratePricingRecommendationSchema
  },
  async (context, _query, body) => {
    const { user } = context

    if (!body) {
      return handleAPIError(new Error('Request body is required'), 'POST /api/hpp/pricing')
    }

    const { recipeId } = body

    try {
      const hppService = new HppService(context.supabase)
      const result = await hppService.generatePricingRecommendation(user.id, recipeId)

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