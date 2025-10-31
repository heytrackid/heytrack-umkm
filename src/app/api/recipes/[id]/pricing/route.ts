import { type NextRequest, NextResponse } from 'next/server'
import { PricingAutomation, UMKM_CONFIG } from '@/lib/automation'
import { apiLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'
import type { RecipesTable, RecipeIngredientsTable, IngredientsTable } from '@/types/database'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

type Recipe = RecipesTable
type RecipeIngredient = RecipeIngredientsTable
type Ingredient = IngredientsTable

interface RecipeWithIngredients extends Recipe {
  recipe_ingredients?: Array<RecipeIngredient & {
    ingredient?: Ingredient | null
  }>
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { id: recipeId } = params
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the recipe data from the request
    let recipeData: RecipeWithIngredients | null = await request.json()

    // If recipe data wasn't provided in the request body, fetch it from the database
    if (!recipeData || Object.keys(recipeData).length === 0) {
      const { data, error } = await supabase
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
              price_per_unit
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

      // Transform the data structure to match RecipeWithIngredients
      // Supabase returns joined data as arrays, so we need to extract the first element
      const transformedIngredients = (data.recipe_ingredients || []).map((ri: any) => {
        const ingredient = Array.isArray(ri.ingredients) ? ri.ingredients[0] : ri.ingredients
        return {
          id: ri.id || '',
          recipe_id: data.id,
          ingredient_id: ingredient?.id || '',
          quantity: ri.quantity,
          unit: ri.unit,
          user_id: user.id,
          ingredient: ingredient || null
        } as RecipeIngredient & { ingredient: Ingredient | null }
      })

      recipeData = {
        ...data,
        recipe_ingredients: transformedIngredients
      } as RecipeWithIngredients
    }

    // Create a pricing automation instance and calculate pricing
    const pricingAutomation = new PricingAutomation(UMKM_CONFIG)
    
    // Transform recipeData to match expected type with proper null handling
    const recipeForPricing: RecipeWithIngredients = {
      ...recipeData,
      servings: recipeData?.servings || 1,
      recipe_ingredients: (recipeData?.recipe_ingredients || []).map((ri) => ({
        id: ri?.id || '',
        recipe_id: ri?.recipe_id || '',
        ingredient_id: ri?.ingredient_id || '',
        quantity: ri?.quantity || 0,
        unit: ri?.unit || '',
        user_id: ri?.user_id || '',
        ingredient: ri?.ingredient || null
      }))
    }
    
    // Calculate pricing using the original recipeData which should have the right structure
    const pricingAnalysis = pricingAutomation.calculateSmartPricing({
      ...recipeData!,
      recipe_ingredients: recipeForPricing.recipe_ingredients?.map(ri => ({
        ...ri,
        ingredient: ri.ingredient!
      })) ?? []
    })

    return NextResponse.json({
      success: true,
      data: pricingAnalysis
    })

  } catch (err) {
    apiLogger.error({ err }, 'Error calculating pricing')
    return NextResponse.json({ 
      error: 'Internal server error',
      message: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}