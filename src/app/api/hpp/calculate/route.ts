// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextRequest, NextResponse } from 'next/server'

import { cacheInvalidation } from '@/lib/cache'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { HppCalculatorService } from '@/services/hpp/HppCalculatorService'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { typed } from '@/types/type-utilities'
import { createClient } from '@/utils/supabase/server'


// POST /api/hpp/calculate - Calculate HPP for a recipe
async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }


    const body = await request.json() as { recipeId?: string }
    const { recipeId } = body

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      )
    }

    // Get recipe with ingredients
    interface RecipeWithIngredients {
      id: string
      name: string
      servings: number | null
      recipe_ingredients: Array<{
        quantity: number
        unit: string
        ingredients: {
          id: string
          name: string
          price_per_unit: number
          weighted_average_cost: number
          unit: string
        } | null
      }> | null
    }
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select(`
        id,
        name,
        servings,
        recipe_ingredients (
          quantity,
          unit,
          ingredients (
            id,
            name,
            price_per_unit,
            weighted_average_cost,
            unit
          )
        )
      `)
      .eq('id', recipeId)
      .eq('user_id', user['id'])
      .single() as { data: RecipeWithIngredients | null, error: unknown }

    if (recipeError || !recipe) {
      throw new Error('Recipe not found')
    }

    // Use consolidated HPP Calculator Service
    const hppService = new HppCalculatorService()
    const calculation = await hppService.calculateRecipeHpp(typed(supabase), recipeId, user['id'])

    const materialCost = calculation.material_cost
    const totalHpp = calculation.total_hpp
    const costPerUnit = calculation.cost_per_unit

    // Calculation already saved by service
    
    // Snapshot feature removed - no longer creating snapshots

    // Invalidate cache
    cacheInvalidation.hpp()

    apiLogger.info({
      userId: user['id'],
      recipeId,
      totalHpp,
      costPerUnit
    }, 'HPP calculated successfully')

    return NextResponse.json({
      success: true,
      calculation: {
        recipe_id: recipeId,
        material_cost: materialCost,
        labor_cost: calculation.labor_cost,
        overhead_cost: calculation.overhead_cost,
        wac_adjustment: calculation.wac_adjustment,
        total_hpp: totalHpp,
        cost_per_unit: costPerUnit,
        ingredients_count: calculation.material_breakdown.length
      }
    })

  } catch (error: unknown) {
    return handleAPIError(error, 'POST /api/hpp/calculate')
  }
}

// POST /api/hpp/calculate/batch - Calculate HPP for all recipes
async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all active recipes
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id')
      .eq('user_id', (user as { id: string }).id)
      .eq('is_active', true)

    const typedRecipes = recipes as Array<{ id: string }> | null

    if (recipesError) {
      throw recipesError
    }

    // Calculate HPP for each recipe in parallel
    const results = await Promise.allSettled(
      (typedRecipes || []).map(async (recipe) => {
        const response = await fetch(`${request.nextUrl.origin}/api/hpp/calculate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') ?? ''
          },
          body: JSON.stringify({ recipeId: recipe.id })
        })

        if (!response.ok) {
          throw new Error(`Failed to calculate HPP for recipe ${recipe['id']}`)
        }

        return response
      })
    )

    const successCount = results.filter(result => result['status'] === 'fulfilled').length
    const errorCount = results.filter(result => result['status'] === 'rejected').length

    // Log errors
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        apiLogger.error({ error: result.reason, recipeId: typedRecipes?.[index]?.id }, 'Error calculating HPP for recipe')
      }
    })

    return NextResponse.json({
      success: true,
      total: recipes?.length || 0,
      successCount,
      errorCount
    })

  } catch (error: unknown) {
    return handleAPIError(error, 'PUT /api/hpp/calculate')
  }
}

// Apply security middleware
const securedPOST = withSecurity(POST, SecurityPresets.enhanced())
const securedPUT = withSecurity(PUT, SecurityPresets.enhanced())

// Export secured handlers
export { securedPOST as POST, securedPUT as PUT }
