// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
import { handleAPIError } from '@/lib/errors/api-error-handler'
export const runtime = 'nodejs'

/**
 * Optimized Recipes API Route
 * Example of using caching and performance optimizations
 */

import { createSuccessResponse } from '@/lib/api-core/responses'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { apiLogger, dbLogger } from '@/lib/logger'
import { safeNumber, getErrorMessage } from '@/lib/type-guards'
import type { NextResponse } from 'next/server'

async function getHandler(context: RouteContext): Promise<NextResponse> {
  const { user, supabase, request } = context

  try {
    apiLogger.info({ url: request.url }, 'GET /api/recipes/optimized - Request received')

    // Parse query params
    const {searchParams} = request.nextUrl
    const isActive = searchParams.get('is_active')
    const limit = safeNumber(searchParams.get('limit'), 50)

    // Build optimized query
    let query = supabase
      .from('recipes')
      .select(
        `
        id,
        name,
        description,
        batch_size,
        total_cost,
        is_active,
        created_at,
        recipe_ingredients (
          id,
          quantity,
          ingredient:ingredients (
            id,
            name,
            unit,
            price_per_unit
          )
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Apply filters
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data: recipes, error, count } = await query

    if (error) {
      dbLogger.error({ error, userId: user.id, msg: 'Failed to fetch recipes' })
      return handleAPIError(new Error('Failed to fetch recipes'), 'API Route')
    }

    return createSuccessResponse({
      recipes: recipes ?? [],
      total: count ?? 0,
      limit
    })
  } catch (error) {
    dbLogger.error({ error: getErrorMessage(error), msg: 'Recipes API error' })
    return handleAPIError(new Error('Internal server error'), 'API Route')
  }
}

export const GET = createApiRoute(
  { method: 'GET', path: '/api/recipes/optimized' },
  getHandler
)
