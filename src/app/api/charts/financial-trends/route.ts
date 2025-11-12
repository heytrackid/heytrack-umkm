export const runtime = 'nodejs'

import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import type { OrdersTable, OperationalCostsTable, IngredientPurchasesTable } from '@/types/database'

async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '90', 10)

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Use typed supabase client to avoid type inference issues
    const typedSupabase = supabase

    // Fetch orders data (revenue)
    const { data, error: ordersError } = await typedSupabase
      .from('orders')
      .select('created_at, total_amount, status')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    if (ordersError) throw ordersError

    const rawOrders = data as Array<Pick<OrdersTable, 'created_at' | 'total_amount' | 'status'> | null> | null
    const orders: Array<{ created_at: string; total_amount: number; status: string }> = (rawOrders || []).filter((order): order is Pick<OrdersTable, 'created_at' | 'total_amount' | 'status'> =>
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

    const { data: expenses, error: expensesError } = await typedSupabase
      .from('operational_costs')
      .select('date, amount, category')
      .eq('user_id', user.id)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true })

    if (expensesError) throw expensesError

    // Fetch ingredient purchases (HPP)
    const { data: purchases, error: purchasesError } = await typedSupabase
      .from('ingredient_purchases')
      .select('purchase_date, total_price')
      .eq('user_id', user.id)
      .gte('purchase_date', startDateStr)
      .lte('purchase_date', endDateStr)
      .order('purchase_date', { ascending: true })

    if (purchasesError) throw purchasesError

    const rawExpenses = expenses as Array<Pick<OperationalCostsTable, 'date' | 'amount' | 'category'> | null> | null
    const rawPurchases = purchases as Array<Pick<IngredientPurchasesTable, 'purchase_date' | 'total_price'> | null> | null

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
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in GET /api/charts/financial-trends')
    return handleAPIError(error, 'GET /api/charts/financial-trends')
  }
}

const GET_SECURED = withSecurity(GET, SecurityPresets.basic())
export { GET_SECURED as GET }
