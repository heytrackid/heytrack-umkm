import { type NextRequest, NextResponse } from 'next/server'
import { PricingAutomation, UMKM_CONFIG } from '@/lib/automation'
import { apiLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase-generated'

type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']

interface RecipeWithIngredients extends Recipe {
  recipe_ingredients?: Array<RecipeIngredient & {
    ingredient?: Ingredient
  }>
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const resolvedParams = await params
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the recipe data from the request
    let recipeData: RecipeWithIngredients | null = await request.json()
    const recipeId = resolvedParams.id

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
            ingredient (
              id,
              name,
              price_per_unit
            )
          )
        `)
        .eq('id', recipeId)
        .single()

      if (error) {
        apiLogger.error({ error, recipeId }, 'Database error fetching recipe')
        return NextResponse.json({ error: 'Failed to fetch recipe data' }, { status: 500 })
      }

      if (!data) {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
      }

      // Cast to RecipeWithIngredients
      recipeData = data as RecipeWithIngredients
    }

    // Create a pricing automation instance and calculate pricing
    const pricingAutomation = new PricingAutomation(UMKM_CONFIG)
    
    // Transform recipeData to match expected type
    const recipeForPricing = {
      ...recipeData,
      servings: recipeData?.servings || 1,
      recipe_ingredients: (recipeData?.recipe_ingredients || []).map((ri) => ({
        ...ri,
        ingredient: ri.ingredient || {}
      }))
    }
    
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