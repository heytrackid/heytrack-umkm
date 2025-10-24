import { createServerSupabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

import { apiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
// GET /api/recipes/[id] - Get single recipe with ingredients
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createServerSupabaseAdmin()
    const { data: recipe, error } = await supabase
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
    const supabase = createServerSupabaseAdmin()
    const body = await request.json()
    const { recipe_ingredients, ...recipeData } = body

    // Update the recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('resep')
      .update(recipeData as Record<string, unknown>)
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
        .from('resep_item')
        .delete()
        .eq('resep_id', id)

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
            resep_id: id,
            bahan_id: ing.bahan_id || ing.ingredient_id,
            qty_per_batch: ing.qty_per_batch || ing.quantity
          }
        })

        const { error: insertError } = await supabase
          .from('resep_item')
          .insert(recipeIngredientsToInsert)

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
    const supabase = createServerSupabaseAdmin()

    // Check if recipe exists first
    const { data: existingRecipe, error: checkError } = await supabase
      .from('resep')
      .select('*')
      .eq('id', id)
      .single()

    if (checkError && checkError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    // Delete the recipe (cascade will handle resep_item)
    const { error } = await supabase
      .from('resep')
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
