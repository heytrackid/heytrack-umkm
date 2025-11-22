// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
import { handleAPIError } from '@/lib/errors/api-error-handler'
export const runtime = 'nodejs'

import { z } from 'zod'
import { SecurityPresets } from '@/utils/security/api-middleware'

import { apiLogger, logError } from '@/lib/logger'
import { RecipeAvailabilityService } from '@/services/recipes/RecipeAvailabilityService'
import { createSuccessResponse } from '@/lib/api-core'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import type { NextResponse } from 'next/server'

const CheckMultipleRecipesSchema = z.object({
  recipes: z.array(z.object({
    recipe_id: z.string().uuid('Recipe ID harus valid'),
    quantity: z.number().positive('Jumlah harus > 0'),
  })).min(1, 'Minimal satu resep untuk dicek'),
}).strict()

// GET /api/recipes/availability?recipe_id=xxx&quantity=10
async function getHandler(context: RouteContext): Promise<NextResponse> {
  const { user, request } = context

  try {
    const { searchParams } = new URL(request.url)
    const recipeId = searchParams.get('recipe_id')
    const quantity = parseInt(searchParams.get('quantity') ?? '1', 10)

    if (!recipeId) {
      return handleAPIError(new Error('recipe_id is required'), 'API Route')
    }

    const result = await RecipeAvailabilityService.checkAvailability(recipeId, quantity)

    apiLogger.info({
      userId: user.id,
      recipeId,
      quantity,
      isAvailable: result.is_available
    }, 'Recipe availability checked')

    return createSuccessResponse(result)
  } catch (error) {
    logError(apiLogger, error, 'Failed to check recipe availability')
    return handleAPIError(new Error('Internal server error'), 'API Route')
  }
}

// POST /api/recipes/availability - Check multiple recipes
async function postHandler(context: RouteContext, _query?: never, body?: z.infer<typeof CheckMultipleRecipesSchema>): Promise<NextResponse> {
  const { user } = context

  if (!body) {
    return handleAPIError(new Error('Request body is required'), 'API Route')
  }

  try {
    const { recipes } = body

    const results = await RecipeAvailabilityService.checkMultipleRecipes(recipes)

    apiLogger.info({
      userId: user.id,
      recipeCount: recipes.length,
      availableCount: results.filter(r => r.is_available).length
    }, 'Multiple recipes checked')

    return createSuccessResponse({
      results,
      summary: {
        total: results.length,
        available: results.filter(r => r.is_available).length,
        unavailable: results.filter(r => !r.is_available).length
      }
    })
  } catch (error) {
    logError(apiLogger, error, 'Failed to check multiple recipes')
    return handleAPIError(new Error('Internal server error'), 'API Route')
  }
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/recipes/availability',
    securityPreset: SecurityPresets.basic(),
  },
  getHandler
)

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/recipes/availability',
    bodySchema: CheckMultipleRecipesSchema,
    securityPreset: SecurityPresets.basic(),
  },
  postHandler
)
