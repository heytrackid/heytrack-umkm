'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { createClientLogger } from '@/lib/client-logger'
import { cachePresets } from '@/providers/QueryProvider'
import { createClient } from '@/utils/supabase/client'


const logger = createClientLogger('Hook')


// Dashboard stats type
export interface DashboardStats {
  revenue: {
    today: number
    target: number
    weekly: number
    trend: 'down' | 'up'
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

// Fetch dashboard stats from API
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await fetch('/api/dashboard/stats', {
      credentials: 'include', // Include cookies for authentication
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard stats: ${response.status}`)
    }

    const result = await response.json()

    // Transform API response to match expected DashboardStats interface
    return {
      revenue: {
        today: result.revenue.today,
        target: 1000000, // 1M IDR target per day
        weekly: result.revenue.total,
        trend: result.revenue.trend,
        growth: parseFloat(result.revenue.growth)
      },
      profit: {
        margin: 25.5, // Calculate from actual data when available
        today: result.expenses.netProfit
      },
      hpp: {
        average: result.hpp.average
      },
      products: {
        bestSeller: {
          name: result.recipes.popular[0]?.name || 'Belum ada data',
          sold: result.recipes.popular[0]?.times_made || 0,
          price: 0
        }
      },
      inventory: {
        alerts: result.inventory.lowStock,
        outOfStock: result.alerts.lowStock,
        lowStock: result.inventory.lowStock
      },
      orders: {
        active: result.orders.active,
        today: result.orders.today,
        total: result.orders.total,
        recent: result.orders.recent.map((order: { customer: string; amount: number; created_at: string }) => ({
          customer: order.customer,
          amount: order.amount,
          time: order.created_at
        }))
      },
      customers: {
        total: result.customers.total,
        vip: result.customers.vip
      },
      expenses: {
        netProfit: result.expenses.netProfit
      },
      lastUpdated: result.lastUpdated
    }
  } catch (error) {
    logger.error({ error }, 'Error fetching dashboard stats from API:')

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

      const supabase = createClient()
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', dayStart.toISOString())
        .lt('created_at', dayEnd.toISOString())

      if (error) {throw error}

      type OrderAmount = { total_amount: number | null }
      const revenue = orders?.reduce((sum: number, order: OrderAmount) => sum + ((order.total_amount as number) || 0), 0) || 0

      weekData.push({
        day: date.toLocaleDateString('id-ID', { weekday: 'short' }),
        revenue,
        isToday: i === 0
      })
    }
    
    return weekData
   } catch (error) {
     logger.error({ error }, 'Error fetching weekly sales:')
     return []
   }
}

// Fetch top products data
const fetchTopProducts = (): TopProductsData[] => {
  // This would need to be implemented based on your order_items and recipes schema
  // TODO: Implement top products analytics
  return []
}

// Hooks
export const useDashboardStats = (): UseQueryResult<DashboardStats> => useQuery<DashboardStats, Error>({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    ...cachePresets.dashboard,
  })

export const useWeeklySales = (): UseQueryResult<WeeklySalesData[]> => useQuery<WeeklySalesData[], Error>({
    queryKey: ['dashboard', 'weekly-sales'],
    queryFn: fetchWeeklySales,
    ...cachePresets.analytics,
  })

export const useTopProducts = (): UseQueryResult<TopProductsData[]> => useQuery<TopProductsData[], Error>({
    queryKey: ['dashboard', 'top-products'],
    queryFn: fetchTopProducts,
    ...cachePresets.analytics,
  })
