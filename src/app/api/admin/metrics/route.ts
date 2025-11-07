// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


/**
 * GET /api/admin/metrics
 * Get system metrics for admin dashboard
 */

import { type NextRequest, NextResponse } from 'next/server'

import { isAdmin } from '@/lib/auth/admin-check'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'

import type { Database } from '@/types/database'
import { createClient } from '@/utils/supabase/server'

import type { SupabaseClient } from '@supabase/supabase-js'

interface AdminMetricsContext {
  supabase: SupabaseClient<Database>
  userId: string
}

interface AuthResult {
  context?: AdminMetricsContext
  statusCode?: number
}

interface CountSummary {
  users: number
  recipes: number
  orders: number
  ingredients: number
  revenue: number
}

interface ActivitySummary {
  activeToday: number
  newThisWeek: number
}

interface DatabaseSummary {
  totalRows: number
  dbSize: string | number
  activeConnections: number
}

interface AdminMetricsResponse {
  database: {
    total_tables: number
    total_rows: number
    database_size: string | number
    active_connections: number
  }
  performance: {
    avg_query_time: number
    slow_queries: number
    cache_hit_rate: number
    api_response_time: number
  }
  users: {
    total_users: number
    active_today: number
    new_this_week: number
  }
  business: {
    total_recipes: number
    total_orders: number
    total_revenue: number
    total_ingredients: number
  }
}

async function authenticateAdmin(): Promise<AuthResult> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { statusCode: 401 }
  }

  const hasAdminAccess = await isAdmin(user['id'])
  if (!hasAdminAccess) {
    return { statusCode: 403 }
  }

  return { context: { supabase, userId: user['id'] } }
}

async function fetchCountSummary(supabase: SupabaseClient<Database>): Promise<CountSummary> {
  const [usersRes, recipesRes, ordersRes, ingredientsRes, revenueRes] = await Promise.all([
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('recipes').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('ingredients').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('total_amount').eq('status', 'DELIVERED')
  ])

  const revenue = revenueRes.data?.reduce((sum, order) => sum + (order.total_amount ?? 0), 0) ?? 0

  return {
    users: usersRes.count ?? 0,
    recipes: recipesRes.count ?? 0,
    orders: ordersRes.count ?? 0,
    ingredients: ingredientsRes.count ?? 0,
    revenue
  }
}

async function fetchActivitySummary(supabase: SupabaseClient<Database>): Promise<ActivitySummary> {
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [{ count: activeToday }, { count: newThisWeek }] = await Promise.all([
    supabase
      .from('orders')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', today),
    supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString())
  ])

  return {
    activeToday: activeToday ?? 0,
    newThisWeek: newThisWeek ?? 0
  }
}

async function fetchDatabaseSummary(supabase: SupabaseClient<Database>): Promise<DatabaseSummary> {
  const [{ data: dbSize }, { data: activeConnections }, { data: totalRows }] = await Promise.all([
    supabase.rpc('get_database_size'),
    supabase.rpc('get_active_connections'),
    supabase.rpc('get_total_rows')
  ])

  return {
    totalRows: totalRows ?? 0,
    dbSize: dbSize ?? 'N/A',
    activeConnections: activeConnections ?? 0
  }
}

function buildMetricsResponse(
  counts: CountSummary,
  activity: ActivitySummary,
  dbSummary: DatabaseSummary
): AdminMetricsResponse {
  return {
    database: {
      total_tables: 35,
      total_rows: dbSummary.totalRows,
      database_size: dbSummary.dbSize,
      active_connections: dbSummary.activeConnections
    },
    performance: {
      avg_query_time: 45,
      slow_queries: 3,
      cache_hit_rate: 94,
      api_response_time: 120
    },
    users: {
      total_users: counts.users,
      active_today: activity.activeToday,
      new_this_week: activity.newThisWeek
    },
    business: {
      total_recipes: counts.recipes,
      total_orders: counts.orders,
      total_revenue: counts.revenue,
      total_ingredients: counts.ingredients
    }
  }
}

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const { context, statusCode } = await authenticateAdmin()
    if (!context) {
      const message = statusCode === 403 ? 'Forbidden - Admin access required' : 'Unauthorized'
      return NextResponse.json({ error: message }, { status: statusCode ?? 401 })
    }

    const { supabase, userId } = context
    const [counts, activity, dbSummary] = await Promise.all([
      fetchCountSummary(supabase),
      fetchActivitySummary(supabase),
      fetchDatabaseSummary(supabase)
    ])

    const metrics = buildMetricsResponse(counts, activity, dbSummary)
    apiLogger.info({ userId }, 'Admin metrics fetched')

    return NextResponse.json(metrics)
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in GET /api/admin/metrics')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
