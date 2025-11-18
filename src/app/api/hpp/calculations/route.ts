// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { cacheInvalidation, cacheKeys, withCache } from '@/lib/cache'
import { apiLogger } from '@/lib/logger'
import { requireAuth, isErrorResponse } from '@/lib/api-auth'
import { PaginationQuerySchema } from '@/lib/validations/domains/common'
import { HppCalculatorService } from '@/services/hpp/HppCalculatorService'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'
import { typed } from '@/types/type-utilities'

import { createClient } from '@/utils/supabase/server'

const CalculateHppSchema = z.object({
  recipeId: z.string().uuid('Recipe ID harus valid'),
}).strict()

// GET /api/hpp/calculations - Get HPP calculations with pagination and filtering
async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    // Create authenticated Supabase client
    const supabase = await createClient()

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
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Create cache key based on query parameters
    const cacheKey = `${cacheKeys.hpp.calculations}:${user['id']}:${page}:${limit}:${search ?? ''}:${sort_by ?? ''}:${sort_order ?? ''}:${recipeId ?? ''}:${startDate ?? ''}:${endDate ?? ''}`

    // Wrap database query with caching
    const getCalculations = async (): Promise<{
      calculations: Array<{
        id: string
        recipe_id: string | null
        calculation_date: string | null
        material_cost: number | null
        labor_cost: number | null
        overhead_cost: number | null
        total_hpp: number | null
        cost_per_unit: number | null
        production_quantity: number | null
        wac_adjustment: number | null
        notes: string | null
        created_at: string | null
        user_id: string | null
        recipes: {
          id: string
          name: string
          category: string | null
        } | null
      }>
      total: number
      page: number
      limit: number
      totalPages: number
    }> => {
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
        .eq('user_id', user['id'])

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
      const sortColumn = sort_by ?? 'calculation_date'
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
        calculations: data ?? [],
        total: count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit)
      }
    }

    const result = await withCache(getCalculations, cacheKey, 300) // 5 minutes cache

    apiLogger.info({
      userId: user['id'],
      count: result.calculations.length,
      total: result.total
    }, 'HPP calculations retrieved successfully')

    return NextResponse.json(result)
  } catch (error) {
    apiLogger.error({ error }, 'Error fetching HPP calculations')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/hpp/calculations - Create new HPP calculation
async function postHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    // Create authenticated Supabase client
    const supabase = await createClient()

    const body = await request.json() as Record<string, unknown>
    const validatedData = CalculateHppSchema.parse(body)
    const { recipeId } = validatedData

    // Calculate HPP using consolidated service
    const hppService = new HppCalculatorService()
    const calculationResult = await hppService.calculateRecipeHpp(typed(supabase), recipeId, user['id'])

    // Invalidate cache
    cacheInvalidation.hpp()

    apiLogger.info({
      userId: user['id'],
      recipeId,
      hppValue: calculationResult.total_hpp
    }, 'HPP calculation created successfully')

    return NextResponse.json({
      success: true,
      calculation: calculationResult
    })
  } catch (error) {
    apiLogger.error({ error }, 'Error creating HPP calculation')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/hpp/calculations', SecurityPresets.enhanced())
export const POST = createSecureHandler(postHandler, 'POST /api/hpp/calculations', SecurityPresets.enhanced())
