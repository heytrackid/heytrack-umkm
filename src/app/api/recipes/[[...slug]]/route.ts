// External libraries
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Internal modules
import { createPaginationMeta, createSuccessResponse } from '@/lib/api-core'
import { createGetHandler } from '@/lib/api/crud-helpers'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { parseRouteParams } from '@/lib/api/route-helpers'
import { cacheInvalidation, withCache } from '@/lib/cache'
import { generateCacheKey } from '@/lib/cache/cache-manager'
import { RECIPE_FIELDS } from '@/lib/database/query-fields'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { SecurityPresets } from '@/utils/security/api-middleware'

// Types and schemas
import { PaginationQuerySchema, RecipeIngredientSchema } from '@/lib/validations/common'
import { RecipeInsertSchema } from '@/lib/validations/domains/recipe'
import type { Database, RecipeIngredientInsert, RecipeInsert } from '@/types/database'

// Constants and config
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'

export const runtime = 'nodejs'

type TypedSupabaseClient = SupabaseClient<Database>

// Use centralized PaginationQuerySchema with recipe-specific extensions
const RecipeListQuerySchema = PaginationQuerySchema.extend({
  status: z.string().optional(),
})

// RecipeIngredientSchema now imported from centralized location

const RecipeUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  prep_time: z.number().int().positive().optional(),
  cook_time: z.number().int().positive().optional(),
  servings: z.number().int().positive().optional(),
  yield_unit: z.string().min(1).max(50).optional(),
  selling_price: z.number().positive().optional(),
  is_active: z.boolean().optional(),
  ingredients: z.array(RecipeIngredientSchema).optional(),
})

// GET /api/recipes or /api/recipes/[id]
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/recipes',
    querySchema: RecipeListQuerySchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context, validatedQuery) => {
    const { params } = context
    const { slug } = parseRouteParams(params)

    if (!slug || slug.length === 0) {
      // GET /api/recipes - List recipes
      const { user, supabase } = context
      const query = (validatedQuery as z.infer<typeof RecipeListQuerySchema>) ?? {}
      const { page = 1, limit = 999999, search, sort_by = 'name', sort_order = 'asc', status } = query
      const typedSupabase = supabase as TypedSupabaseClient

      const cacheKey = generateCacheKey('RECIPES', [user.id, 'list', page.toString(), limit.toString(), search ?? '', sort_by, sort_order, status ?? ''])

      const result = await withCache(async () => {
        let countQuery = typedSupabase
          .from('recipes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if (search) countQuery = countQuery.ilike('name', `%${search}%`)

        let queryBuilder = typedSupabase
          .from('recipes')
          .select(RECIPE_FIELDS.DETAIL)
          .eq('user_id', user.id)

        if (search) queryBuilder = queryBuilder.ilike('name', `%${search}%`)

        // Apply status filter
        if (status === 'active') {
          queryBuilder = queryBuilder.eq('is_active', true)
          countQuery = countQuery.eq('is_active', true)
        } else if (status === 'inactive') {
          queryBuilder = queryBuilder.eq('is_active', false)
          countQuery = countQuery.eq('is_active', false)
        } else if (status) {
          queryBuilder = queryBuilder.eq('status', status)
          countQuery = countQuery.eq('status', status)
        } else {
          queryBuilder = queryBuilder.eq('is_active', true)
          countQuery = countQuery.eq('is_active', true)
        }

        const { count, error: countError } = await countQuery
        if (countError) throw new Error(`Database error: ${countError.message}`)

        queryBuilder = queryBuilder.order(sort_by, { ascending: sort_order === 'asc' })
        const offset = (page - 1) * limit
        queryBuilder = queryBuilder.range(offset, offset + limit - 1)

        const { data: recipes, error } = await queryBuilder
        if (error) throw new Error(`Database error: ${error.message}`)

        return {
          data: recipes ?? [],
          pagination: createPaginationMeta(page, limit, count ?? 0)
        }
      }, cacheKey, 10 * 60 * 1000)

      apiLogger.info({ userId: user.id, cached: true, page, limit, resultCount: result.data.length }, 'Recipes fetched')

      const response = createSuccessResponse(result.data, undefined, result.pagination)
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
      return response as import('next/server').NextResponse
    } else if (slug.length === 1 && slug[0]) {
      // GET /api/recipes/[id] - Get single recipe
      // Pass the ID from slug to context.params for createGetHandler
      const contextWithId = {
        ...context,
        params: { ...context.params, id: slug[0] } as Record<string, string | string[]>
      }
      return createGetHandler({
        table: 'recipes',
        selectFields: RECIPE_FIELDS.DETAIL,
      })(contextWithId)
    } else {
      return handleAPIError(new Error('Invalid path'), 'GET /api/recipes')
    }
  }
)

// POST /api/recipes - Create recipe
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/recipes',
    bodySchema: RecipeInsertSchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (slug && slug.length > 0) {
      return handleAPIError(new Error('Method not allowed'), 'POST /api/recipes')
    }

    const { user, supabase } = context
    const typedSupabase = supabase as TypedSupabaseClient

    if (!body) {
      return handleAPIError(new Error('Request body is required'), 'POST /api/recipes')
    }

    const { ingredients, ...recipeData } = body
    const recipeInsert: RecipeInsert = {
      ...recipeData,
      user_id: user.id,
      is_active: recipeData.is_active ?? true,
      created_by: user.id,
      updated_by: user.id
    } as unknown as RecipeInsert

    const { data: recipe, error: recipeError } = await typedSupabase
      .from('recipes')
      .insert(recipeInsert)
      .select(RECIPE_FIELDS.DETAIL)
      .single()

    if (recipeError) {
      apiLogger.error({ error: recipeError }, 'Error creating recipe')
      return handleAPIError(recipeError, 'POST /api/recipes')
    }

    const createdRecipe = recipe as { id: string }

    // Create recipe ingredients
    if (ingredients && ingredients.length > 0) {
      const ingredientIds = ingredients.map((ing) => ing.ingredient_id)
      const { data: ingredientRows, error: ingredientError } = await typedSupabase
        .from('ingredients')
        .select('id, unit')
        .in('id', ingredientIds)
        .eq('user_id', user.id)

      if (ingredientError) {
        apiLogger.error({ error: ingredientError }, 'Error fetching ingredients for unit enforcement')
        await typedSupabase.from('recipes').delete().eq('id', createdRecipe.id).eq('user_id', user.id)
        return handleAPIError(ingredientError, 'POST /api/recipes')
      }

      const unitByIngredientId = new Map(
        (ingredientRows ?? []).map((row) => [row.id, row.unit])
      )

      const recipeIngredients = ingredients.map((ing) => ({
        recipe_id: createdRecipe.id,
        ingredient_id: ing.ingredient_id,
        quantity: ing.quantity,
        unit: unitByIngredientId.get(ing.ingredient_id) ?? 'pcs',
        user_id: user.id
      })) as RecipeIngredientInsert[]

      const { error: ingredientsError } = await typedSupabase
        .from('recipe_ingredients')
        .insert(recipeIngredients)

      if (ingredientsError) {
        apiLogger.error({ error: ingredientsError }, 'Error creating recipe ingredients')
        await typedSupabase.from('recipes').delete().eq('id', createdRecipe.id).eq('user_id', user.id)
        return handleAPIError(ingredientsError, 'POST /api/recipes')
      }
    }

    cacheInvalidation.recipes()
    apiLogger.info({ userId: user.id, recipeId: createdRecipe.id }, 'Recipe created')

    // Trigger initial HPP calculation for new recipe with ingredients
    if (ingredients && ingredients.length > 0) {
      try {
        const { HppTriggerService } = await import('@/services/hpp/HppTriggerService')
        const hppTrigger = new HppTriggerService({ userId: user.id, supabase: typedSupabase })
        await hppTrigger.onRecipeIngredientsChange(createdRecipe.id)
        apiLogger.info({ recipeId: createdRecipe.id }, 'Initial HPP calculated for new recipe')
      } catch (hppError) {
        apiLogger.error({ error: hppError, recipeId: createdRecipe.id }, 'Failed to calculate initial HPP')
      }
    }

    return createSuccessResponse(recipe, SUCCESS_MESSAGES.RECIPE_CREATED, undefined, 201)
  }
)

// PUT /api/recipes/[id] - Update recipe with ingredients and HPP trigger
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/recipes/[id]',
    bodySchema: RecipeUpdateSchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1 || !slug[0]) {
      return handleAPIError(new Error('Invalid path'), 'PUT /api/recipes')
    }

    const { user, supabase } = context
    const recipeId = slug[0]
    const typedSupabase = supabase as TypedSupabaseClient

    if (!body) {
      return handleAPIError(new Error('Request body is required'), 'PUT /api/recipes')
    }

    // Separate ingredients from recipe data
    const { ingredients, ...recipeData } = body

    // Build update object with proper null handling for optional fields
    const updateData: Record<string, unknown> = {
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }
    
    // Only include fields that are explicitly provided
    if (recipeData['name'] !== undefined) updateData['name'] = recipeData['name']
    if (recipeData['description'] !== undefined) updateData['description'] = recipeData['description'] ?? null
    if (recipeData['image_url'] !== undefined) updateData['image_url'] = recipeData['image_url'] ?? null
    if (recipeData['prep_time'] !== undefined) updateData['prep_time'] = recipeData['prep_time'] ?? null
    if (recipeData['cook_time'] !== undefined) updateData['cook_time'] = recipeData['cook_time'] ?? null
    if (recipeData['servings'] !== undefined) updateData['servings'] = recipeData['servings'] ?? null
    if (recipeData['yield_unit'] !== undefined) updateData['yield_unit'] = recipeData['yield_unit']
    if (recipeData['selling_price'] !== undefined) updateData['selling_price'] = recipeData['selling_price'] ?? null
    if (recipeData['is_active'] !== undefined) updateData['is_active'] = recipeData['is_active']

    // Update recipe base data
    const { data: updatedRecipe, error: recipeError } = await typedSupabase
      .from('recipes')
      .update(updateData)
      .eq('id', recipeId)
      .eq('user_id', user.id)
      .select(RECIPE_FIELDS.DETAIL)
      .single()

    if (recipeError) {
      apiLogger.error({ error: recipeError, recipeId }, 'Failed to update recipe')
      return handleAPIError(recipeError, 'PUT /api/recipes')
    }

    // Update ingredients if provided
    let ingredientsChanged = false
    if (ingredients && ingredients.length > 0) {
      // Delete existing ingredients
      const { error: deleteError } = await typedSupabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', recipeId)
        .eq('user_id', user.id)

      if (deleteError) {
        apiLogger.error({ error: deleteError, recipeId }, 'Failed to delete old recipe ingredients')
        return handleAPIError(deleteError, 'PUT /api/recipes')
      }

      const ingredientIds = ingredients.map((ing) => ing.ingredient_id)
      const { data: ingredientRows, error: ingredientError } = await typedSupabase
        .from('ingredients')
        .select('id, unit')
        .in('id', ingredientIds)
        .eq('user_id', user.id)

      if (ingredientError) {
        apiLogger.error({ error: ingredientError }, 'Error fetching ingredients for unit enforcement')
        return handleAPIError(ingredientError, 'PUT /api/recipes')
      }

      const unitByIngredientId = new Map(
        (ingredientRows ?? []).map((row) => [row.id, row.unit])
      )

      // Insert new ingredients (unit is enforced from ingredient.unit)
      const recipeIngredients = ingredients.map((ing) => ({
        recipe_id: recipeId,
        ingredient_id: ing.ingredient_id,
        quantity: ing.quantity,
        unit: unitByIngredientId.get(ing.ingredient_id) ?? 'pcs',
        notes: ing.notes ?? null,
        user_id: user.id
      })) as RecipeIngredientInsert[]

      const { error: insertError } = await typedSupabase
        .from('recipe_ingredients')
        .insert(recipeIngredients)

      if (insertError) {
        apiLogger.error({ error: insertError, recipeId }, 'Failed to insert new recipe ingredients')
        return handleAPIError(insertError, 'PUT /api/recipes')
      }

      ingredientsChanged = true
      apiLogger.info({ recipeId, ingredientCount: ingredients.length }, 'Recipe ingredients updated')
    }

    // Trigger HPP recalculation if ingredients changed
    if (ingredientsChanged) {
      try {
        const { HppTriggerService } = await import('@/services/hpp/HppTriggerService')
        const hppTrigger = new HppTriggerService({ userId: user.id, supabase: typedSupabase })
        await hppTrigger.onRecipeIngredientsChange(recipeId)
        apiLogger.info({ recipeId }, 'HPP recalculated after ingredients update')
      } catch (hppError) {
        apiLogger.error({ error: hppError, recipeId }, 'Failed to recalculate HPP after ingredients update')
      }
    }

    cacheInvalidation.recipes(recipeId)

    return createSuccessResponse(updatedRecipe, SUCCESS_MESSAGES.RECIPE_UPDATED)
  }
)

// DELETE /api/recipes/[id] - Delete recipe with FK validation
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/recipes/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1 || !slug[0]) {
      return handleAPIError(new Error('Invalid path'), 'DELETE /api/recipes')
    }

    const { user, supabase } = context
    const recipeId = slug[0]
    const typedSupabase = supabase as TypedSupabaseClient

    // Check if recipe is used in orders (FK RESTRICT will block anyway, but give user-friendly message)
    const { data: orderItems } = await typedSupabase
      .from('order_items')
      .select('id')
      .eq('recipe_id', recipeId)
      .limit(1)

    if (orderItems && orderItems.length > 0) {
      return handleAPIError(
        new Error('Cannot delete recipe because it is used in existing orders. Consider deactivating the recipe instead.'),
        'DELETE /api/recipes'
      )
    }

    // Check if recipe is used in production batches
    const { data: productionBatches } = await typedSupabase
      .from('production_batches')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', user.id)
      .limit(1)

    if (productionBatches && productionBatches.length > 0) {
      return handleAPIError(
        new Error('Cannot delete recipe because it has production history. Consider deactivating the recipe instead.'),
        'DELETE /api/recipes'
      )
    }

    // Proceed with delete
    const { error } = await typedSupabase
      .from('recipes')
      .delete()
      .eq('id', recipeId)
      .eq('user_id', user.id)

    if (error) {
      // Handle FK constraint error with user-friendly message
      if (error.code === '23503') {
        return handleAPIError(
          new Error('Cannot delete recipe because it is currently in use. Consider deactivating the recipe instead.'),
          'DELETE /api/recipes'
        )
      }
      return handleAPIError(error, 'DELETE /api/recipes')
    }

    cacheInvalidation.recipes(recipeId)
    apiLogger.info({ userId: user.id, recipeId }, 'Recipe deleted')

    return createSuccessResponse({ id: recipeId }, SUCCESS_MESSAGES.RECIPE_DELETED)
  }
)