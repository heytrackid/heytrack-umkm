import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { DateRangeQuerySchema } from '@/lib/validations/domains/common'
import type { Database } from '@/types/supabase-generated'
import { safeParseAmount, safeString, safeParseInt, safeTimestamp, isInArray } from '@/lib/api-helpers'
import { getErrorMessage } from '@/lib/type-guards'
import { apiLogger } from '@/lib/logger'
type Order = Database['public']['Tables']['orders']['Row']
type Customer = Database['public']['Tables']['customers']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']
type Recipe = Database['public']['Tables']['recipes']['Row']
type Expense = Database['public']['Tables']['expenses']['Row']

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Validate optional date range parameters
    const dateRangeValidation = DateRangeQuerySchema.safeParse({
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
    })

    if (!dateRangeValidation.success) {
      return NextResponse.json(
        { error: 'Invalid date parameters', details: dateRangeValidation.error.issues },
        { status: 400 }
      )
    }

    const { start_date: _start_date, end_date: _end_date } = dateRangeValidation.data

    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0] as string
    
    // Get orders statistics - only fields needed for calculations
    const { data: orders } = await supabase
      .from('orders')
      .select('id, total_amount, status, order_date, customer_name, created_at')
      
    const { data: todayOrders } = await supabase
      .from('orders')
      .select('id, total_amount, status, customer_name, created_at')
      .eq('order_date', today)
    
    // Get customers statistics - only count and type
    const { data: customers } = await supabase
      .from('customers')
      .select('id, customer_type')
    
    // Get ingredients statistics - only stock-related fields
    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('id, current_stock, min_stock, category')
    
    // Get recipes count - only needed fields
    const { data: recipes } = await supabase
      .from('recipes')
      .select('id, times_made, name')
    
    // Get expenses for today - only amount
    const { data: todayExpenses } = await supabase
      .from('expenses')  
      .select('amount')
      .eq('expense_date', today)
    
    // Calculate metrics
    const totalRevenue = orders?.reduce((sum: number, order: Order) =>
      sum + safeParseAmount(order.total_amount), 0) || 0

    const todayRevenue = todayOrders?.reduce((sum: number, order: Order) =>
      sum + safeParseAmount(order.total_amount), 0) || 0

    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] as const
    const activeOrders = orders?.filter((order: Order) =>
      isInArray(order.status, validStatuses)).length || 0

    const totalCustomers = customers?.length || 0
    const vipCustomers = customers?.filter((customer: Customer) =>
      safeString(customer.customer_type) === 'vip').length || 0

    const lowStockItems = ingredients?.filter((ingredient: Ingredient) => {
      const currentStock = safeParseAmount(ingredient.current_stock)
      const minStock = safeParseAmount(ingredient.min_stock)
      return currentStock <= minStock
    }).length || 0
    
    const totalIngredients = ingredients?.length || 0
    const totalRecipes = recipes?.length || 0
    
    const todayExpensesTotal = todayExpenses?.reduce((sum: number, expense: Expense) =>
      sum + safeParseAmount(expense.amount), 0) || 0

    // Calculate yesterday for comparison
    const yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0] as string

    const { data: yesterdayOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('order_date', yesterdayStr)

    const yesterdayRevenue = yesterdayOrders?.reduce((sum: number, order: Order) =>
      sum + safeParseAmount(order.total_amount), 0) || 0
    
    // Category breakdown for ingredients
    const categoryBreakdown = ingredients?.reduce((acc: Record<string, number>, ingredient: Ingredient) => {
      const category = safeString(ingredient.category, 'General')
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Recent orders for activity feed
    const recentOrders = orders
      ?.sort((a: Order, b: Order) => {
        const aTime = safeTimestamp(a.created_at)
        const bTime = safeTimestamp(b.created_at)
        return bTime - aTime
      })
      ?.slice(0, 5) || []

    // Calculate growth percentage
    const revenueGrowth = yesterdayRevenue > 0 ?
      ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100) : 0
    
    return NextResponse.json({
      revenue: {
        today: todayRevenue,
        total: totalRevenue,
        growth: revenueGrowth.toFixed(1),
        trend: revenueGrowth >= 0 ? 'up' : 'down'
      },
      orders: {
        active: activeOrders,
        total: orders?.length || 0,
        today: todayOrders?.length || 0,
        recent: recentOrders.map((order: Order) => ({
          id: order.id,
          customer: safeString(order.customer_name, 'Walk-in customer'),
          amount: order.total_amount,
          status: order.status,
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
        categories: Object.keys(categoryBreakdown).length,
        categoryBreakdown
      },
      recipes: {
        total: totalRecipes,
        popular: recipes
          ?.sort((a: Recipe, b: Recipe) => {
            const aUsage = safeParseInt(a.times_made)
            const bUsage = safeParseInt(b.times_made)
            return bUsage - aUsage
          })
          ?.slice(0, 3) || []
      },
      expenses: {
        today: todayExpensesTotal,
        netProfit: todayRevenue - todayExpensesTotal
      },
      alerts: {
        lowStock: lowStockItems,
        highExpenses: todayExpensesTotal > 500000 ? 1 : 0
      },
      lastUpdated: new Date().toISOString()
    })
    
  } catch (err: unknown) {
    apiLogger.error({ err }, 'Error fetching dashboard stats:')
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 })
  }
}

// Update daily sales summary
export async function POST() {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0] as string
    
    // Get today's data - only needed fields
    const { data: todayOrders } = await supabase
      .from('orders')
      .select('id, total_amount')
      .eq('order_date', today)
    
    const { data: todayOrderItems } = await supabase
      .from('order_items')
      .select('order_id, quantity')
    
    const { data: todayExpenses } = await supabase
      .from('expenses')
      .select('amount')
      .eq('expense_date', today)
    
    const todayOrderIds = todayOrders?.map((order: Order) => order.id) || []
    type OrderItem = Database['public']['Tables']['order_items']['Row']
    
    const todayItems = todayOrderItems?.filter((item: OrderItem) =>
      todayOrderIds.includes(item.order_id)) || []

    const totalRevenue = todayOrders?.reduce((sum: number, order: Order) =>
      sum + safeParseAmount(order.total_amount), 0) || 0

    const totalItemsSold = todayItems.reduce((sum: number, item: OrderItem) =>
      sum + safeParseInt(item.quantity), 0) || 0

    const averageOrderValue = todayOrders?.length ? totalRevenue / todayOrders.length : 0

    const totalExpenses = todayExpenses?.reduce((sum: number, expense: Expense) =>
      sum + safeParseAmount(expense.amount), 0) || 0

    const profitEstimate = totalRevenue - totalExpenses

    // Upsert daily summary
    type DailySalesSummary = Database['public']['Tables']['daily_sales_summary']['Insert']
    const summaryData: DailySalesSummary = {
      user_id: user.id,
      sales_date: today,
      total_orders: todayOrders?.length || 0,
      total_revenue: totalRevenue,
      total_items_sold: totalItemsSold,
      average_order_value: averageOrderValue,
      expenses_total: totalExpenses,
      profit_estimate: profitEstimate,
      updated_at: new Date().toISOString()
    }
    const { error } = await supabase
      .from('daily_sales_summary')
      .upsert([summaryData], {
        onConflict: 'sales_date,user_id'
      })
    
    if (error) {throw error}
    
    return NextResponse.json({ success: true, message: 'Daily summary updated' })
  } catch (err: unknown) {
    apiLogger.error({ err }, 'Error updating daily summary:')
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 })
  }
}