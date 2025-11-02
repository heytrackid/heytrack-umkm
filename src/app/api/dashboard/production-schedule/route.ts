import { createClient } from '@/utils/supabase/server'
import { typed } from '@/types/type-utilities'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger, logError } from '@/lib/logger'


export const runtime = 'nodejs'

// GET /api/dashboard/production-schedule - Get today's production schedule
export async function GET(request: NextRequest) {
  try {
    apiLogger.info({ url: request.url }, 'GET /api/dashboard/production-schedule')
    
    const client = await createClient()

    
    const supabase = typed(client)
    const { data: { user }, error: authError } = await client.auth.getUser()

    if (authError || !user) {
      logError(apiLogger, authError, 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

    // Get today's production batches
    const { data: batches, error: batchError } = await supabase
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
      .eq('user_id', user.id)
      .gte('started_at', today)
      .lt('started_at', tomorrow)
      .order('started_at')

    if (batchError) {
      logError(apiLogger, batchError, 'Failed to fetch production batches')
      return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 })
    }

    // Get pending orders without production batch
    const { data: pendingOrders, error: ordersError } = await supabase
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
      .eq('user_id', user.id)
      .in('status', ['CONFIRMED', 'IN_PROGRESS'])
      .is('production_batch_id', null)
      .order('delivery_date', { nullsFirst: false })
      .limit(10)

    if (ordersError) {
      logError(apiLogger, ordersError, 'Failed to fetch pending orders')
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    // Get low stock alerts
    const { data: lowStock, error: stockError } = await supabase
      .from('inventory_status')
      .select('id, name, current_stock, stock_status')
      .eq('user_id', user.id)
      .in('stock_status', ['LOW_STOCK', 'OUT_OF_STOCK'])
      .order('current_stock')
      .limit(5)

    if (stockError) {
      logError(apiLogger, stockError, 'Failed to fetch low stock')
    }

    apiLogger.info({ 
      userId: user.id,
      batchCount: batches?.length || 0,
      pendingCount: pendingOrders?.length || 0,
      lowStockCount: lowStock?.length || 0
    }, 'Dashboard data fetched')

    return NextResponse.json({
      production_schedule: batches || [],
      pending_orders: pendingOrders || [],
      low_stock_alerts: lowStock || [],
      summary: {
        total_batches_today: batches?.length || 0,
        planned_batches: (batches?.filter(b => b.status === 'PLANNED') || []).length,
        in_progress_batches: (batches?.filter(b => b.status === 'IN_PROGRESS') || []).length,
        completed_batches: (batches?.filter(b => b.status === 'COMPLETED') || []).length,
        pending_orders_count: pendingOrders?.length || 0,
        urgent_orders: (pendingOrders?.filter(o => o.priority === 'URGENT') || []).length,
        critical_stock_items: (lowStock?.filter(s => s.stock_status === 'OUT_OF_STOCK') || []).length
      }
    })
  } catch (error) {
    logError(apiLogger, error, 'Unexpected error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
