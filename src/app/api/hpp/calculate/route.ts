import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'
import { cacheInvalidation } from '@/lib/cache'
import type { Database } from '@/types/supabase-generated'

type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']

// POST /api/hpp/calculate - Calculate HPP for a recipe
export async function POST(request: NextRequest) {
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

    // Calculate material cost
    let materialCost = 0
    const ingredients = recipe.recipe_ingredients || []

    for (const ri of ingredients) {
      const ingredient = ri.ingredients
      if (ingredient) {
        // Use WAC if available, otherwise use current price
        const unitPrice = Number(ingredient.weighted_average_cost || ingredient.price_per_unit || 0)
        materialCost += ri.quantity * unitPrice
      }
    }

    // Get operational costs (default 15% of material cost or fixed amount)
    const operationalCost = Math.max(materialCost * 0.15, 2500)

    // Calculate total HPP
    const totalHpp = materialCost + operationalCost
    const servings = recipe.servings || 1
    const costPerUnit = servings > 0 ? totalHpp / servings : totalHpp

    // Save calculation
    const { data: calculation, error: calcError } = await supabase
      .from('hpp_calculations')
      .insert({
        recipe_id: recipeId,
        user_id: user.id,
        material_cost: materialCost,
        overhead_cost: operationalCost,
        labor_cost: 0,
        total_hpp: totalHpp,
        cost_per_unit: costPerUnit,
        production_quantity: servings,
        calculation_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single()

    if (calcError || !calculation) {
      throw calcError || new Error('Failed to create calculation')
    }

    // Update recipe with cost
    await supabase
      .from('recipes')
      .update({
        cost_per_unit: costPerUnit,
        updated_at: new Date().toISOString()
      })
      .eq('id', recipeId)
      .eq('user_id', user.id)

    // Create snapshot
    await supabase
      .from('hpp_snapshots')
      .insert({
        recipe_id: recipeId,
        user_id: user.id,
        snapshot_date: new Date().toISOString(),
        hpp_value: costPerUnit,
        material_cost: materialCost,
        operational_cost: operationalCost,
        cost_breakdown: {
          ingredients: ingredients.map(ri => {
            const ingredient = ri.ingredients
            const unitPrice = Number(ingredient?.weighted_average_cost || ingredient?.price_per_unit || 0)
            return {
              name: ingredient?.name || 'Unknown',
              quantity: ri.quantity,
              unit: ri.unit,
              unit_price: unitPrice,
              total: ri.quantity * unitPrice
            }
          }),
          operational: operationalCost
        }
      })

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
        id: calculation.id,
        recipe_id: recipeId,
        material_cost: materialCost,
        operational_cost: operationalCost,
        total_hpp: totalHpp,
        cost_per_unit: costPerUnit,
        ingredients_count: ingredients.length
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
