import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { PaginationQuerySchema } from '@/lib/validations'
import { apiLogger } from '@/lib/logger'
import { withCache, cacheKeys, cacheInvalidation } from '@/lib/cache'
import { RECIPE_FIELDS } from '@/lib/database/query-fields'
import type { Database } from '@/types/supabase-generated'
// GET /api/recipes - Get all recipes with ingredient relationships
export async function GET(request: NextRequest) {
  try {
    // Create authenticated Supabase client
    const supabase = await createClient()

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

    // Validate query parameters
    const queryValidation = PaginationQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
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

    const { page, limit, search, sort_by, sort_order } = queryValidation.data
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    // Create cache key based on query parameters
    const cacheKey = `${cacheKeys.recipes.all}:${user.id}:${page}:${limit}:${search || ''}:${sort_by || ''}:${sort_order || ''}:${category || ''}:${status || ''}`

    // Wrap database query with caching
    // ✅ OPTIMIZED: Use specific fields instead of SELECT *
    const recipes = await withCache(async () => {
      let query = supabase
        .from('recipes')
        .select(RECIPE_FIELDS.DETAIL) // Specific fields for better performance
        .eq('created_by', user.id)

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
      const sortField = sort_by || 'name'
      const sortDirection = sort_order === 'asc'
      query = query.order(sortField, { ascending: sortDirection })

      // Add pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data: recipes, error } = await query

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      return recipes
    }, cacheKey, 10 * 60 * 1000) // Cache for 10 minutes

    apiLogger.info({
      userId: user.id,
      cached: true,
      page,
      limit,
      search: search || '',
      resultCount: recipes?.length || 0
    }, 'Recipes fetched (cached)')

    return NextResponse.json(recipes)

  } catch (err: unknown) {
    apiLogger.error({ err }, 'Error in GET /api/recipes:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/recipes - Create new recipe with ingredients
export async function POST(request: NextRequest) {
  try {
    // Create authenticated Supabase client
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error:')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { recipe_ingredients, ...recipeData } = body

    // Validate required fields
    if (!recipeData.name && !recipeData.nama) {
      return NextResponse.json(
        { error: 'Recipe name is required' },
        { status: 400 }
      )
    }

    // Start a transaction by creating the recipe first
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert([{
        ...recipeData,
        created_by: user.id,
        name: recipeData.name || recipeData.nama
      }])
      .select('id, name, created_at')
      .single()

    if (recipeError) {
      apiLogger.error({ error: recipeError }, 'Error creating recipe:')
      return NextResponse.json(
        { error: 'Failed to create recipe' },
        { status: 500 }
      )
    }

    // If ingredients are provided, add them to recipe_ingredients
    const createdRecipe = recipe
    if (recipe_ingredients && recipe_ingredients.length > 0) {
      type RecipeIngredientInput = {
        ingredient_id?: string
        bahan_id?: string
        quantity?: number
        qty_per_batch?: number
        unit?: string
      }

      const recipeIngredientsToInsert: Database['public']['Tables']['recipe_ingredients']['Insert'][] = recipe_ingredients.map((ingredient: RecipeIngredientInput) => ({
        recipe_id: createdRecipe.id,
        ingredient_id: ingredient.ingredient_id || ingredient.bahan_id || '',
        quantity: ingredient.quantity || ingredient.qty_per_batch || 0,
        unit: ingredient.unit || 'g',
        user_id: user.id
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
          .eq('id', createdRecipe.id)
          .eq('created_by', user.id)
        return NextResponse.json(
          { error: 'Failed to add recipe ingredients' },
          { status: 500 }
        )
      }
    }

    // Fetch the complete recipe with ingredients for response
    // ✅ OPTIMIZED: Use specific fields
    const { data: completeRecipe, error: fetchError } = await supabase
      .from('recipes')
      .select(RECIPE_FIELDS.DETAIL)
      .eq('id', createdRecipe.id)
      .eq('created_by', user.id)
      .single()

    if (fetchError) {
      apiLogger.error({ error: fetchError }, 'Error fetching complete recipe:')
      return NextResponse.json(recipe, { status: 201 })
    }

    // Invalidate cache after successful creation
    cacheInvalidation.recipes()

    return NextResponse.json(completeRecipe, { status: 201 })
  } catch (err: unknown) {
    apiLogger.error({ err }, 'Error in POST /api/recipes:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}