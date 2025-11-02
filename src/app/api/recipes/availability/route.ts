import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger, logError } from '@/lib/logger'
import { RecipeAvailabilityService } from '@/services/recipes/RecipeAvailabilityService'


export const runtime = 'nodejs'

// GET /api/recipes/availability?recipe_id=xxx&quantity=10
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recipeId = searchParams.get('recipe_id')
    const quantity = parseInt(searchParams.get('quantity') || '1', 10)

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
      userId: user.id,
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
export async function POST(request: NextRequest) {
  try {
    const client = await createClient()

    const { data: { user }, error: authError } = await client.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { recipes } = body

    if (!recipes || !Array.isArray(recipes)) {
      return NextResponse.json(
        { error: 'recipes array is required' },
        { status: 400 }
      )
    }

    const results = await RecipeAvailabilityService.checkMultipleRecipes(recipes)

    apiLogger.info({ 
      userId: user.id,
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
