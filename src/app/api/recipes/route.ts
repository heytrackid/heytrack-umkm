import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdmin } from '@/lib/supabase'

// GET /api/recipes - Get all recipes with ingredient relationships
export async function GET() {
  try {
    const supabase = createServerSupabaseAdmin()
    const { data: recipes, error } = await (supabase as any)
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          id,
          quantity,
          unit,
          ingredient:ingredients (
            id,
            name,
            unit,
            price_per_unit
          )
        )
      `)
      .order('name')
    
    if (error) {
      console.error('Error fetching recipes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch recipes' },
        { status: 500 }
      )
    }

    return NextResponse.json(recipes)
  } catch (error) {
    console.error('Error in GET /api/recipes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/recipes - Create new recipe with ingredients
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipe_ingredients, ...recipeData } = body
    
    // Validate required fields
    if (!recipeData.name) {
      return NextResponse.json(
        { error: 'Recipe name is required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseAdmin()
    
    // Start a transaction by creating the recipe first
    const { data: recipe, error: recipeError } = await (supabase as any)
      .from('recipes')
      .inser""
      .selec""
      .single()
    
    if (recipeError) {
      console.error('Error creating recipe:', recipeError)
      return NextResponse.json(
        { error: 'Failed to create recipe' },
        { status: 500 }
      )
    }

    // If ingredients are provided, add them to recipe_ingredients
    if (recipe_ingredients && recipe_ingredients.length > 0) {
      const recipeIngredientsToInsert = recipe_ingredients.map((ingredient: any) => ({
        recipe_id: recipe.id,
        ingredient_id: ingredient.ingredient_id,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        cost: ingredient.cost || 0
      }))

      const { error: ingredientsError } = await (supabase as any)
        .from('recipe_ingredients')
        .inser""

      if (ingredientsError) {
        console.error('Error adding recipe ingredients:', ingredientsError)
        // If ingredients fail, we should delete the recipe to maintain consistency
        await (supabase as any).from('recipes').delete().eq('id', recipe.id)
        return NextResponse.json(
          { error: 'Failed to add recipe ingredients' },
          { status: 500 }
        )
      }
    }

    // Fetch the complete recipe with ingredients for response
    const { data: completeRecipe, error: fetchError } = await (supabase as any)
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          id,
          quantity,
          unit,
          ingredient:ingredients (
            id,
            name,
            unit,
            price_per_unit
          )
        )
      `)
      .eq('id', recipe.id)
      .single()

    if (fetchError) {
      console.error('Error fetching complete recipe:', fetchError)
      return NextResponse.json(recipe, { status: 201 })
    }

    return NextResponse.json(completeRecipe, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/recipes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}