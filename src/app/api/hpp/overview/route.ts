import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'
import { withCache, cacheKeys } from '@/lib/cache'
import type { Database } from '@/types/supabase-generated'

type Recipe = Database['public']['Tables']['recipes']['Row']
type HppAlert = Database['public']['Tables']['hpp_alerts']['Row']
type HppSnapshot = Database['public']['Tables']['hpp_snapshots']['Row']
type HppCalculation = Database['public']['Tables']['hpp_calculations']['Row']

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
      const [recipesResult, alertsResult, snapshotsResult, calculationsResult] = await Promise.all([
        // Get recipes count
        supabase
          .from('recipes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_active', true),

        // Get unread alerts
        supabase
          .from('hpp_alerts')
          .select('id, recipe_id, alert_type, message, created_at, recipes(name)', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(5),

        // Get recent snapshots
        supabase
          .from('hpp_snapshots')
          .select('id, recipe_id, hpp_value, snapshot_date, recipes(name)')
          .eq('user_id', user.id)
          .order('snapshot_date', { ascending: false })
          .limit(10),

        // Get recipes with their costs
        supabase
          .from('recipes')
          .select('id, cost_per_unit, selling_price, margin_percentage')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .gt('cost_per_unit', 0)
      ])

      const totalRecipes = recipesResult.count || 0
      const unreadAlerts = alertsResult.data || []
      const recentSnapshots = snapshotsResult.data || []
      const recipesWithCost = calculationsResult.data || []

      // Calculate average HPP
      const averageHpp = recipesWithCost.length > 0
        ? recipesWithCost.reduce((sum, r) => sum + (Number(r.cost_per_unit) || 0), 0) / recipesWithCost.length
        : 0

      const recipesWithHpp = recipesWithCost.length

      // Get total alerts count
      const totalAlertsResult = await supabase
        .from('hpp_alerts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      return {
        totalRecipes,
        recipesWithHpp,
        averageHpp,
        totalAlerts: totalAlertsResult.count || 0,
        unreadAlerts: unreadAlerts.length,
        recentAlerts: unreadAlerts.map(alert => {
          const recipes = alert.recipes as { name: string } | Array<{ name: string }> | null
          const recipeName = Array.isArray(recipes) ? recipes[0]?.name : recipes?.name
          return {
            id: alert.id,
            recipe_id: alert.recipe_id,
            recipe_name: recipeName || 'Unknown',
            alert_type: alert.alert_type,
            message: alert.message,
            created_at: alert.created_at
          }
        }),
        recentSnapshots: recentSnapshots.map(snapshot => {
          const recipes = snapshot.recipes as { name: string } | Array<{ name: string }> | null
          const recipeName = Array.isArray(recipes) ? recipes[0]?.name : recipes?.name
          return {
            id: snapshot.id,
            recipe_id: snapshot.recipe_id,
            recipe_name: recipeName || 'Unknown',
            hpp_value: snapshot.hpp_value,
            snapshot_date: snapshot.snapshot_date
          }
        })
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
