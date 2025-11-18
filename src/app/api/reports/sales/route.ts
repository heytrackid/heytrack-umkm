export const runtime = 'nodejs'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const supabase = await createClient()

    let query = supabase
      .from('orders')
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
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: orders, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

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

    return NextResponse.json({ data: report })
  } catch (error) {
    return handleAPIError(error, 'GET /api/reports/sales')
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/reports/sales', SecurityPresets.enhanced())
