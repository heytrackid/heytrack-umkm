// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

import { cacheInvalidation, cacheKeys, withCache } from '@/lib/cache'
import { apiLogger } from '@/lib/logger'
import { PaginationQuerySchema } from '@/lib/validations'
import type { HppRecommendationsTable } from '@/types/database'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'

import { createClient } from '@/utils/supabase/server'

// GET /api/hpp/recommendations - Get HPP recommendations
async function getHandler(request: NextRequest): Promise<NextResponse> {
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

    const { page, limit, search, sort_by, sort_order } = queryValidation['data']
    const recipeId = searchParams.get('recipe_id')
    const priority = searchParams.get('priority')
    const isImplemented = searchParams.get('is_implemented')

    // Create cache key based on query parameters
    const cacheKey = `${cacheKeys.hpp.recommendations}:${user['id']}:${page}:${limit}:${search ?? ''}:${sort_by ?? ''}:${sort_order ?? ''}:${recipeId ?? ''}:${priority ?? ''}:${isImplemented ?? ''}`

    // Wrap database query with caching
    const getRecommendations = async (): Promise<{ recommendations: HppRecommendationsTable[], total: number, page: number, limit: number, totalPages: number }> => {
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
        .eq('user_id', user['id'])

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
        recommendations: data ?? [],
        total: count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit)
      }
    }

    const result = await withCache(getRecommendations, cacheKey, 300) // 5 minutes cache

    apiLogger.info({
      userId: user['id'],
      count: result.recommendations.length,
      total: result.total
    }, 'HPP recommendations retrieved successfully')

    return NextResponse.json(result)

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error fetching HPP recommendations')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/hpp/recommendations - Create new recommendation
async function postHandler(request: NextRequest): Promise<NextResponse> {
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
    const body = await request.json() as {
      recipeId?: string
      recommendationType?: string
      title?: string
      description?: string
      potentialSavings?: number
      priority?: string
    }
    const { recipeId, recommendationType, title, description, potentialSavings, priority } = body

    if (!recipeId || !recommendationType || !title || !description) {
      return NextResponse.json(
        { error: 'recipeId, recommendationType, title, and description are required' },
        { status: 400 }
      )
    }

    // Create recommendation
    const insertData = {
      recipe_id: recipeId,
      recommendation_type: recommendationType,
      title,
      description,
      potential_savings: potentialSavings ?? 0,
      priority: priority ?? 'MEDIUM',
      is_implemented: false,
      user_id: user['id']
    }
    const { data, error } = await supabase
      .from('hpp_recommendations')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create recommendation: ${error.message}`)
    }

    // Invalidate cache
    cacheInvalidation.hpp()

    apiLogger.info({
      userId: user['id'],
      recommendationId: data['id'],
      recipeId
    }, 'HPP recommendation created successfully')

    return NextResponse.json({
      success: true,
      recommendation: data
    })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error creating HPP recommendation')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/hpp/recommendations', SecurityPresets.enhanced())
export const POST = createSecureHandler(postHandler, 'POST /api/hpp/recommendations', SecurityPresets.enhanced())
