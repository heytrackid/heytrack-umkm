import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'
import { withCache, cacheKeys } from '@/lib/cache'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'
// Types removed - not needed - queries use specific fields

// GET /api/hpp/overview - Get comprehensive HPP overview data in one request
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const cacheKey = `${cacheKeys.hpp.overview}:${user.id}`

    const getOverviewData = async () => {
      // Parallel queries for better performance
      const [recipesResult, calculationsResult] = await Promise.all([
        // Get recipes count
        supabase
          .from('recipes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_active', true),

        // Get recipes with their costs
        supabase
          .from('recipes')
          .select('id, cost_per_unit, selling_price, margin_percentage')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .gt('cost_per_unit', 0)
      ])

      const totalRecipes = recipesResult.count || 0
      const recipesWithCost = calculationsResult.data || []

      // Calculate average HPP
      const averageHpp = recipesWithCost.length > 0
        ? recipesWithCost.reduce((sum, r) => sum + (Number(r.cost_per_unit) || 0), 0) / recipesWithCost.length
        : 0

      const recipesWithHpp = recipesWithCost.length

      return {
        totalRecipes,
        recipesWithHpp,
        averageHpp,
        totalAlerts: 0,
        unreadAlerts: 0,
        recentAlerts: []
      }
    }

    const result = await withCache(getOverviewData, cacheKey, 60) // 1 minute cache

    apiLogger.info({
      userId: user.id,
      totalRecipes: result.totalRecipes,
      recipesWithHpp: result.recipesWithHpp
    }, 'HPP overview retrieved successfully')

    return NextResponse.json(result)

  } catch (err: unknown) {
    apiLogger.error({ error: err }, 'Error fetching HPP overview')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
