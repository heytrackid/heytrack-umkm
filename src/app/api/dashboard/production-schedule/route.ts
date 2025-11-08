// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { type NextRequest, NextResponse } from 'next/server'

import { apiLogger, logError } from '@/lib/logger'
import type { Database } from '@/types/database'
import { typed } from '@/types/type-utilities'
import { createSecureHandler, SecurityPresets } from '@/utils/security'

import { createClient } from '@/utils/supabase/server'

type TypedSupabaseClient = ReturnType<typeof typed>

type ProductionRow = Database['public']['Tables']['productions']['Row']
type OrderRow = Database['public']['Tables']['orders']['Row']


interface ProductionBatch extends Pick<ProductionRow, 'id' | 'quantity' | 'status' | 'started_at' | 'completed_at'> {
  recipe: {
    id: string | null
    name: string | null
    image_url: string | null
    cost_per_unit: number | null
  } | null
}

interface PendingOrder extends Pick<OrderRow, 'id' | 'order_no' | 'customer_name' | 'delivery_date' | 'priority' | 'status'> {
  order_items: Array<{
    recipe: {
      name: string | null
    } | null
  }> | null
}

interface LowStockItem {
  id: string
  name: string
  current_stock: number | null
  stock_status: string
}

interface ProductionSummary {
  total_batches_today: number
  planned_batches: number
  in_progress_batches: number
  completed_batches: number
  pending_orders_count: number
  urgent_orders: number
  critical_stock_items: number
}

interface ProductionScheduleResponse {
  production_schedule: ProductionBatch[]
  pending_orders: PendingOrder[]
  low_stock_alerts: LowStockItem[]
  summary: ProductionSummary
}

async function getSupabaseClient(): Promise<TypedSupabaseClient> {
  return typed(await createClient())
}

async function requireUserId(supabase: TypedSupabaseClient): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Unauthorized')
  }
  return user.id
}

function getTodayRange(): { start: string; end: string } {
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  return {
    start: today.toISOString().split('T')[0] ?? '',
    end: tomorrow.toISOString().split('T')[0] ?? ''
  }
}

async function fetchProductionBatches(
  supabase: TypedSupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<ProductionBatch[]> {
  const { data, error } = await supabase
    .from('productions')
    .select(`
      id,
      quantity,
      status,
      started_at,
      completed_at,
      recipe:recipes (
        id,
        name,
        image_url,
        cost_per_unit
      )
    `)
    .eq('user_id', userId)
    .gte('started_at', startDate)
    .lt('started_at', endDate)
    .order('started_at')

  if (error) {
    throw error
  }

  return (data ?? []) as ProductionBatch[]
}

async function fetchPendingOrders(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<PendingOrder[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_no,
      customer_name,
      delivery_date,
      priority,
      status,
      order_items (
        recipe:recipes (
          name
        )
      )
    `)
    .eq('user_id', userId)
    .in('status', ['CONFIRMED', 'IN_PROGRESS'])
    .is('production_batch_id', null)
    .order('delivery_date', { nullsFirst: false })
    .limit(10)

  if (error) {
    throw error
  }

  return (data ?? []) as PendingOrder[]
}

async function fetchLowStockAlerts(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<LowStockItem[]> {
  const { data, error } = await supabase
    .from('ingredients')
    .select('id, name, current_stock, min_stock')
    .eq('user_id', userId)
    .order('current_stock')
    .limit(10)

  if (error) {
    throw error
  }

  return (data ?? []).map(item => ({
    id: item.id,
    name: item.name,
    current_stock: item.current_stock,
    stock_status: (item.current_stock ?? 0) <= (item.min_stock ?? 0) ? 'LOW_STOCK' : 'IN_STOCK'
  })) as any
}

function buildSummary(
  batches: ProductionBatch[],
  pendingOrders: PendingOrder[],
  lowStockItems: LowStockItem[]
): ProductionSummary {
  const plannedBatches = batches.filter(batch => batch.status === 'PLANNED').length
  const inProgressBatches = batches.filter(batch => batch.status === 'IN_PROGRESS').length
  const completedBatches = batches.filter(batch => batch.status === 'COMPLETED').length
  const urgentOrders = pendingOrders.filter(order => order.priority === 'URGENT').length
  const criticalStock = lowStockItems.filter(item => item.stock_status === 'OUT_OF_STOCK').length

  return {
    total_batches_today: batches.length,
    planned_batches: plannedBatches,
    in_progress_batches: inProgressBatches,
    completed_batches: completedBatches,
    pending_orders_count: pendingOrders.length,
    urgent_orders: urgentOrders,
    critical_stock_items: criticalStock
  }
}

async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    apiLogger.info({ url: request.url }, 'GET /api/dashboard/production-schedule')

    const supabase = await getSupabaseClient()
    const userId = await requireUserId(supabase)
    const { start, end } = getTodayRange()

    const [batches, pendingOrders, lowStockAlerts] = await Promise.all([
      fetchProductionBatches(supabase, userId, start, end),
      fetchPendingOrders(supabase, userId),
      fetchLowStockAlerts(supabase, userId).catch(error => {
        logError(apiLogger, error, 'Failed to fetch low stock')
        return [] as LowStockItem[]
      })
    ])

    const response: ProductionScheduleResponse = {
      production_schedule: batches,
      pending_orders: pendingOrders,
      low_stock_alerts: lowStockAlerts,
      summary: buildSummary(batches, pendingOrders, lowStockAlerts)
    }

    apiLogger.info({
      userId,
      batchCount: batches.length,
      pendingCount: pendingOrders.length,
      lowStockCount: lowStockAlerts.length
    }, 'Dashboard data fetched')

    return NextResponse.json(response)
  } catch (error: unknown) {
    logError(apiLogger, error, 'Unexpected error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/dashboard/production-schedule', SecurityPresets.enhanced())
