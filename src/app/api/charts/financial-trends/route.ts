export const runtime = 'nodejs'

import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { requireAuth, isErrorResponse } from '@/lib/api-auth'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import type { Order, OperationalCost, IngredientPurchase } from '@/types/database'

async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '90', 10)

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const supabase = await createClient()

    // Fetch orders data (revenue) - RLS handles user_id filtering
    const { data, error: ordersError } = await supabase
      .from('orders')
      .select('created_at, total_amount, status')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    if (ordersError) throw ordersError

    const rawOrders = data as Array<Pick<Order, 'created_at' | 'total_amount' | 'status'> | null> | null
    const orders: Array<{ created_at: string; total_amount: number; status: string }> = (rawOrders || []).filter((order): order is Pick<Order, 'created_at' | 'total_amount' | 'status'> =>
      order !== null && order.created_at !== null && order.total_amount !== null && order.status !== null
    ).map((order) => ({
      created_at: order.created_at!,
      total_amount: order.total_amount!,
      status: order.status!
    }))

    // Fetch expenses data
    // Helper to get date string
    const getDateString = (date: Date): string => {
      const parts = date.toISOString().split('T')
      return parts[0] || ''
    }

    const startDateStr = getDateString(startDate)
    const endDateStr = getDateString(endDate)

    const { data: expenses, error: expensesError } = await supabase
      .from('operational_costs')
      .select('date, amount, category')
      .eq('user_id', user.id)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true })

    if (expensesError) throw expensesError

    // Fetch ingredient purchases (HPP) - RLS handles user_id filtering
    const { data: purchases, error: purchasesError } = await supabase
      .from('ingredient_purchases')
      .select('purchase_date, total_price')
      .gte('purchase_date', startDateStr)
      .lte('purchase_date', endDateStr)
      .order('purchase_date', { ascending: true })

    if (purchasesError) throw purchasesError

    const rawExpenses = expenses as Array<Pick<OperationalCost, 'date' | 'amount' | 'category'> | null> | null
    const rawPurchases = purchases as Array<Pick<IngredientPurchase, 'purchase_date' | 'total_price'> | null> | null

    // Group data by date
    const dataMap = new Map<string, { revenue: number; expenses: number; hpp: number }>()

    // Process orders (revenue)
    orders.forEach((order) => {
      const date = order.created_at.split('T')[0] || ''
      const current = dataMap.get(date) || { revenue: 0, expenses: 0, hpp: 0 }
      current.revenue += Number(order.total_amount ?? 0)
      dataMap.set(date, current)
    })

    // Process expenses
    rawExpenses?.forEach((expense) => {
      if (!expense) return
      const date = expense.date || ''
      const current = dataMap.get(date) || { revenue: 0, expenses: 0, hpp: 0 }
      current.expenses += Number(expense.amount) || 0
      dataMap.set(date, current)
    })

    // Process purchases (HPP)
    rawPurchases?.forEach((purchase) => {
      if (!purchase) return
      const date = purchase.purchase_date || ''
      const current = dataMap.get(date) || { revenue: 0, expenses: 0, hpp: 0 }
      current.hpp += Number(purchase.total_price) || 0
      dataMap.set(date, current)
    })

    // Convert to array and calculate profit
    const chartData = Array.from(dataMap.entries())
      .map(([date, values]) => ({
        date,
        revenue: values.revenue,
        expenses: values.expenses,
        hpp: values.hpp,
        profit: values.revenue - values.expenses - values.hpp,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    apiLogger.info({ userId: user.id, dataPoints: chartData.length }, 'Financial trends data fetched')

    return NextResponse.json({
      success: true,
      data: chartData,
    })
  } catch (error) {
    apiLogger.error({ error }, 'Error in GET /api/charts/financial-trends')
    return handleAPIError(error, 'GET /api/charts/financial-trends')
  }
}

const GET_SECURED = withSecurity(GET, SecurityPresets.basic())
export { GET_SECURED as GET }
