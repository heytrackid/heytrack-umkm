import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { PaginationQuerySchema } from '@/lib/validations/api-validations'

import { apiLogger } from '@/lib/logger'
import { withCache, cacheKeys, cacheInvalidation } from '@/lib/cache'
import { HppCalculatorService } from '@/modules/hpp/services/HppCalculatorService'

// GET /api/hpp/calculations - Get HPP calculations with pagination and filtering
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
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Create cache key based on query parameters
    const cacheKey = `${cacheKeys.hpp.calculations}:${user.id}:${page}:${limit}:${search || ''}:${sort_by || ''}:${sort_order || ''}:${recipeId || ''}:${startDate || ''}:${endDate || ''}`

    // Wrap database query with caching
    const getCalculations = async () => {
      let query = supabase
        .from('hpp_calculations')
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

      if (startDate) {
        query = query.gte('calculation_date', startDate)
      }

      if (endDate) {
        query = query.lte('calculation_date', endDate)
      }

      if (search) {
        // Search in related recipe names
        query = query.ilike('recipes.name', `%${search}%`)
      }

      // Apply sorting
      const sortColumn = sort_by || 'calculation_date'
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
        calculations: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }

    const result = await withCache(getCalculations, cacheKey, 300) // 5 minutes cache

    apiLogger.info({
      userId: user.id,
      count: result.calculations.length,
      total: result.total
    }, 'HPP calculations retrieved successfully')

    return NextResponse.json(result)

  } catch (err: unknown) {
    apiLogger.error({ error: err }, 'Error fetching HPP calculations')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/hpp/calculations - Create new HPP calculation
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
    const { recipeId } = body

    if (!recipeId) {
      return NextResponse.json(
        { error: 'recipeId is required' },
        { status: 400 }
      )
    }

    // Calculate HPP using service
    const hppService = new HppCalculatorService()
    const calculationResult = await hppService.calculateRecipeHpp(recipeId)

    // Invalidate cache
    await cacheInvalidation.hpp()

    apiLogger.info({
      userId: user.id,
      recipeId,
      hppValue: calculationResult.totalHpp
    }, 'HPP calculation created successfully')

    return NextResponse.json({
      success: true,
      calculation: calculationResult
    })

  } catch (err: unknown) {
    apiLogger.error({ error: err }, 'Error creating HPP calculation')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
