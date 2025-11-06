'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import type { Row } from '@/types/database'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('Hook')
import { cachePresets } from '@/providers/QueryProvider'


// Dashboard stats type
export interface DashboardStats {
  revenue: {
    today: number
    target: number
    weekly: number
    trend: 'up' | 'down'
    growth: number
  }
  profit: {
    margin: number
    today: number
  }
  hpp: {
    average: number
  }
  products: {
    bestSeller: {
      name: string
      sold: number
      price: number
    }
  }
  inventory: {
    alerts: number
    outOfStock: number
    lowStock: number
  }
  orders: {
    active: number
    today: number
    total: number
    recent: Array<{
      customer: string
      amount: number
      time: string
    }>
  }
  customers: {
    total: number
    vip: number
  }
  expenses: {
    netProfit: number
  }
  lastUpdated: number
}

// Weekly sales data type
export interface WeeklySalesData {
  day: string
  revenue: number
  isToday: boolean
}

// Top products data type
export interface TopProductsData {
  name: string
  sold: number
  revenue: number
  color: string
}

// Fetch dashboard stats
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get current date
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
    
    // Get week start (7 days ago)
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Create Supabase client
    const supabase = createClient()
    
    // Fetch orders for today and this week
    const { data: todayOrders, error: todayError } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', todayStart.toISOString())
      .lt('created_at', todayEnd.toISOString())

    if (todayError) {throw todayError}

    const { data: weeklyOrders, error: weeklyError } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', weekStart.toISOString())
      .lt('created_at', todayEnd.toISOString())

    if (weeklyError) {throw weeklyError}

    // Fetch customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')

    if (customersError) {throw customersError}

    // Fetch inventory with low stock
    const { data: inventory, error: inventoryError } = await supabase
      .from('ingredients')
      .select('*')

    if (inventoryError) {throw inventoryError}

    type Order = Row<'orders'>
    type Ingredient = Row<'ingredients'>
    type Customer = Row<'customers'>

    // Calculate stats
    const todayRevenue = todayOrders?.reduce((sum, order: Order) => sum + ((order.total_amount as number) || 0), 0) || 0
    const weeklyRevenue = weeklyOrders?.reduce((sum, order: Order) => sum + ((order.total_amount as number) || 0), 0) || 0
    
    const lowStockItems = inventory?.filter((item: Ingredient) => 
      (item.current_stock ?? 0) <= (item.reorder_point ?? 0)
    ) || []
    const outOfStockItems = inventory?.filter((item: Ingredient) => item.current_stock === 0) || []
    
    const vipCustomers = customers?.filter((customer: Customer) => customer.customer_type === 'vip').length || 0

    // Get recent orders for activity
    const recentOrders = todayOrders?.slice(-3).map((order: Order) => ({
      customer: order.customer_name ?? 'Unknown',
      amount: order.total_amount ?? 0,
      time: order.created_at ?? ''
    })) || []

    return {
      revenue: {
        today: todayRevenue,
        target: 1000000, // 1M IDR target per day
        weekly: weeklyRevenue,
        trend: todayRevenue > (weeklyRevenue / 7) ? 'up' : 'down',
        growth: weeklyRevenue > 0 ? ((todayRevenue - (weeklyRevenue / 7)) / (weeklyRevenue / 7)) * 100 : 0
      },
      profit: {
        margin: 25.5, // Calculate from actual data when available
        today: todayRevenue * 0.255 // 25.5% margin
      },
      hpp: {
        average: todayRevenue * 0.45 // Estimate 45% of revenue as HPP
      },
      products: {
        bestSeller: {
          name: 'Belum ada data',
          sold: 0,
          price: 0
        }
      },
      inventory: {
        alerts: lowStockItems.length + outOfStockItems.length,
        outOfStock: outOfStockItems.length,
        lowStock: lowStockItems.length
      },
      orders: {
        active: todayOrders?.length || 0,
        today: todayOrders?.length || 0,
        total: weeklyOrders?.length || 0,
        recent: recentOrders
      },
      customers: {
        total: customers?.length || 0,
        vip: vipCustomers
      },
      expenses: {
        netProfit: todayRevenue * 0.255 // Estimate profit
      },
      lastUpdated: Date.now()
    }
  } catch (err: unknown) {
    logger.error({ err }, 'Error fetching dashboard stats:')
    
    // Return default/empty data on error
    return {
      revenue: { today: 0, target: 1000000, weekly: 0, trend: 'up', growth: 0 },
      profit: { margin: 0, today: 0 },
      hpp: { average: 0 },
      products: { bestSeller: { name: 'Belum ada data', sold: 0, price: 0 } },
      inventory: { alerts: 0, outOfStock: 0, lowStock: 0 },
      orders: { active: 0, today: 0, total: 0, recent: [] },
      customers: { total: 0, vip: 0 },
      expenses: { netProfit: 0 },
      lastUpdated: Date.now()
    }
  }
}

// Fetch weekly sales data
const fetchWeeklySales = async (): Promise<WeeklySalesData[]> => {
  try {
    const today = new Date()
    const weekData: WeeklySalesData[] = []
    
    // Get data for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const { data: orders, error } = await createClient()
        .from('orders')
        .select('*')
        .gte('created_at', dayStart.toISOString())
        .lt('created_at', dayEnd.toISOString())

      if (error) {throw error}

      type Order = Row<'orders'>
      const revenue = orders?.reduce((sum, order: Order) => sum + ((order.total_amount as number) || 0), 0) || 0
      
      weekData.push({
        day: date.toLocaleDateString('id-ID', { weekday: 'short' }),
        revenue,
        isToday: i === 0
      })
    }
    
    return weekData
  } catch (err: unknown) {
    logger.error({ err }, 'Error fetching weekly sales:')
    return []
  }
}

// Fetch top products data
const fetchTopProducts = (): TopProductsData[] => {
  try {
    // This would need to be implemented based on your order_items and recipes schema
    // For now, return empty array since we're removing mock data
    return []
  } catch (err: unknown) {
    logger.error({ err }, 'Error fetching top products:')
    return []
  }
}

// Hooks
export const useDashboardStats = () => useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    ...cachePresets.dashboard,
  })

export const useWeeklySales = () => useQuery({
    queryKey: ['dashboard', 'weekly-sales'],
    queryFn: fetchWeeklySales,
    ...cachePresets.analytics,
  })

export const useTopProducts = () => useQuery({
    queryKey: ['dashboard', 'top-products'],
    queryFn: fetchTopProducts,
    ...cachePresets.analytics,
  })