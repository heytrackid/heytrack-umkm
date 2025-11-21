'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { createClientLogger } from '@/lib/client-logger'
import { cachePresets } from '@/lib/query/query-config'
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
  // Flat properties for easier access
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  completedOrders: number
  totalCustomers: number
  lowStockItems: number
  totalRecipes: number
  cashFlow: {
    totalIncome: number
    totalExpense: number
    netCashFlow: number
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

    // Validate response structure
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid API response: expected an object')
    }

    // Provide safe defaults for missing properties
    const safeResult = {
      revenue: result.revenue || {},
      orders: result.orders || {},
      customers: result.customers || {},
      inventory: result.inventory || {},
      alerts: result.alerts || {},
      recipes: result.recipes || {},
      expenses: result.expenses || {},
      hpp: result.hpp || {},
      lastUpdated: result.lastUpdated || Date.now()
    }

    // Transform API response to match expected DashboardStats interface
    return {
      revenue: {
        today: safeResult.revenue.today ?? 0,
        target: 1000000, // 1M IDR target per day
        weekly: safeResult.revenue.total ?? 0,
        trend: safeResult.revenue.trend || 'up',
        growth: parseFloat(safeResult.revenue.growth) || 0
      },
      profit: {
        margin: 25.5, // Calculate from actual data when available
        today: safeResult.expenses.netProfit ?? 0
      },
      hpp: {
        average: safeResult.hpp.average ?? 0
      },
      products: {
        bestSeller: {
          name: safeResult.recipes.popular?.[0]?.name || 'Belum ada data',
          sold: safeResult.recipes.popular?.[0]?.times_made || 0,
          price: 0
        }
      },
      inventory: {
        alerts: safeResult.inventory.lowStock ?? 0,
        outOfStock: safeResult.alerts.lowStock ?? 0,
        lowStock: safeResult.inventory.lowStock ?? 0
      },
      orders: {
        active: safeResult.orders.active ?? 0,
        today: safeResult.orders.today ?? 0,
        total: safeResult.orders.total ?? 0,
        recent: (safeResult.orders.recent || []).map((order: { customer: string; amount: number; created_at: string }) => ({
          customer: order.customer || '',
          amount: order.amount || 0,
          time: order.created_at || ''
        }))
      },
      customers: {
        total: safeResult.customers.total ?? 0,
        vip: safeResult.customers.vip ?? 0
      },
      expenses: {
        netProfit: safeResult.expenses.netProfit ?? 0
      },
      // Flat properties for easier access
      totalOrders: safeResult.orders.total ?? 0,
      pendingOrders: safeResult.orders.active ?? 0,
      totalRevenue: safeResult.revenue.total ?? 0,
      completedOrders: safeResult.orders.today ?? 0, // Assuming today orders are completed
      totalCustomers: safeResult.customers.total ?? 0,
      lowStockItems: safeResult.inventory.lowStock ?? 0,
      totalRecipes: safeResult.recipes.total || 0,
      cashFlow: {
        totalIncome: safeResult.revenue.total ?? 0,
        totalExpense: safeResult.expenses.total || 0,
        netCashFlow: safeResult.expenses.netProfit ?? 0
      },
      lastUpdated: safeResult.lastUpdated
    }
  } catch (error) {
    // Better error detection
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    // Detect authentication issues
    if (errorMessage.includes('redirect') || errorMessage.includes('sign-in')) {
      logger.error({ error }, 'Authentication required for dashboard stats')
      throw new Error('Authentication required. Please sign in again.')
    }
    
    // Detect JSON parse errors (usually means auth redirect HTML)
    if (errorMessage.includes('JSON') || errorMessage.includes('Unexpected token')) {
      logger.error({ error }, 'Failed to parse dashboard stats response - possibly not authenticated')
      throw new Error('Authentication error. Please refresh the page.')
    }
    
    logger.error({ error }, 'Error fetching dashboard stats from API')
    
    // Throw the error instead of returning default data
    throw error
  }
}

// Fetch weekly sales data from API
const fetchWeeklySales = async (): Promise<WeeklySalesData[]> => {
  try {
    const response = await fetch('/api/dashboard/stats', {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats')
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch dashboard stats')
    }

    return result.data.revenue.revenueTrend || []
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
