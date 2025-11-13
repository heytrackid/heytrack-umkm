export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'

import { cacheInvalidation, cacheKeys, withCache } from '@/lib/cache'
import { RECIPE_FIELDS } from '@/lib/database/query-fields'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
import { PaginationQuerySchema } from '@/lib/validations'
import { RecipeInsertSchema } from '@/lib/validations/domains/recipe'
import { createPaginationMeta } from '@/lib/validations/pagination'
import type { Insert } from '@/types/database'
import { typed } from '@/types/type-utilities'

import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'



// GET /api/recipes - Get all recipes with ingredient relationships
async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Create authenticated Supabase client
    const supabase = typed(await createClient())

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error:')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)

    // If no limit is specified, return all data (no pagination)
    const hasLimit = searchParams.has('limit')

    // Validate query parameters
    const queryValidation = PaginationQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: hasLimit ? searchParams.get('limit') : '999999', // Very high limit = all data
      search: searchParams.get('search'),
      sort_by: searchParams.get('sort_by'),
      sort_order: searchParams.get('sort_order'),
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.issues },
        { status: 400 }
      )
    }

    const { page, limit, search, sort_by, sort_order } = queryValidation['data']
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    // Create cache key based on query parameters
    const cacheKey = `${cacheKeys.recipes.all}:${user['id']}:${page}:${limit}:${search ?? ''}:${sort_by ?? ''}:${sort_order ?? ''}:${category ?? ''}:${status ?? ''}`

    // Wrap database query with caching
    // ✅ OPTIMIZED: Use specific fields instead of SELECT *
    const result = await withCache(async () => {
      // Get total count
      let countQuery = supabase
        .from('recipes')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', user['id'])

      if (search) {
        countQuery = countQuery.ilike('name', `%${search}%`)
      }
      if (category) {
        countQuery = countQuery.ilike('category', `%${category}%`)
      }
      if (status) {
        countQuery = countQuery.eq('status', status)
      }

      const { count, error: countError } = await countQuery

      if (countError) {
        throw new Error(`Database error: ${countError.message}`)
      }

      // Get paginated data
      let query = supabase
        .from('recipes')
        .select(RECIPE_FIELDS.DETAIL) // Specific fields for better performance
        .eq('created_by', user['id'])

      // Add search filter
      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      // Add category filter
      if (category) {
        query = query.ilike('category', `%${category}%`)
      }

      // Add status filter
      if (status) {
        query = query.eq('status', status)
      }

      // Add sorting
      const sortField = sort_by ?? 'name'
      const sortDirection = sort_order === 'asc'
      query = query.order(sortField, { ascending: sortDirection })

      // Add pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data: recipes, error } = await query

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      return {
        data: recipes ?? [],
        meta: createPaginationMeta(page, limit, count ?? 0)
      }
    }, cacheKey, 10 * 60 * 1000) // Cache for 10 minutes

    apiLogger.info({
      userId: user['id'],
      cached: true,
      page,
      limit,
      search: search ?? '',
      resultCount: result['data'].length,
      total: result.meta.total
    }, 'Recipes fetched (cached)')

    const response = NextResponse.json(result)
    // Add HTTP caching headers (5 minutes stale-while-revalidate)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return response

  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in GET /api/recipes:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/recipes - Create new recipe with ingredients
async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Create authenticated Supabase client
    const supabase = typed(await createClient())

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error:')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const _body = await request.json() as unknown

    // Support legacy field names for backwards compatibility
    const bodyWithNormalization = _body as { recipe_ingredients?: unknown[]; ingredients?: unknown[]; name?: string; nama?: string; [key: string]: unknown }
    
    // Normalize ingredients field name
    if (bodyWithNormalization.recipe_ingredients && !bodyWithNormalization.ingredients) {
      bodyWithNormalization.ingredients = bodyWithNormalization.recipe_ingredients
    }

    // Normalize name field
    if (bodyWithNormalization.nama && !bodyWithNormalization.name) {
      bodyWithNormalization.name = bodyWithNormalization.nama
    }

    // Validate with Zod schema
    const validationResult = RecipeInsertSchema.safeParse(bodyWithNormalization)
    
    if (!validationResult.success) {
      apiLogger.warn({ errors: validationResult.error.issues }, 'Recipe validation failed')
      return NextResponse.json(
        { 
          error: 'Invalid recipe data', 
          details: validationResult.error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      )
    }

    const { ingredients, ...recipeData } = validationResult.data

    // Start a transaction by creating the recipe first
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert([{
        ...recipeData,
        created_by: user['id'],
        user_id: user['id']
      } as Insert<'recipes'>])
      .select('id, name, created_at')
      .single()

    if (recipeError) {
      apiLogger.error({ error: recipeError }, 'Error creating recipe:')
      return NextResponse.json(
        { error: 'Failed to create recipe' },
        { status: 500 }
      )
    }

    // Add ingredients to recipe_ingredients (already validated by schema)
    const createdRecipe = recipe
    const recipeIngredientsToInsert: Array<Insert<'recipe_ingredients'>> = ingredients.map((ingredient) => ({
      recipe_id: createdRecipe['id'],
      ingredient_id: ingredient.ingredient_id,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      notes: ingredient.notes ?? null,
      user_id: user['id']
    }))

    const { error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .insert(recipeIngredientsToInsert)

    if (ingredientsError) {
      apiLogger.error({ error: ingredientsError }, 'Error adding recipe ingredients:')
      // If ingredients fail, we should delete the recipe to maintain consistency
      await supabase
        .from('recipes')
        .delete()
        .eq('id', createdRecipe['id'])
        .eq('created_by', user['id'])
      return NextResponse.json(
        { error: 'Failed to add recipe ingredients' },
        { status: 500 }
      )
    }

    // Fetch the complete recipe with ingredients for response
    // ✅ OPTIMIZED: Use specific fields
    const { data: completeRecipe, error: fetchError } = await supabase
      .from('recipes')
      .select(RECIPE_FIELDS.DETAIL)
      .eq('id', createdRecipe['id'])
      .eq('created_by', user['id'])
      .single()

    if (fetchError) {
      apiLogger.error({ error: fetchError }, 'Error fetching complete recipe:')
      return NextResponse.json(recipe, { status: 201 })
    }

    // Invalidate cache after successful creation
    cacheInvalidation.recipes()

    return NextResponse.json(completeRecipe, { status: 201 })
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in POST /api/recipes:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Apply security middleware with enhanced security configuration
const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPOST = withSecurity(POST, SecurityPresets.enhanced())

// Export secured handlers
export { securedGET as GET, securedPOST as POST }
