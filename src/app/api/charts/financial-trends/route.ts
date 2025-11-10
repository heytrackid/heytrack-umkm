export const runtime = 'nodejs'

import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
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

    // Fetch orders data (revenue)
    const { data, error: ordersError } = await supabase
      .from('orders')
      .select('created_at, total_amount, status')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    if (ordersError) throw ordersError

    const orders: any[] = data

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

    // Fetch ingredient purchases (HPP)
    const { data: purchases, error: purchasesError } = await supabase
      .from('ingredient_purchases')
      .select('purchase_date, total_price')
      .eq('user_id', user.id)
      .gte('purchase_date', startDateStr)
      .lte('purchase_date', endDateStr)
      .order('purchase_date', { ascending: true })

    if (purchasesError) throw purchasesError

    // Group data by date
    const dataMap = new Map<string, { revenue: number; expenses: number; hpp: number }>()

    // Process orders (revenue)
    orders?.forEach((order: any) => {
      if (order.status === 'DELIVERED') {
        const dateParts = new Date((order.created_at ?? '')).toISOString().split('T')
        const date = dateParts[0] || ''
        if (!date) return
        const current = dataMap.get(date) || { revenue: 0, expenses: 0, hpp: 0 }
        current.revenue += Number(order.total_amount ?? 0)
        dataMap.set(date, current)
      }
    })

    // Process expenses
    expenses?.forEach((expense) => {
      const date = expense.date || ''
      const current = dataMap.get(date) || { revenue: 0, expenses: 0, hpp: 0 }
      current.expenses += Number(expense.amount) || 0
      dataMap.set(date, current)
    })

    // Process purchases (HPP)
    purchases?.forEach((purchase) => {
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
    return handleAPIError(error, 'GET /api/charts/financial-trends')
  }
}

const GET_SECURED = withSecurity(GET, SecurityPresets.basic())
export { GET_SECURED as GET }
