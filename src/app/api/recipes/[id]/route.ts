export const runtime = 'nodejs'
import { type NextRequest, NextResponse } from 'next/server'

import { createErrorResponse, handleAPIError } from '@/lib/api-core'
import { cacheInvalidation } from '@/lib/cache'
import { RECIPE_FIELDS } from '@/lib/database/query-fields'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage, isValidUUID } from '@/lib/type-guards'
import { RecipeUpdateSchema, RecipeIngredientInsertSchema } from '@/lib/validations/domains/recipe'
import type { Insert } from '@/types/database'
import { typed } from '@/types/type-utilities'

import { withSecurity, SecurityPresets } from '@/utils/security'

import { createClient } from '@/utils/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/recipes/[id] - Get single recipe with ingredients
async function getHandler(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context['params']
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid recipe ID format' }, { status: 400 })
    }
    
    const supabase = typed(await createClient())

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: recipe, error } = await supabase
      .from('recipes')
      .select(RECIPE_FIELDS.DETAIL)
      .eq('id', id)
      .eq('created_by', user['id'])
      .single()

    if (error) {
      if (error['code'] === 'PGRST116') {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(recipe)
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in GET /api/recipes/[id]')
    const apiError = handleAPIError(error)
    return createErrorResponse(apiError.message, apiError.statusCode)
  }
}

// PUT /api/recipes/[id] - Update recipe with ingredients
async function putHandler(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context['params']
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid recipe ID format' }, { status: 400 })
    }
    
    const supabase = typed(await createClient())

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as { recipe_ingredients?: unknown; ingredients?: unknown; [key: string]: unknown }
    
    // Support both recipe_ingredients and ingredients field names
    const ingredientsField = body.ingredients ?? body.recipe_ingredients

    // Extract recipe data (without ingredients) - explicitly exclude these fields from recipe update
    const { recipe_ingredients: _recipe_ingredients, ingredients: _ingredients, ...recipeData } = body

    // Validate recipe data if provided
    if (Object.keys(recipeData).length > 0) {
      const recipeValidation = RecipeUpdateSchema.safeParse(recipeData)
      if (!recipeValidation.success) {
        apiLogger.warn({ errors: recipeValidation.error.issues }, 'Recipe update validation failed')
        return NextResponse.json(
          { 
            error: 'Invalid recipe data', 
            details: recipeValidation.error.issues.map(issue => ({
              path: issue.path.join('.'),
              message: issue.message
            }))
          },
          { status: 400 }
        )
      }
    }

    // Update recipe if there's data to update
    if (Object.keys(recipeData).length > 0) {
      const { data: updatedRecipe, error: recipeError } = await supabase
        .from('recipes')
        .update(recipeData)
        .eq('id', id)
        .eq('created_by', user['id'])
        .select('id, name')
        .single()

      if (recipeError) {
        if (recipeError['code'] === 'PGRST116') {
          return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
        }
        apiLogger.error({ error: recipeError }, 'Error updating recipe')
        return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 })
      }

      // Log successful update
      if (updatedRecipe) {
        apiLogger.info({ recipeId: updatedRecipe.id, recipeName: updatedRecipe.name }, 'Recipe updated successfully')
      }
    }

    // Update ingredients if provided
    if (ingredientsField && Array.isArray(ingredientsField)) {
      // Validate ingredients
      const ingredientsValidation = ingredientsField.map((ing, idx) => {
        const result = RecipeIngredientInsertSchema.safeParse(ing)
        if (!result.success) {
          return { index: idx, errors: result.error.issues }
        }
        return { index: idx, data: result.data }
      })

      const invalidIngredients = ingredientsValidation.filter(v => 'errors' in v)
      if (invalidIngredients.length > 0) {
        return NextResponse.json(
          { 
            error: 'Invalid ingredients data', 
            details: invalidIngredients.map(v => ({
              index: v.index,
              errors: 'errors' in v ? v.errors : []
            }))
          },
          { status: 400 }
        )
      }

      // Delete existing ingredients
      const { error: deleteError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', id)
        .eq('user_id', user['id'])

      if (deleteError) {
        apiLogger.error({ error: deleteError }, 'Error deleting old ingredients')
      }

      // Insert new ingredients
      if (ingredientsField.length > 0) {
        const ingredientsToInsert: Array<Insert<'recipe_ingredients'>> = 
          ingredientsValidation.map((v) => {
            if ('data' in v) {
              return {
                recipe_id: id,
                ingredient_id: v.data!.ingredient_id,
                quantity: v.data!.quantity,
                unit: v.data!.unit,
                notes: v.data!.notes ?? null,
                user_id: user['id']
              }
            }
            throw new Error('Invalid ingredient data')
          })

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
      .eq('created_by', user['id'])
      .single()

    if (fetchError) {
      apiLogger.error({ error: fetchError }, 'Error fetching complete recipe')
      return NextResponse.json({ error: 'Failed to fetch updated recipe' }, { status: 500 })
    }

    // Invalidate cache
    cacheInvalidation.recipes()

    return NextResponse.json(completeRecipe)
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in PUT /api/recipes/[id]')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/recipes/[id] - Delete recipe
async function deleteHandler(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context['params']
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid recipe ID format' }, { status: 400 })
    }
    
    const supabase = typed(await createClient())

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
      .eq('created_by', user['id'])

    if (error) {
      if (error['code'] === 'PGRST116') {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
      }
      throw error
    }

    // Invalidate cache
    cacheInvalidation.recipes()

    return NextResponse.json({ message: 'Recipe deleted successfully' })
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in DELETE /api/recipes/[id]')
    const apiError = handleAPIError(error)
    return createErrorResponse(apiError.message, apiError.statusCode)
  }
}

// Apply security middleware
const securedGET = withSecurity(getHandler, SecurityPresets.enhanced())
const securedPUT = withSecurity(putHandler, SecurityPresets.enhanced())
const securedDELETE = withSecurity(deleteHandler, SecurityPresets.enhanced())

export { securedGET as GET, securedPUT as PUT, securedDELETE as DELETE }
