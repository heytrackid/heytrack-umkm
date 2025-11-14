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
    const days = parseInt(searchParams.get('days') || '90')

    // Validate days parameter
    if (days < 7 || days > 365) {
      return NextResponse.json(
        { error: 'Days must be between 7 and 365' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get revenue data grouped by date
    const { data: orders, error } = await supabase
      .from('orders')
      .select('created_at, total_amount')
      .eq('user_id', user.id)
      .eq('status', 'DELIVERED')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error

    // Group by date and calculate revenue
    const revenueByDate = new Map<string, { revenue: number; orders: number }>()

    const ordersList = orders as Array<{ created_at: string; total_amount: number }>
    ordersList?.forEach((order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0]
      const existing = revenueByDate.get(date) || { revenue: 0, orders: 0 }
      revenueByDate.set(date, {
        revenue: existing.revenue + (Number(order.total_amount) || 0),
        orders: existing.orders + 1,
      })
    })

    // Fill in missing dates with zero values
    const result: Array<{ date: string; revenue: number; orders: number }> = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const data = revenueByDate.get(dateStr) || { revenue: 0, orders: 0 }
      result.push({
        date: dateStr,
        revenue: data.revenue,
        orders: data.orders,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    return handleAPIError(error, 'GET /api/analytics/revenue-trend')
  }
}

const securedGET = withSecurity(GET, SecurityPresets.enhanced())
export { securedGET as GET }
