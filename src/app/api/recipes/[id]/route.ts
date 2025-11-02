import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'
import { cacheInvalidation } from '@/lib/cache'
import { RECIPE_FIELDS } from '@/lib/database/query-fields'
import type { RecipeIngredientsInsert } from '@/types/database'
import { getErrorMessage, isValidUUID } from '@/lib/type-guards'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/recipes/[id] - Get single recipe with ingredients
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid recipe ID format' }, { status: 400 })
    }
    
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: recipe, error } = await supabase
      .from('recipes')
      .select(RECIPE_FIELDS.DETAIL)
      .eq('id', id)
      .eq('created_by', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(recipe)
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in GET /api/recipes/[id]')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/recipes/[id] - Update recipe with ingredients
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid recipe ID format' }, { status: 400 })
    }
    
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { recipe_ingredients, ...recipeData } = body

    // Update recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .update(recipeData)
      .eq('id', id)
      .eq('created_by', user.id)
      .select('id, name')
      .single()

    if (recipeError) {
      if (recipeError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
      }
      apiLogger.error({ error: recipeError }, 'Error updating recipe')
      return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 })
    }

    // Update ingredients if provided
    if (recipe_ingredients && Array.isArray(recipe_ingredients)) {
      // Delete existing ingredients
      const { error: deleteError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        apiLogger.error({ error: deleteError }, 'Error deleting old ingredients')
      }

      // Insert new ingredients
      if (recipe_ingredients.length > 0) {
        interface RecipeIngredientInput {
          ingredient_id?: string
          bahan_id?: string
          quantity?: number
          qty_per_batch?: number
          unit?: string
          notes?: string
        }

        const ingredientsToInsert: RecipeIngredientsInsert[] = 
          recipe_ingredients.map((ingredient: RecipeIngredientInput) => ({
            recipe_id: id,
            ingredient_id: ingredient.ingredient_id ?? ingredient.bahan_id ?? '',
            quantity: ingredient.quantity ?? ingredient.qty_per_batch ?? 0,
            unit: ingredient.unit ?? 'g',
            notes: ingredient.notes,
            user_id: user.id
          }))

        const { error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .insert(ingredientsToInsert)

        if (ingredientsError) {
          apiLogger.error({ error: ingredientsError }, 'Error adding recipe ingredients')
          return NextResponse.json(
            { error: 'Failed to update recipe ingredients' },
            { status: 500 }
          )
        }
      }
    }

    // Fetch complete recipe for response
    const { data: completeRecipe, error: fetchError } = await supabase
      .from('recipes')
      .select(RECIPE_FIELDS.DETAIL)
      .eq('id', id)
      .eq('created_by', user.id)
      .single()

    if (fetchError) {
      apiLogger.error({ error: fetchError }, 'Error fetching complete recipe')
      return NextResponse.json(recipe)
    }

    // Invalidate cache
    await cacheInvalidation.recipes()

    return NextResponse.json(completeRecipe)
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in PUT /api/recipes/[id]')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/recipes/[id] - Delete recipe
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid recipe ID format' }, { status: 400 })
    }
    
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete recipe (ingredients will be cascade deleted)
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
      .eq('created_by', user.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
      }
      throw error
    }

    // Invalidate cache
    await cacheInvalidation.recipes()

    return NextResponse.json({ message: 'Recipe deleted successfully' })
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in DELETE /api/recipes/[id]')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
