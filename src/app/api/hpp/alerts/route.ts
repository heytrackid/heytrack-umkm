import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { PaginationQuerySchema } from '@/lib/validations'
import type { Database } from '@/types/supabase-generated'
import type { SupabaseClient } from '@supabase/supabase-js'
import { apiLogger } from '@/lib/logger'
import { withCache, cacheKeys, cacheInvalidation } from '@/lib/cache'
import { HppAlertAgent } from '@/agents/automations/HppAlertAgent'

// Types removed - not needed

// GET /api/hpp/alerts - Get HPP alerts with pagination and filtering
export async function GET(_request: NextRequest) {
  try {
    // Create authenticated Supabase client
    const supabase = await createClient() as SupabaseClient<Database>

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error:')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(_request.url)

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
    const isRead = searchParams.get('is_read')
    const alertType = searchParams.get('alert_type')

    // Create cache key based on query parameters
    const cacheKey = `${cacheKeys.hpp.alerts}:${user.id}:${page}:${limit}:${search || ''}:${sort_by || ''}:${sort_order || ''}:${recipeId || ''}:${isRead || ''}:${alertType || ''}`

    // Wrap database query with caching
    const getAlerts = async () => {
      let query = supabase
        .from('hpp_alerts')
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

      if (isRead !== null) {
        query = query.eq('is_read', isRead === 'true')
      }

      if (alertType) {
        query = query.eq('alert_type', alertType)
      }

      if (search) {
        // Search in alert message or recipe name
        query = query.or(`message.ilike.%${search}%,recipes.name.ilike.%${search}%`)
      }

      // Apply sorting
      const sortColumn = sort_by || 'created_at'
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
        alerts: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }

    const result = await withCache(getAlerts, cacheKey, 300) // 5 minutes cache

    apiLogger.info({
      userId: user.id,
      count: result.alerts.length,
      total: result.total
    }, 'HPP alerts retrieved successfully')

    return NextResponse.json(result)

  } catch (err: unknown) {
    apiLogger.error({ error: err }, 'Error fetching HPP alerts')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/hpp/alerts - Trigger alert detection
export async function POST(request: NextRequest) {
  try {
    // Create authenticated Supabase client
    const supabase = await createClient() as SupabaseClient<Database>

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
    const { recipeIds, threshold } = body

    // Execute alert detection
    const alertAgent = new HppAlertAgent()
    const result = await alertAgent.executeAlertDetection({
      recipeIds,
      threshold: threshold || 10
    })

    // Invalidate cache
    await cacheInvalidation.hpp()

    apiLogger.info({
      userId: user.id,
      alertsCreated: (result.data as { alertsCreated?: number })?.alertsCreated,
      recipesChecked: (result.data as { recipesChecked?: number })?.recipesChecked
    }, 'Alert detection executed successfully')

    return NextResponse.json(result)

  } catch (err: unknown) {
    apiLogger.error({ error: err }, 'Error executing alert detection')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/hpp/alerts/[id]/read - Mark alert as read
export async function PATCH(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Create authenticated Supabase client
    const supabase = await createClient() as SupabaseClient<Database>

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error:')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const alertId = params.id
    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    // Mark alert as read
    const alertAgent = new HppAlertAgent()
    await alertAgent.markAlertAsRead(alertId)

    // Invalidate cache
    await cacheInvalidation.hpp()

    apiLogger.info({
      userId: user.id,
      alertId
    }, 'Alert marked as read successfully')

    return NextResponse.json({ success: true })

  } catch (err: unknown) {
    apiLogger.error({ error: err }, 'Error marking alert as read')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
