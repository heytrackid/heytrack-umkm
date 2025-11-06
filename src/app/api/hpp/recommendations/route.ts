import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { PaginationQuerySchema } from '@/lib/validations'
import { apiLogger } from '@/lib/logger'
import { withCache, cacheKeys, cacheInvalidation } from '@/lib/cache'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

// GET /api/hpp/recommendations - Get HPP recommendations
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
    const recipeId = searchParams.get('recipe_id')
    const priority = searchParams.get('priority')
    const isImplemented = searchParams.get('is_implemented')

    // Create cache key based on query parameters
    const cacheKey = `${cacheKeys.hpp.recommendations}:${user.id}:${page}:${limit}:${search ?? ''}:${sort_by ?? ''}:${sort_order ?? ''}:${recipeId ?? ''}:${priority ?? ''}:${isImplemented ?? ''}`

    // Wrap database query with caching
    const getRecommendations = async () => {
      let query = supabase
        .from('hpp_recommendations')
        .select(`
          *,
          recipes (
            id,
            name,
            category
          )
        `, { count: 'exact' })
        .eq('user_id', user.id)

      // Apply filters
      if (recipeId) {
        query = query.eq('recipe_id', recipeId)
      }

      if (priority) {
        query = query.eq('priority', priority)
      }

      if (isImplemented !== null) {
        query = query.eq('is_implemented', isImplemented === 'true')
      }

      if (search) {
        // Search in title, description, or recipe name
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,recipes.name.ilike.%${search}%`)
      }

      // Apply sorting
      const sortColumn = sort_by ?? 'created_at'
      const sortDirection = sort_order || 'desc'
      query = query.order(sortColumn, { ascending: sortDirection === 'asc' })

      // Apply pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      return {
        recommendations: data || [],
        total: count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit)
      }
    }

    const result = await withCache(getRecommendations, cacheKey, 300) // 5 minutes cache

    apiLogger.info({
      userId: user.id,
      count: result.recommendations.length,
      total: result.total
    }, 'HPP recommendations retrieved successfully')

    return NextResponse.json(result)

  } catch (err: unknown) {
    apiLogger.error({ error: err }, 'Error fetching HPP recommendations')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/hpp/recommendations - Create new recommendation
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
    }    const body = await request.json()
    const { recipeId, recommendationType, title, description, potentialSavings, priority } = body

    if (!recipeId || !recommendationType || !title || !description) {
      return NextResponse.json(
        { error: 'recipeId, recommendationType, title, and description are required' },
        { status: 400 }
      )
    }

    // Create recommendation
    const { data, error } = await supabase
      .from('hpp_recommendations')
      .insert({
        recipe_id: recipeId,
        recommendation_type: recommendationType,
        title,
        description,
        potential_savings: potentialSavings ?? 0,
        priority: priority ?? 'MEDIUM',
        is_implemented: false,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create recommendation: ${error.message}`)
    }

    // Invalidate cache
    cacheInvalidation.hpp()

    apiLogger.info({
      userId: user.id,
      recommendationId: data.id,
      recipeId
    }, 'HPP recommendation created successfully')

    return NextResponse.json({
      success: true,
      recommendation: data
    })

  } catch (err: unknown) {
    apiLogger.error({ error: err }, 'Error creating HPP recommendation')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
