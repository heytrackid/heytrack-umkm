export const runtime = 'nodejs'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Validate parameters
    if (days < 7 || days > 365) {
      return NextResponse.json(
        { error: 'Days must be between 7 and 365' },
        { status: 400 }
      )
    }

    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 50' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get order items from completed orders
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select(`
        product_name,
        quantity,
        unit_price,
        orders!inner(
          status,
          created_at,
          user_id
        )
      `)
      .eq('orders.user_id', user.id)
      .eq('orders.status', 'DELIVERED')
      .gte('orders.created_at', startDate.toISOString())
      .lte('orders.created_at', endDate.toISOString())

    if (error) throw error

    // Group by product and calculate metrics
    const productMetrics = new Map<
      string,
      { quantity: number; revenue: number; orders: Set<string> }
    >()

    type OrderItemData = {
      product_name: string | null
      quantity: number
      unit_price: number
    }

    const items = (orderItems || []) as OrderItemData[]
    items.forEach((item) => {
      const product = item.product_name || 'Unknown'
      const existing = productMetrics.get(product) || {
        quantity: 0,
        revenue: 0,
        orders: new Set(),
      }

      productMetrics.set(product, {
        quantity: existing.quantity + Number(item.quantity),
        revenue: existing.revenue + Number(item.unit_price) * Number(item.quantity),
        orders: existing.orders,
      })
    })

    // Convert to array and sort by revenue
    const result = Array.from(productMetrics.entries())
      .map(([product, metrics]) => ({
        product,
        quantity: metrics.quantity,
        revenue: metrics.revenue,
        orders: metrics.orders.size,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)

    return NextResponse.json({ data: result })
  } catch (error) {
    return handleAPIError(error, 'GET /api/analytics/top-products')
  }
}

const securedGET = withSecurity(GET, SecurityPresets.enhanced())
export { securedGET as GET }
