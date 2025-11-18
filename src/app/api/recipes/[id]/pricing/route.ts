// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { PricingAutomation, UMKM_CONFIG } from '@/lib/automation/index'
import { apiLogger } from '@/lib/logger'
import type { Row } from '@/types/database'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'

import { createClient } from '@/utils/supabase/server'

type RecipeIngredient = Row<'recipe_ingredients'>
type Ingredient = Row<'ingredients'>

interface RecipeWithIngredients extends Row<'recipes'> {
  recipe_ingredients?: Array<RecipeIngredient & {
    ingredient?: Ingredient | null
  }>
}

async function postHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const resolvedParams = await params
    const { id: recipeId } = resolvedParams

    // Verify user is authenticated
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    // Get the recipe data from the request
    const body = await request.json() as unknown
    let recipeData: RecipeWithIngredients | null = null
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      recipeData = body as RecipeWithIngredients
    }

    // If recipe data wasn't provided in the request body, fetch it from the database
    if (!recipeData || Object.keys(recipeData).length === 0) {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          id,
          name,
          description,
          servings,
          cost_per_unit,
          category,
          cook_time,
          batch_size,
          created_at,
          updated_at,
          user_id,
          recipe_ingredients!inner (
            id,
            recipe_id,
            ingredient_id,
            quantity,
            unit,
            user_id,
            ingredients (
              id,
              name,
              unit,
              price_per_unit,
              weighted_average_cost,
              current_stock,
              category,
              created_at,
              updated_at,
              user_id
            )
          )
        `)
        .eq('id', recipeId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        apiLogger.error({ error, recipeId }, 'Database error fetching recipe')
        return NextResponse.json({ error: 'Failed to fetch recipe data' }, { status: 500 })
      }

      if (!data) {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
      }

      recipeData = data as unknown as RecipeWithIngredients
    }

    // Sanitize recipe data for pricing automation
    // Ensure all required fields are present and properly typed
    const sanitizedRecipe: RecipeWithIngredients = {
      ...recipeData,
      servings: recipeData.servings || 1,
      recipe_ingredients: (recipeData.recipe_ingredients || []).filter(ri => ri.ingredient !== null)
    }

    // Create a pricing automation instance and calculate pricing
    const pricingAutomation = new PricingAutomation(UMKM_CONFIG)

    // Verify that all ingredients have price information before calculating
    const ingredientsWithPrice = sanitizedRecipe.recipe_ingredients?.filter(ri =>
      ri.ingredient && ri.ingredient.price_per_unit !== null && ri.ingredient.price_per_unit !== undefined
    ) || []

    if (ingredientsWithPrice.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Tidak ada bahan dengan harga yang tersedia. Harap lengkapi harga bahan terlebih dahulu.',
        data: null
      }, { status: 400 })
    }

    // Calculate pricing using the sanitized recipe data
    const pricingAnalysis = pricingAutomation.calculateSmartPricing({
      ...sanitizedRecipe,
      recipe_ingredients: ingredientsWithPrice as Array<RecipeIngredient & { ingredient: Ingredient }>
    })

    return NextResponse.json({
      success: true,
      data: pricingAnalysis
    })
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error(String(error))
    apiLogger.error({ error: normalizedError }, 'Error calculating pricing')
    return NextResponse.json({
      error: 'Internal server error',
      message: normalizedError.message
    }, { status: 500 })
  }
}

export const POST = createSecureHandler(postHandler, 'POST /api/recipes/[id]/pricing', SecurityPresets.enhanced())
