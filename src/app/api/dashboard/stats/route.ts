import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { DateRangeQuerySchema } from '@/lib/validations/api-validations'
import type { Database } from '@/types/supabase-generated'

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
    
    // Get orders statistics
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      
    const { data: todayOrders } = await supabase
      .from('orders')
      .select('*')
      .eq('order_date', today)
    
    // Get customers statistics  
    const { data: customers } = await supabase
      .from('customers')
      .select('*')
    
    // Get ingredients statistics
    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('*')
    
    // Get recipes count
    const { data: recipes } = await supabase
      .from('recipes')
      .select('*')
    
    // Get expenses for today
    const { data: todayExpenses } = await supabase
      .from('expenses')  
      .select('*')
      .eq('expense_date', today)
    
    // Calculate metrics
    const totalRevenue = orders?.reduce((sum: number, order: Order) =>
      sum + parseFloat(String(order.total_amount || 0)), 0) || 0

    const todayRevenue = todayOrders?.reduce((sum: number, order: Order) =>
      sum + parseFloat(String(order.total_amount || 0)), 0) || 0

    const activeOrders = orders?.filter((order: Order) =>
      ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(String(order.status || ''))).length || 0

    const totalCustomers = customers?.length || 0
    const vipCustomers = customers?.filter((customer: Customer) =>
      String(customer.customer_type || '') === 'vip').length || 0

    const lowStockItems = ingredients?.filter((ingredient: Ingredient) => {
      const currentStock = Number(ingredient.current_stock || 0)
      const minStock = Number(ingredient.min_stock || 0)
      return currentStock <= minStock
    }).length || 0
    
    const totalIngredients = ingredients?.length || 0
    const totalRecipes = recipes?.length || 0
    
    const todayExpensesTotal = todayExpenses?.reduce((sum: number, expense: Expense) =>
      sum + parseFloat(String(expense.amount || 0)), 0) || 0

    // Calculate yesterday for comparison
    const yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0] as string

    const { data: yesterdayOrders } = await supabase
      .from('orders')
      .select('*')
      .eq('order_date', yesterdayStr)

    const yesterdayRevenue = yesterdayOrders?.reduce((sum: number, order: Order) =>
      sum + parseFloat(String((order as any).total_amount || 0)), 0) || 0
    
    // Category breakdown for ingredients
    const categoryBreakdown = ingredients?.reduce((acc: Record<string, number>, ingredient: Ingredient) => {
      const category = String(ingredient.category || 'General')
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Recent orders for activity feed
    const recentOrders = orders
      ?.sort((a: Order, b: Order) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
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
          customer: String(order.customer_name || 'Walk-in customer'),
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
            const aUsage = Number(a.times_made || 0)
            const bUsage = Number(b.times_made || 0)
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
    
  } catch (error: unknown) {
    apiLogger.error({ error: error }, 'Error fetching dashboard stats:')
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// Update daily sales summary
export async function POST() {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0] as string
    
    // Get today's data
    const { data: todayOrders } = await supabase
      .from('orders')
      .select('*')
      .eq('order_date', today)
    
    const { data: todayOrderItems } = await supabase
      .from('order_items')
      .select('*')
    
    const { data: todayExpenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('expense_date', today)
    
    const todayOrderIds = todayOrders?.map((order: Order) => order.id) || []
    type OrderItem = Database['public']['Tables']['order_items']['Row']
    
    const todayItems = todayOrderItems?.filter((item: OrderItem) =>
      todayOrderIds.includes(item.order_id)) || []

    const totalRevenue = todayOrders?.reduce((sum: number, order: Order) =>
      sum + parseFloat(String(order.total_amount || 0)), 0) || 0

    const totalItemsSold = todayItems.reduce((sum: number, item: OrderItem) =>
      sum + parseInt(String(item.quantity || 0), 10), 0) || 0

    const averageOrderValue = todayOrders?.length ? totalRevenue / todayOrders.length : 0

    const totalExpenses = todayExpenses?.reduce((sum: number, expense: Expense) =>
      sum + parseFloat(String(expense.amount || 0)), 0) || 0

    const profitEstimate = totalRevenue - totalExpenses

    // Upsert daily summary
    type DailySalesSummary = Database['public']['Tables']['daily_sales_summary']['Insert']
    
    const { error } = await supabase
      .from('daily_sales_summary')
      .upsert([{
        sales_date: today,
        total_orders: todayOrders?.length || 0,
        total_revenue: totalRevenue,
        total_items_sold: totalItemsSold,
        average_order_value: averageOrderValue,
        expenses_total: totalExpenses,
        profit_estimate: profitEstimate,
        updated_at: new Date().toISOString()
      } as DailySalesSummary], {
        onConflict: 'sales_date'
      })
    
    if (error) {throw error}
    
    return NextResponse.json({ success: true, message: 'Daily summary updated' })
    
  } catch (error: unknown) {
    apiLogger.error({ error: error }, 'Error updating daily summary:')
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}