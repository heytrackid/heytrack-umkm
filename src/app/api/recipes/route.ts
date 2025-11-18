export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { cacheInvalidation, cacheKeys, withCache } from '@/lib/cache'
import { RECIPE_FIELDS } from '@/lib/database/query-fields'
import { apiLogger } from '@/lib/logger'
import { createPaginationMeta } from '@/lib/validations/pagination'
import { RecipeInsertSchema } from '@/lib/validations/domains/recipe'
import type { RecipeIngredientInsert, RecipeInsert } from '@/types/database'
import { NextResponse } from 'next/server'

const RecipeListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(999999),
  search: z.string().optional(),
  sort_by: z.string().optional().default('name'),
  sort_order: z.enum(['asc', 'desc']).optional().default('asc'),
  status: z.string().optional(),
})

// GET /api/recipes - List recipes with caching
async function getRecipesHandler(
  context: RouteContext,
  query?: z.infer<typeof RecipeListQuerySchema>
): Promise<NextResponse> {
  const { user, supabase } = context
  const { page = 1, limit = 999999, search, sort_by = 'name', sort_order = 'asc', status } = query || {}

  const cacheKey = `${cacheKeys.recipes.all}:${user.id}:${page}:${limit}:${search ?? ''}:${sort_by}:${sort_order}:${status ?? ''}`

  const result = await withCache(async () => {
    let countQuery = supabase
      .from('recipes' as never)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (search) countQuery = countQuery.ilike('name', `%${search}%`)

    let queryBuilder = supabase
      .from('recipes' as never)
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
      meta: createPaginationMeta(page, limit, count ?? 0)
    }
  }, cacheKey, 10 * 60 * 1000)

  apiLogger.info({ userId: user.id, cached: true, page, limit, resultCount: result.data.length }, 'Recipes fetched')

  const response = NextResponse.json(result)
  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  return response
}

export const GET = createApiRoute(
  { method: 'GET', path: '/api/recipes', querySchema: RecipeListQuerySchema },
  getRecipesHandler
)

// POST /api/recipes - Create recipe with ingredients
async function createRecipeHandler(
  context: RouteContext,
  _query?: never,
  body?: z.infer<typeof RecipeInsertSchema>
): Promise<NextResponse> {
  const { user, supabase } = context

  if (!body) {
    return NextResponse.json({ error: 'Request body is required' }, { status: 400 })
  }

  const { ingredients, ...recipeData } = body
  const recipeInsert: RecipeInsert = {
    ...recipeData,
    user_id: user.id,
    is_active: recipeData.is_active ?? true,
    created_by: user.id,
    updated_by: user.id
  } as RecipeInsert

  const { data: recipe, error: recipeError } = await supabase
    .from('recipes' as never)
    .insert(recipeInsert as never)
    .select(RECIPE_FIELDS.DETAIL)
    .single()

  if (recipeError) {
    apiLogger.error({ error: recipeError }, 'Error creating recipe')
    return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 })
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

    const { error: ingredientsError } = await supabase
      .from('recipe_ingredients' as never)
      .insert(recipeIngredients as never)

    if (ingredientsError) {
      apiLogger.error({ error: ingredientsError }, 'Error creating recipe ingredients')
      await supabase.from('recipes' as never).delete().eq('id', createdRecipe.id).eq('user_id', user.id)
      return NextResponse.json({ error: 'Failed to create recipe ingredients' }, { status: 500 })
    }
  }

  cacheInvalidation.recipes()
  apiLogger.info({ userId: user.id, recipeId: createdRecipe.id }, 'Recipe created')

  return NextResponse.json(recipe, { status: 201 })
}

export const POST = createApiRoute(
  { method: 'POST', path: '/api/recipes', bodySchema: RecipeInsertSchema },
  createRecipeHandler
)
