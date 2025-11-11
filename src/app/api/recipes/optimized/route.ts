// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

/**
 * Optimized Recipes API Route
 * Example of using caching and performance optimizations
 */

import { createCachedResponse, cachePresets } from '@/lib/api-cache'
import { apiLogger, dbLogger } from '@/lib/logger'
import { safeNumber, getErrorMessage } from '@/lib/type-guards'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'

import type { NextRequest, NextResponse } from 'next/server'

async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    apiLogger.info({ url: request.url }, 'GET /api/recipes/optimized - Request received')
    const supabase = await createClient()

    // Get user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createCachedResponse(
        { error: 'Unauthorized' },
        cachePresets.realtime
      )
    }

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
      .eq('user_id', user['id'])
      .order('created_at', { ascending: false })
      .limit(limit)

    // Apply filters
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data: recipes, error, count } = await query

    if (error) {
      dbLogger.error({ error, userId: user['id'], msg: 'Failed to fetch recipes' })
      return createCachedResponse(
        { error: 'Failed to fetch recipes' },
        cachePresets.realtime
      )
    }

    // Use appropriate cache strategy based on data
    const cacheConfig = isActive === 'true' 
      ? cachePresets.dynamic // Active recipes change more often
      : cachePresets.static // All recipes are more stable

    return createCachedResponse(
      {
        recipes: recipes ?? [],
        total: count ?? 0,
        limit
      },
      cacheConfig
    )
  } catch (error: unknown) {
    dbLogger.error({ error: getErrorMessage(error), msg: 'Recipes API error' })
    return createCachedResponse(
      { error: 'Internal server error' },
      cachePresets.realtime
    )
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/recipes/optimized', SecurityPresets.enhanced())
