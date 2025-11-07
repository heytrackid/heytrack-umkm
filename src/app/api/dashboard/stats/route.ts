// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


 

import { NextResponse } from 'next/server'

import { safeParseAmount, safeString, safeParseInt, safeTimestamp, isInArray } from '@/lib/api-helpers'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
import { withSecurity, SecurityPresets } from '@/utils/security'
import { createClient } from '@/utils/supabase/server'

import type { OrderStatus } from '@/types/database'

// Partial types for dashboard queries (only fields we fetch)
interface OrderStats {
  id: string
  total_amount: number | null
  status: OrderStatus | null
  order_date?: string | null
  customer_name?: string | null
  created_at?: string | null
}

interface CustomerStats {
  id: string
  customer_type: string | null
}

interface IngredientStats {
  id: string
  current_stock: number | null
  min_stock: number | null
  category: string | null
}

interface RecipeStats {
  id: string
  times_made: number | null
  name: string
}

interface ExpenseStats {
  amount: number
}

async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Validate optional date range parameters - make validation more flexible
    const startDateParam = searchParams.get('start_date')
    const endDateParam = searchParams.get('end_date')

    // Parse and validate dates
    const startDate = startDateParam ? new Date(startDateParam).toISOString().split('T')[0] : undefined
    const endDate = endDateParam ? new Date(endDateParam).toISOString().split('T')[0] : undefined

    // Create Supabase client
    const supabase = await createClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0] as string
    
    // Calculate yesterday for comparison
    const yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0] as string
    
    // Calculate date ranges for comparison if needed
    let comparisonStartDate: string | undefined = undefined
    let comparisonEndDate: string | undefined = undefined
    
    if (startDate && endDate) {
      // Calculate equivalent previous period for comparison
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = end.getTime() - start.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      const comparisonEnd = new Date(start)
      comparisonEnd.setDate(comparisonEnd.getDate() - 1)
      const comparisonStart = new Date(comparisonEnd)
      comparisonStart.setDate(comparisonStart.getDate() - diffDays)
      
      comparisonStartDate = comparisonStart.toISOString().split('T')[0]
      comparisonEndDate = comparisonEnd.toISOString().split('T')[0]
    }
    
    // ✅ OPTIMIZED: Fetch all data in parallel to reduce total query time
    const [
      ordersResult,
      currentPeriodOrdersResult,
      comparisonOrdersResult,
      customersResult,
      ingredientsResult,
      recipesResult,
      expensesResult
    ] = await Promise.all([
      // Orders in the specified date range
      startDate && endDate 
        ? supabase
            .from('orders')
            .select('id, total_amount, status, order_date, customer_name, created_at')
            .eq('user_id', user['id'])
            .gte('order_date', startDate)
            .lte('order_date', endDate)
        : supabase
            .from('orders')
            .select('id, total_amount, status, order_date, customer_name, created_at')
            .eq('user_id', user['id']),
      
      // Current period orders (today's if no date range) - for daily metrics
      startDate && endDate
        ? supabase
            .from('orders')
            .select('id, total_amount, status, customer_name, created_at')
            .eq('user_id', user['id'])
            .gte('order_date', startDate)
            .lte('order_date', endDate)
        : supabase
            .from('orders')
            .select('id, total_amount, status, customer_name, created_at')
            .eq('user_id', user['id'])
            .eq('order_date', today),
      
      // Previous period orders for comparison - if date range provided
      startDate && endDate && comparisonStartDate && comparisonEndDate
        ? supabase
            .from('orders')
            .select('total_amount')
            .eq('user_id', user['id'])
            .gte('order_date', comparisonStartDate)
            .lte('order_date', comparisonEndDate)
        : supabase
            .from('orders')
            .select('total_amount')
            .eq('user_id', user['id'])
            .eq('order_date', yesterdayStr),
      
      // Customers
      supabase
        .from('customers')
        .select('id, customer_type')
        .eq('user_id', user['id']),
      
      // Ingredients with stock info
      supabase
        .from('ingredients')
        .select('id, name, current_stock, min_stock, reorder_point, category')
        .eq('user_id', user['id']),
      
      // Recipes
      supabase
        .from('recipes')
        .select('id, times_made, name')
        .eq('user_id', user['id']),
      
      // Expenses in the specified date range
      startDate && endDate
        ? supabase
            .from('expenses')  
            .select('amount')
            .eq('user_id', user['id'])
            .gte('expense_date', startDate)
            .lte('expense_date', endDate)
        : supabase
            .from('expenses')  
            .select('amount')
            .eq('user_id', user['id'])
            .eq('expense_date', today)
    ])
    
    const orders = ordersResult['data']
    const currentPeriodOrders = currentPeriodOrdersResult['data']
    const comparisonOrders = comparisonOrdersResult['data']
    const customers = customersResult['data']
    const ingredients = ingredientsResult['data']
    const recipes = recipesResult['data']
    const expenses = expensesResult['data']
    
    // Calculate metrics
    const totalRevenue = orders?.reduce((sum: number, order: OrderStats) =>
      sum + safeParseAmount(order.total_amount), 0) ?? 0

    const currentPeriodRevenue = currentPeriodOrders?.reduce((sum: number, order: OrderStats) =>
      sum + safeParseAmount(order.total_amount), 0) ?? 0

    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] as const
    const activeOrders = orders?.filter((order: OrderStats) =>
      isInArray(order['status'], validStatuses)).length ?? 0

    const totalCustomers = customers?.length ?? 0
    const vipCustomers = customers?.filter((customer: CustomerStats) =>
      safeString(customer.customer_type) === 'vip').length ?? 0

    const lowStockItems = ingredients?.filter((ingredient: IngredientStats) => {
      const currentStock = safeParseAmount(ingredient.current_stock)
      const minStock = safeParseAmount(ingredient.min_stock)
      return currentStock <= minStock
    }).length ?? 0

    const totalIngredients = ingredients?.length ?? 0
    const totalRecipes = recipes?.length ?? 0

    const expensesTotal = expenses?.reduce((sum: number, expense: ExpenseStats) =>
      sum + safeParseAmount(expense.amount), 0) ?? 0

    const comparisonRevenue = comparisonOrders?.reduce((sum: number, order: { total_amount: number | null }) =>
      sum + safeParseAmount(order.total_amount), 0) ?? 0
    
    // Category breakdown for ingredients
    const categoryBreakdown = ingredients?.reduce((acc: Record<string, number>, ingredient: IngredientStats) => {
      const category = safeString(ingredient.category, 'General')
      acc[category] = (acc[category] ?? 0) + 1
      return acc
    }, {} as Record<string, number>) ?? {} as Record<string, number>

    // ✅ Low stock alerts with ingredient details
    interface IngredientWithName extends IngredientStats {
      name?: string
      reorder_point?: number | null
    }
    const lowStockAlerts = ingredients?.filter((ingredient: IngredientWithName) => {
      const currentStock = safeParseAmount(ingredient.current_stock)
      const reorderPoint = safeParseAmount(ingredient.reorder_point ?? ingredient.min_stock)
      return currentStock <= reorderPoint
    }).map((ingredient: IngredientWithName) => ({
      id: ingredient['id'],
      name: safeString(ingredient.name, 'Unknown'),
      currentStock: safeParseAmount(ingredient.current_stock),
      reorderPoint: safeParseAmount(ingredient.reorder_point ?? ingredient.min_stock)
    })) ?? []

    // Recent orders for activity feed
    const recentOrders = orders
      ?.sort((a: OrderStats, b: OrderStats) => {
        const aTime = safeTimestamp(a.created_at)
        const bTime = safeTimestamp(b.created_at)
        return bTime - aTime
      })
      ?.slice(0, 5) ?? []

    // Calculate growth percentage
    const revenueGrowth = comparisonRevenue > 0 ?
      ((currentPeriodRevenue - comparisonRevenue) / comparisonRevenue * 100) : 0
    
    return NextResponse.json({
      revenue: {
        today: currentPeriodRevenue,
        total: totalRevenue,
        growth: revenueGrowth.toFixed(1),
        trend: revenueGrowth >= 0 ? 'up' : 'down'
      },
      orders: {
        active: activeOrders,
        total: orders?.length ?? 0,
        today: currentPeriodOrders?.length ?? 0,
        recent: recentOrders.map((order: OrderStats) => ({
          id: order['id'],
          customer: safeString(order['customer_name'], 'Walk-in customer'),
          amount: order.total_amount,
          status: order['status'],
          time: order.created_at
        }))
      },
      customers: {
        total: totalCustomers,
        vip: vipCustomers,
        regular: totalCustomers - vipCustomers
      },
      inventory: {
        total: totalIngredients,
        lowStock: lowStockItems,
        lowStockAlerts, // ✅ Add detailed low stock alerts
        categories: Object.keys(categoryBreakdown).length,
        categoryBreakdown
      },
      recipes: {
        total: totalRecipes,
        popular: recipes
          ?.sort((a: RecipeStats, b: RecipeStats) => {
            const aUsage = safeParseInt(a.times_made)
            const bUsage = safeParseInt(b.times_made)
            return bUsage - aUsage
          })
          ?.slice(0, 3) ?? []
      },
      expenses: {
        today: expensesTotal,
        netProfit: currentPeriodRevenue - expensesTotal
      },
      alerts: {
        lowStock: lowStockItems,
        highExpenses: expensesTotal > 500000 ? 1 : 0
      },
      lastUpdated: new Date().toISOString()
    })
    
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error fetching dashboard stats')
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

// Update daily sales summary
export async function POST() {
  try {
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0] as string

    // Get today's data - only needed fields
    const { data: todayOrders } = await supabase
      .from('orders')
      .select('id, total_amount')
      .eq('user_id', user['id'])
      .eq('order_date', today)
    
    const { data: todayOrderItems } = await supabase
      .from('order_items')
      .select('order_id, quantity')
      .eq('user_id', user['id'])
    
    const { data: todayExpenses } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user['id'])
      .eq('expense_date', today)
    
    interface OrderIdOnly { id: string; total_amount: number | null }
    interface OrderItemPartial { order_id: string; quantity: number }
    
    const todayOrderIds = todayOrders?.map((order: OrderIdOnly) => order['id']) ?? []

    const todayItems = todayOrderItems?.filter((item: OrderItemPartial) =>
      todayOrderIds.includes(item.order_id)) ?? []

    const totalRevenue = todayOrders?.reduce((sum: number, order: OrderIdOnly) =>
      sum + safeParseAmount(order.total_amount), 0) ?? 0

    const totalItemsSold = todayItems.reduce((sum: number, item: OrderItemPartial) =>
      sum + safeParseInt(item.quantity), 0) ?? 0

    const averageOrderValue = todayOrders?.length ? totalRevenue / todayOrders.length : 0

    const totalExpenses = todayExpenses?.reduce((sum: number, expense: { amount: number }) =>
      sum + safeParseAmount(expense.amount), 0) ?? 0

    const profitEstimate = totalRevenue - totalExpenses

    // Upsert daily summary
    const summaryData = {
      sales_date: today,
      user_id: user['id'],
      total_orders: todayOrders?.length ?? 0,
      total_revenue: totalRevenue,
      total_items_sold: totalItemsSold,
      average_order_value: averageOrderValue,
      expenses_total: totalExpenses,
      profit_estimate: profitEstimate
    }
    const { error } = await supabase
      .from('daily_sales_summary')
      .upsert([summaryData], {
        onConflict: 'sales_date,user_id'
      })
    
    if (error) {throw error}
    
    return NextResponse.json({ success: true, message: 'Daily summary updated' })
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error updating daily summary')
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

// Apply security middleware
const securedGET = withSecurity(GET, SecurityPresets.enhanced())

export { securedGET as GET }