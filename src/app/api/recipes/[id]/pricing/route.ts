import { type NextRequest, NextResponse } from 'next/server'
import { PricingAutomation, UMKM_CONFIG } from '@/lib/automation'
import { apiLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase-generated'
import { isRecipeWithIngredients, extractFirst, ensureArray, getErrorMessage } from '@/lib/type-guards'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']

interface RecipeWithIngredients extends Recipe {
  recipe_ingredients?: Array<RecipeIngredient & {
    ingredient?: Ingredient
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
      recipeData = {
        ...data,
        recipe_ingredients: (data.recipe_ingredients || []).map((ri: any) => ({
          ...ri,
          ingredient: Array.isArray(ri.ingredients) ? ri.ingredients[0] : ri.ingredients
        }))
      } as RecipeWithIngredients
    }

    // Create a pricing automation instance and calculate pricing
    const pricingAutomation = new PricingAutomation(UMKM_CONFIG)
    
    // Transform recipeData to match expected type
    const recipeForPricing = {
      ...recipeData,
      servings: recipeData?.servings || 1,
      recipe_ingredients: (recipeData?.recipe_ingredients || []).map((ri) => ({
        ...ri,
        ingredient: ri.ingredient || {} as Ingredient
      }))
    }
    
    // Calculate pricing (the recipeForPricing should now match the expected type)
    const pricingAnalysis = pricingAutomation.calculateSmartPricing(recipeForPricing)

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