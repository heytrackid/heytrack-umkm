import { PricingAutomation, UMKM_CONFIG } from '@/lib/automation'
import { apiLogger } from '@/lib/logger'
import type { Row } from '@/types/database'
import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

type RecipeIngredient = Row<'recipe_ingredients'>
type Ingredient = Row<'ingredients'>

interface RecipeWithIngredients {
  id: string
  name: string
  servings?: number | null
  recipe_ingredients?: Array<RecipeIngredient & {
    ingredient?: Ingredient | null
  }>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any // Allow other properties
}

// Type for recipe ingredient with nested ingredient as returned by the query
interface RecipeIngredientWithIngredient {
  quantity: number
  unit: string
  ingredients: {
    id: string
    name: string
    price_per_unit: number | null
  } | null
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { id: recipeId } = params
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }    // Get the recipe data from the request
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
      const transformedIngredients = (data.recipe_ingredients || []).map((ri: RecipeIngredientWithIngredient) => ({
        id: '',
        recipe_id: data.id,
        ingredient_id: ri.ingredients?.id ?? '',
        quantity: ri.quantity,
        unit: ri.unit,
        user_id: user.id,
        ingredient: ri.ingredients
          ? {
              id: ri.ingredients.id,
              name: ri.ingredients.name,
              unit: '',
              price_per_unit: ri.ingredients.price_per_unit,
              weighted_average_cost: null,
              current_stock: 0,
              category: null,
              created_at: null,
              updated_at: null,
              user_id: user.id
            }
          : null
      } as RecipeIngredient & { ingredient: Row<'ingredients'> | null }))

      recipeData = {
        ...data,
        recipe_ingredients: transformedIngredients
      }
    }

    // Create a pricing automation instance and calculate pricing
    const pricingAutomation = new PricingAutomation(UMKM_CONFIG)
    
    // Transform recipeData to match expected type with proper null handling
    const recipeForPricing: RecipeWithIngredients = {
      ...recipeData,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      servings: (recipeData as any)?.servings ?? 1,
      recipe_ingredients: (recipeData?.recipe_ingredients ?? []).map((ri) => ({
        id: ri?.id || '',
        recipe_id: ri?.recipe_id || '',
        ingredient_id: ri?.ingredient_id || '',
        quantity: ri?.quantity || 0,
        unit: ri?.unit || '',
        user_id: ri?.user_id || '',
        ingredient: ri?.ingredient ?? null
      }))
    }
    
    // Calculate pricing using the original recipeData which should have the right structure
    const sanitizedIngredients = (recipeForPricing.recipe_ingredients ?? [])
        .filter((ri): ri is RecipeIngredient & { ingredient: Ingredient } => ri.ingredient !== null && ri.ingredient !== undefined)

    // Cast to expected type for PricingAutomation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pricingRecipe = recipeForPricing as any

    const pricingAnalysis = pricingAutomation.calculateSmartPricing({
      ...pricingRecipe,
      recipe_ingredients: sanitizedIngredients
    })

    return NextResponse.json({
      success: true,
      data: pricingAnalysis
    })

  } catch (err: unknown) {
    const error = err as Error
    apiLogger.error({ error }, 'Error calculating pricing')
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
