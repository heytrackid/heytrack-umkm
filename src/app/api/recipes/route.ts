import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/recipes - Get all recipes with ingredient relationships
export async function GET() {
  try {
    // Create authenticated Supabase client
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: recipes, error } = await supabase
      .from('resep')
      .select(`
        *,
        resep_item (
          id,
          qty_per_batch,
          bahan:bahan_baku (
            id,
            nama_bahan,
            satuan,
            harga_per_satuan
          )
        )
      `)
      .eq('user_id', user.id)
      .order('nama')

    if (error) {
      console.error('Error fetching recipes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch recipes' },
        { status: 500 }
      )
    }

    return NextResponse.json(recipes)
  } catch (error: any) {
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
    // Create authenticated Supabase client
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { recipe_ingredients, ...recipeData } = body

    // Validate required fields
    if (!recipeData.nama) {
      return NextResponse.json(
        { error: 'Recipe name is required' },
        { status: 400 }
      )
    }

    // Start a transaction by creating the recipe first
    const { data: recipe, error: recipeError } = await supabase
      .from('resep')
      .insert([{
        ...recipeData,
        user_id: user.id
      }])
      .select('*')
      .single()

    if (recipeError) {
      console.error('Error creating recipe:', recipeError)
      return NextResponse.json(
        { error: 'Failed to create recipe' },
        { status: 500 }
      )
    }

    // If ingredients are provided, add them to resep_item
    if (recipe_ingredients && recipe_ingredients.length > 0) {
      const recipeIngredientsToInsert = recipe_ingredients.map((ingredient: any) => ({
        resep_id: recipe.id,
        bahan_id: ingredient.bahan_id || ingredient.ingredient_id,
        qty_per_batch: ingredient.qty_per_batch || ingredient.quantity,
        user_id: user.id
      }))

      const { error: ingredientsError } = await supabase
        .from('resep_item')
        .insert(recipeIngredientsToInsert)

      if (ingredientsError) {
        console.error('Error adding recipe ingredients:', ingredientsError)
        // If ingredients fail, we should delete the recipe to maintain consistency
        await supabase
          .from('resep')
          .delete()
          .eq('id', recipe.id)
          .eq('user_id', user.id)
        return NextResponse.json(
          { error: 'Failed to add recipe ingredients' },
          { status: 500 }
        )
      }
    }

    // Fetch the complete recipe with ingredients for response
    const { data: completeRecipe, error: fetchError } = await supabase
      .from('resep')
      .select(`
        *,
        resep_item (
          id,
          qty_per_batch,
          bahan:bahan_baku (
            id,
            nama_bahan,
            satuan,
            harga_per_satuan
          )
        )
      `)
      .eq('id', recipe.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      console.error('Error fetching complete recipe:', fetchError)
      return NextResponse.json(recipe, { status: 201 })
    }

    return NextResponse.json(completeRecipe, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/recipes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}