// External libraries
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

// Internal modules
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { parseRouteParams } from '@/lib/api/route-helpers'
import { createDeleteHandler, createGetHandler, createUpdateHandler } from '@/lib/api/crud-helpers'
import { createPaginationMeta, createSuccessResponse } from '@/lib/api-core'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { cacheInvalidation, withCache } from '@/lib/cache'
import { generateCacheKey } from '@/lib/cache/cache-manager'
import { RECIPE_FIELDS } from '@/lib/database/query-fields'
import { apiLogger } from '@/lib/logger'
import { SecurityPresets } from '@/utils/security/api-middleware'

// Types and schemas
import type { Database, RecipeIngredientInsert, RecipeInsert } from '@/types/database'
import { RecipeInsertSchema } from '@/lib/validations/domains/recipe'

// Constants and config
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'

export const runtime = 'nodejs'

type TypedSupabaseClient = SupabaseClient<Database>

const RecipeListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(999999),
  search: z.string().optional(),
  sort_by: z.string().optional().default('name'),
  sort_order: z.enum(['asc', 'desc']).optional().default('asc'),
  status: z.string().optional(),
})

const RecipeUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  prep_time: z.number().int().positive().optional(),
  cook_time: z.number().int().positive().optional(),
  servings: z.number().int().positive().optional(),
  selling_price: z.number().positive().optional(),
  is_active: z.boolean().optional(),
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
    } else if (slug.length === 1) {
      // GET /api/recipes/[id] - Get single recipe
      return createGetHandler({
        table: 'recipes',
        selectFields: RECIPE_FIELDS.DETAIL,
      })(context)
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
      const recipeIngredients = ingredients.map((ing) => ({
        recipe_id: createdRecipe.id,
        ingredient_id: ing.ingredient_id,
        quantity: ing.quantity,
        unit: ing.unit || 'pcs',
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

    return createSuccessResponse(recipe, SUCCESS_MESSAGES.RECIPE_CREATED, undefined, 201)
  }
)

// PUT /api/recipes/[id] - Update recipe
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/recipes/[id]',
    bodySchema: RecipeUpdateSchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'PUT /api/recipes')
    }
    return createUpdateHandler({
      table: 'recipes',
      selectFields: RECIPE_FIELDS.DETAIL,
    }, SUCCESS_MESSAGES.RECIPE_UPDATED)(context, undefined, body)
  }
)

// DELETE /api/recipes/[id] - Delete recipe
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/recipes/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'DELETE /api/recipes')
    }
    return createDeleteHandler(
      {
        table: 'recipes',
      },
      SUCCESS_MESSAGES.RECIPE_DELETED
    )(context)
  }
)