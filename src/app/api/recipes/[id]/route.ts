import { createServiceRoleClient } from '@/utils/supabase'
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
// GET /api/recipes/[id] - Get single recipe with ingredients
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createServiceRoleClient()
    const { data: recipe, error } = await supabase
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
      apiLogger.error({ error: error }, 'Error fetching recipe:')
      return NextResponse.json(
        { error: 'Failed to fetch recipe' },
        { status: 500 }
      )
    }

    return NextResponse.json(recipe)
  } catch (error: unknown) {
    apiLogger.error({ error: error }, 'Error in GET /api/recipes/[id]:')
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
    const supabase = createServiceRoleClient()
    const body = await request.json()
    const { recipe_ingredients, ...recipeData } = body

    // Update the recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .update(recipeData)
      .eq('id', id)
      .select('*')
      .single()

    if (recipeError) {
      if (recipeError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Recipe not found' },
          { status: 404 }
        )
      }
      apiLogger.error({ error: recipeError }, 'Error updating recipe:')
      return NextResponse.json(
        { error: 'Failed to update recipe' },
        { status: 500 }
      )
    }

    // If ingredients are provided, update them
    if (recipe_ingredients !== undefined) {
      // Delete existing recipe ingredients
      const { error: deleteError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', id)

      if (deleteError) {
        apiLogger.error({ error: deleteError }, 'Error deleting existing ingredients:')
        return NextResponse.json(
          { error: 'Failed to update recipe ingredients' },
          { status: 500 }
        )
      }

      // Add new ingredients if any
      if (recipe_ingredients.length > 0) {
        const recipeIngredientsToInsert = recipe_ingredients.map((ingredient: any) => {
          if (!ingredient || typeof ingredient !== 'object') {
            throw new Error('Invalid ingredient format')
          }

          const ing = ingredient as Record<string, unknown>
          return {
            recipe_id: id,
            ingredient_id: ing.ingredient_id || ing.bahan_id,
            quantity: ing.quantity || ing.qty_per_batch,
            unit: ing.unit || 'g'
          }
        })

        const { error: insertError } = await supabase
          .from('recipe_ingredients')
          .insert(recipeIngredientsToInsert as any)

        if (insertError) {
          apiLogger.error({ error: insertError }, 'Error adding new ingredients:')
          return NextResponse.json(
            { error: 'Failed to add recipe ingredients' },
            { status: 500 }
          )
        }
      }
    }

    // Fetch the complete updated recipe with ingredients
    const { data: completeRecipe, error: fetchError } = await supabase
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
      apiLogger.error({ error: fetchError }, 'Error fetching updated recipe:')
      return NextResponse.json(recipe)
    }

    return NextResponse.json(completeRecipe)
  } catch (error: unknown) {
    apiLogger.error({ error: error }, 'Error in PUT /api/recipes/[id]:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/recipes/[id] - Delete recipe (cascade will delete resep_item)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createServiceRoleClient()

    // Check if recipe exists first
    const { data: existingRecipe, error: checkError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()

    if (checkError && checkError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    // Delete the recipe (cascade will handle recipe_ingredients)
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)

    if (error) {
      apiLogger.error({ error: error }, 'Error deleting recipe:')
      return NextResponse.json(
        { error: 'Failed to delete recipe' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Recipe deleted successfully' })
  } catch (error: unknown) {
    apiLogger.error({ error: error }, 'Error in DELETE /api/recipes/[id]:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
