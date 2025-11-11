// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

import { apiLogger, logError } from '@/lib/logger'
import { RecipeAvailabilityService } from '@/services/recipes/RecipeAvailabilityService'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'

import { createClient } from '@/utils/supabase/server'

// GET /api/recipes/availability?recipe_id=xxx&quantity=10
async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const recipeId = searchParams.get('recipe_id')
    const quantity = parseInt(searchParams.get('quantity') ?? '1', 10)

    if (!recipeId) {
      return NextResponse.json(
        { error: 'recipe_id is required' },
        { status: 400 }
      )
    }

    const client = await createClient()

    const { data: { user }, error: authError } = await client.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await RecipeAvailabilityService.checkAvailability(recipeId, quantity)

    apiLogger.info({ 
      userId: user['id'],
      recipeId,
      quantity,
      isAvailable: result.is_available
    }, 'Recipe availability checked')

    return NextResponse.json(result)
  } catch (error) {
    logError(apiLogger, error, 'Failed to check recipe availability')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/recipes/availability - Check multiple recipes
async function postHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const client = await createClient()

    const { data: { user }, error: authError } = await client.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }    const body = await request.json() as { recipes?: Array<{ recipe_id: string; quantity: number }> }
    const { recipes } = body

    if (!recipes || !Array.isArray(recipes)) {
      return NextResponse.json(
        { error: 'recipes array is required' },
        { status: 400 }
      )
    }

    const results = await RecipeAvailabilityService.checkMultipleRecipes(recipes)

    apiLogger.info({ 
      userId: user['id'],
      recipeCount: recipes.length,
      availableCount: results.filter(r => r.is_available).length
    }, 'Multiple recipes checked')

    return NextResponse.json({
      results,
      summary: {
        total: results.length,
        available: results.filter(r => r.is_available).length,
        unavailable: results.filter(r => !r.is_available).length
      }
    })
  } catch (error) {
    logError(apiLogger, error, 'Failed to check multiple recipes')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/recipes/availability', SecurityPresets.enhanced())
export const POST = createSecureHandler(postHandler, 'POST /api/recipes/availability', SecurityPresets.enhanced())
