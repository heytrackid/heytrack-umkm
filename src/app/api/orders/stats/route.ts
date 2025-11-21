export const runtime = 'nodejs'

import { createErrorResponse, createSuccessResponse } from '@/lib/api-core/responses'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { apiLogger } from '@/lib/logger'
import type { Database, OrderStatus } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

type TypedSupabaseClient = SupabaseClient<Database>

// GET /api/orders/stats - Order statistics
async function getOrderStatsHandler(context: RouteContext): Promise<NextResponse> {
  const { user, supabase } = context

  try {
    const typedSupabase = supabase as TypedSupabaseClient

    // Fetch all orders for stats calculation
    const { data: orders, error } = await typedSupabase
      .from('orders')
      .select('status, total_amount, created_at')
      .eq('user_id', user.id)

    if (error) {
      throw new Error(`Orders query failed: ${error.message}`)
    }

    const ordersData = orders || []

    // Calculate stats
    const stats = {
      total: ordersData.length,
      pending: ordersData.filter(order => order.status === 'PENDING').length,
      confirmed: ordersData.filter(order => order.status === 'CONFIRMED').length,
      inProgress: ordersData.filter(order => order.status === 'IN_PROGRESS').length,
      completed: ordersData.filter(order => order.status === 'READY').length,
      delivered: ordersData.filter(order => order.status === 'DELIVERED').length,
      cancelled: ordersData.filter(order => order.status === 'CANCELLED').length,
      totalRevenue: ordersData.reduce((sum, order) => sum + (order.total_amount ?? 0), 0),
      recentOrders: ordersData
        .sort((a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime())
        .slice(0, 5)
        .map(order => ({
          status: order.status,
          total_amount: order.total_amount,
          created_at: order.created_at
        }))
    }

    apiLogger.info({ userId: user.id }, 'Order stats fetched')
    return createSuccessResponse(stats)
  } catch (error) {
    apiLogger.error({ error, userId: user.id }, 'Order stats error')
    return createErrorResponse('Failed to fetch order stats', 500)
  }
}

export const GET = createApiRoute(
  { method: 'GET', path: '/api/orders/stats' },
  getOrderStatsHandler
)