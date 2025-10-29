/**
 * Optimized Recipes API Route
 * Example of using caching and performance optimizations
 */

import { createCachedResponse, cachePresets } from '@/lib/api-cache'
import { dbLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
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
    const limit = parseInt(searchParams.get('limit') || '50')

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
        recipes: recipes || [],
        total: count || 0,
        limit
      },
      cacheConfig
    )
  } catch (err) {
    dbLogger.error({ err, msg: 'Recipes API error' })
    return createCachedResponse(
      { error: 'Internal server error' },
      cachePresets.realtime
    )
  }
}
