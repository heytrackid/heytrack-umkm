export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { NextResponse } from 'next/server'

const SalesReportQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

async function getSalesReportHandler(
  context: RouteContext,
  query?: z.infer<typeof SalesReportQuerySchema>
): Promise<NextResponse> {
  const { user, supabase } = context
  const { startDate, endDate } = query || {}

  let queryBuilder = supabase
    .from('orders' as never)
    .select(`
      id,
      order_no,
      total_amount,
      status,
      created_at,
      order_items (
        product_name,
        quantity,
        unit_price,
        total_price
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'DELIVERED')

  if (startDate) {
    queryBuilder = queryBuilder.gte('created_at', startDate)
  }

  if (endDate) {
    queryBuilder = queryBuilder.lte('created_at', endDate)
  }

  const { data: orders, error } = await queryBuilder.order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 })
  }

  const ordersList = orders || []

  // Calculate summary
  type OrderData = { created_at: string; total_amount: number | null }
  const ordersData = ordersList as OrderData[]
  const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  const totalOrders = ordersData.length

  // Group by date
  const salesByDate: Record<string, { date: string; revenue: number; orders: number }> = {}

  ordersData.forEach((order) => {
    const date = new Date(order.created_at).toISOString().split('T')[0]
    if (!salesByDate[date]) {
      salesByDate[date] = { date, revenue: 0, orders: 0 }
    }
    salesByDate[date].revenue += order.total_amount || 0
    salesByDate[date].orders += 1
  })

  // Group by product
  const productSales: Record<string, { product: string; quantity: number; revenue: number }> = {}

  type OrderWithItems = { order_items: Array<{ product_name: string | null; quantity: number; total_price: number }> }
  const ordersWithItems = ordersList as OrderWithItems[]
  ordersWithItems.forEach((order) => {
    order.order_items.forEach((item) => {
      const productName = item.product_name || 'Unknown'
      if (!productSales[productName]) {
        productSales[productName] = { product: productName, quantity: 0, revenue: 0 }
      }
      productSales[productName].quantity += item.quantity
      productSales[productName].revenue += item.total_price || 0
    })
  })

  const report = {
    summary: {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    },
    salesByDate: Object.values(salesByDate).sort((a, b) => a.date.localeCompare(b.date)),
    topProducts: Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10),
  }

  return NextResponse.json({ success: true, data: report })
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/reports/sales',
    querySchema: SalesReportQuerySchema,
  },
  getSalesReportHandler
)
