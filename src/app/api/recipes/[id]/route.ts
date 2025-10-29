import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { RECIPE_FIELDS } from '@/lib/database/query-fields'
import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase-generated'

// GET /api/recipes/[id] - Get single recipe with ingredients
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ OPTIMIZED: Use specific fields
    const { data: recipe, error } = await supabase
      .from('recipes')
      .select(RECIPE_FIELDS.DETAIL)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Recipe not found' },
          { status: 404 }
        )
      }
      apiLogger.error({ error }, 'Error fetching recipe:')
      return NextResponse.json(
        { error: 'Failed to fetch recipe' },
        { status: 500 }
      )
    }

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(recipe)
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in GET /api/recipes/[id]:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/recipes/[id] - Update recipe and its ingredients
export async function PUT(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const supabase = await createClient()
    
    // Get authenticated user for user_id
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await _request.json()
    const { recipe_ingredients, ...recipeData } = body

    // Update the recipe ensuring it belongs to the user
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .update(recipeData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, name, updated_at')
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

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found or unauthorized' },
        { status: 404 }
      )
    }

    // If ingredients are provided, update them
    if (recipe_ingredients !== undefined) {
      // Delete existing recipe ingredients
      const { error: deleteError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        apiLogger.error({ error: deleteError }, 'Error deleting existing ingredients:')
        return NextResponse.json(
          { error: 'Failed to update recipe ingredients' },
          { status: 500 }
        )
      }

      // Add new ingredients if any
      if (recipe_ingredients.length > 0) {
        type RecipeIngredientInput = {
          ingredient_id?: string
          bahan_id?: string
          quantity?: number
          qty_per_batch?: number
          unit?: string
        }

        const recipeIngredientsToInsert: Database['public']['Tables']['recipe_ingredients']['Insert'][] = recipe_ingredients.map((ingredient: RecipeIngredientInput) => {
          if (!ingredient || typeof ingredient !== 'object') {
            throw new Error('Invalid ingredient format')
          }

          return {
            recipe_id: id,
            ingredient_id: ingredient.ingredient_id || ingredient.bahan_id || '',
            quantity: ingredient.quantity || ingredient.qty_per_batch || 0,
            unit: ingredient.unit || 'g',
            user_id: user.id
          }
        })

        const { error: insertError } = await supabase
          .from('recipe_ingredients')
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
    // ✅ OPTIMIZED: Use specific fields
    const { data: completeRecipe, error: fetchError } = await supabase
      .from('recipes')
      .select(RECIPE_FIELDS.DETAIL)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      apiLogger.error({ error: fetchError }, 'Error fetching updated recipe:')
      return NextResponse.json(recipe)
    }

    if (!completeRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found after update' },
        { status: 404 }
      )
    }

    return NextResponse.json(completeRecipe)
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in PUT /api/recipes/[id]:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/recipes/[id] - Delete recipe (cascade will delete resep_item)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if recipe exists and belongs to user first
    const { error: checkError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (checkError?.code === 'PGRST116') {
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
      .eq('user_id', user.id)

    if (error) {
      apiLogger.error({ error }, 'Error deleting recipe:')
      return NextResponse.json(
        { error: 'Failed to delete recipe' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Recipe deleted successfully' })
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in DELETE /api/recipes/[id]:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
