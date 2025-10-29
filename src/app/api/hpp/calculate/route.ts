import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'
import { cacheInvalidation } from '@/lib/cache'
import type { Database } from '@/types/supabase-generated'
import type { SupabaseClient } from '@supabase/supabase-js'
import { HppCalculatorService } from '@/services/hpp/HppCalculatorService'

// POST /api/hpp/calculate - Calculate HPP for a recipe
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient() as SupabaseClient<Database>

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { recipeId } = body

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      )
    }

    // Get recipe with ingredients
    type RecipeWithIngredients = {
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
      .eq('user_id', user.id)
      .single() as { data: RecipeWithIngredients | null, error: unknown }

    if (recipeError || !recipe) {
      throw new Error('Recipe not found')
    }

    // Use consolidated HPP Calculator Service
    const hppService = new HppCalculatorService()
    const calculation = await hppService.calculateRecipeHpp(supabase, recipeId, user.id)

    const materialCost = calculation.material_cost
    const totalHpp = calculation.total_hpp
    const costPerUnit = calculation.cost_per_unit

    // Calculation already saved by service
    
    // Snapshot feature removed - no longer creating snapshots

    // Invalidate cache
    await cacheInvalidation.hpp()

    apiLogger.info({
      userId: user.id,
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

  } catch (err: unknown) {
    apiLogger.error({ error: err }, 'Error calculating HPP')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/hpp/calculate/batch - Calculate HPP for all recipes
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient() as SupabaseClient<Database>

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
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (recipesError) {
      throw recipesError
    }

    let successCount = 0
    let errorCount = 0

    // Calculate HPP for each recipe
    for (const recipe of recipes || []) {
      try {
        const response = await fetch(`${request.nextUrl.origin}/api/hpp/calculate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || ''
          },
          body: JSON.stringify({ recipeId: recipe.id })
        })

        if (response.ok) {
          successCount++
        } else {
          errorCount++
        }
      } catch (err) {
        errorCount++
        apiLogger.error({ err, recipeId: recipe.id }, 'Error calculating HPP for recipe')
      }
    }

    return NextResponse.json({
      success: true,
      total: recipes?.length || 0,
      successCount,
      errorCount
    })

  } catch (err: unknown) {
    apiLogger.error({ error: err }, 'Error in batch HPP calculation')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
