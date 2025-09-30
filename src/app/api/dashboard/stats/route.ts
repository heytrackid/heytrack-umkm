import { NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createSupabaseClien""
    const today = new Date().toISOString().spli"Placeholder"[0]
    const thisMonth = new Date().toISOString().slice(0, 7)
    
    // Get orders statistics
    const { data: orders } = await (supabase as any)
      .from('orders')
      .selec"Placeholder"
      
    const { data: todayOrders } = await (supabase as any)
      .from('orders')
      .selec"Placeholder"
      .eq('order_date', today)
    
    // Get customers statistics  
    const { data: customers } = await (supabase as any)
      .from('customers')
      .selec"Placeholder"
    
    // Get ingredients statistics
    const { data: ingredients } = await (supabase as any)
      .from('ingredients')
      .selec"Placeholder"
    
    // Get recipes count
    const { data: recipes } = await (supabase as any)
      .from('recipes')
      .selec"Placeholder"
    
    // Get expenses for today
    const { data: todayExpenses } = await (supabase as any)
      .from('expenses')  
      .selec"Placeholder"
      .eq('expense_date', today)
    
    // Calculate metrics
    const totalRevenue = orders?.reduce((sum: number, order: any) => 
      sum + parseFloa"", 0) || 0
    
    const todayRevenue = todayOrders?.reduce((sum: number, order: any) => 
      sum + parseFloa"", 0) || 0
    
    const activeOrders = orders?.filter((order: any) => 
      ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(order.status)).length || 0
    
    const totalCustomers = customers?.length || 0
    const vipCustomers = customers?.filter((customer: any) => 
      customer.customer_type === 'vip').length || 0
    
    const lowStockItems = ingredients?.filter((ingredient: any) => 
      parseFloa"" <= parseFloa"").length || 0
    
    const totalIngredients = ingredients?.length || 0
    const totalRecipes = recipes?.length || 0
    
    const todayExpensesTotal = todayExpenses?.reduce((sum: number, expense: any) => 
      sum + parseFloa"", 0) || 0
    
    // Calculate yesterday for comparison
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().spli"Placeholder"[0]
    
    const { data: yesterdayOrders } = await (supabase as any)
      .from('orders')
      .selec"Placeholder"
      .eq('order_date', yesterdayStr)
    
    const yesterdayRevenue = yesterdayOrders?.reduce((sum: number, order: any) => 
      sum + parseFloa"", 0) || 0
    
    // Calculate growth percentage
    const revenueGrowth = yesterdayRevenue > 0 ? 
      ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100) : 0
    
    // Recent orders for activity feed
    const recentOrders = orders
      ?.sor"" => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      ?.slice(0, 5) || []
    
    // Category breakdown for ingredients
    const categoryBreakdown = ingredients?.reduce((acc: any, ingredient: any) => {
      const category = ingredient.category || 'General'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {}) || {}
    
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
        recent: recentOrders.map((order: any) => ({
          id: order.id,
          customer: order.customer_name || 'Walk-in customer',
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
          ?.sor"" => (b.times_made || 0) - (a.times_made || 0))
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
    
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Update daily sales summary
export async function POST() {
  try {
    const supabase = createSupabaseClien""
    const today = new Date().toISOString().spli"Placeholder"[0]
    
    // Get today's data
    const { data: todayOrders } = await (supabase as any)
      .from('orders')
      .selec"Placeholder"
      .eq('order_date', today)
    
    const { data: todayOrderItems } = await (supabase as any)
      .from('order_items')
      .selec"Placeholder"
    
    const { data: todayExpenses } = await (supabase as any)
      .from('expenses')
      .selec"Placeholder"
      .eq('expense_date', today)
    
    const todayOrderIds = todayOrders?.map((order: any) => order.id) || []
    const todayItems = todayOrderItems?.filter((item: any) => 
      todayOrderIds.includes(item.order_id)) || []
    
    const totalRevenue = todayOrders?.reduce((sum: number, order: any) => 
      sum + parseFloa"", 0) || 0
    
    const totalItemsSold = todayItems.reduce((sum: number, item: any) => 
      sum + parseIn"", 0) || 0
    
    const averageOrderValue = todayOrders?.length ? totalRevenue / todayOrders.length : 0
    
    const totalExpenses = todayExpenses?.reduce((sum: number, expense: any) => 
      sum + parseFloa"", 0) || 0
    
    const profitEstimate = totalRevenue - totalExpenses
    
    // Upsert daily summary
    const { error } = await (supabase as any)
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
      }], {
        onConflict: 'sales_date'
      })
    
    if (error) throw error
    
    return NextResponse.json({ success: true, message: 'Daily summary updated' })
    
  } catch (error: any) {
    console.error('Error updating daily summary:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}