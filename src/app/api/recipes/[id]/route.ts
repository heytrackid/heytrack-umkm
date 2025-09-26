import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/recipes/[id] - Get single recipe with ingredients
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { data: recipe, error } = await (supabase as any)
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
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Recipe not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching recipe:', error)
      return NextResponse.json(
        { error: 'Failed to fetch recipe' },
        { status: 500 }
      )
    }

    return NextResponse.json(recipe)
  } catch (error) {
    console.error('Error in GET /api/recipes/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/recipes/[id] - Update recipe and its ingredients
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { ingredients, ...recipeData } = body
    
    // Update the recipe
    const { data: recipe, error: recipeError } = await (supabase as any)
      .from('recipes')
      .update(recipeData)
      .eq('id', id)
      .select()
      .single()
    
    if (recipeError) {
      if (recipeError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Recipe not found' },
          { status: 404 }
        )
      }
      console.error('Error updating recipe:', recipeError)
      return NextResponse.json(
        { error: 'Failed to update recipe' },
        { status: 500 }
      )
    }

    // If ingredients are provided, update them
    if (ingredients !== undefined) {
      // Delete existing recipe ingredients
      const { error: deleteError } = await (supabase as any)
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', id)

      if (deleteError) {
        console.error('Error deleting existing ingredients:', deleteError)
        return NextResponse.json(
          { error: 'Failed to update recipe ingredients' },
          { status: 500 }
        )
      }

      // Add new ingredients if any
      if (ingredients.length > 0) {
        const recipeIngredients = ingredients.map((ingredient: any) => ({
          recipe_id: id,
          ingredient_id: ingredient.ingredient_id,
          quantity: ingredient.quantity,
          unit: ingredient.unit
        }))

        const { error: insertError } = await (supabase as any)
          .from('recipe_ingredients')
          .insert(recipeIngredients)

        if (insertError) {
          console.error('Error adding new ingredients:', insertError)
          return NextResponse.json(
            { error: 'Failed to add recipe ingredients' },
            { status: 500 }
          )
        }
      }
    }

    // Fetch the complete updated recipe with ingredients
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
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching updated recipe:', fetchError)
      return NextResponse.json(recipe)
    }

    return NextResponse.json(completeRecipe)
  } catch (error) {
    console.error('Error in PUT /api/recipes/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/recipes/[id] - Delete recipe (cascade will delete recipe_ingredients)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Check if recipe exists first
    const { data: existingRecipe, error: checkError } = await (supabase as any)
      .from('recipes')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError && checkError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    // Delete the recipe (cascade will handle recipe_ingredients)
    const { error } = await (supabase as any)
      .from('recipes')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting recipe:', error)
      return NextResponse.json(
        { error: 'Failed to delete recipe' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Recipe deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/recipes/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}