// External libraries
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Internal modules
import { createSuccessResponse } from '@/lib/api-core'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { ORDER_STATUSES } from '@/lib/shared/constants'
import { typed } from '@/types/type-utilities'
import { SecurityPresets } from '@/utils/security/api-middleware'

// Types and schemas
import type { Database, OrderStatus } from '@/types/database'

export const runtime = 'nodejs'

import { DateRangeQuerySchema } from '@/lib/validations/common'

type TypedSupabaseClient = SupabaseClient<Database>

// Use centralized DateRangeQuerySchema
const DashboardQuerySchema = DateRangeQuerySchema

const RecentOrdersQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).optional().default(5),
})

const normalizeDate = (value: string | null | undefined): string | undefined => {
  if (!value) return undefined
  return new Date(value).toISOString().split('T')[0]
}

const calculateComparisonRange = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) return {}
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = end.getTime() - start.getTime()
  const comparisonStart = new Date(start.getTime() - diffTime - (24 * 60 * 60 * 1000))
  const comparisonEnd = new Date(end.getTime() - diffTime - (24 * 60 * 60 * 1000))
  return {
    comparisonStartDate: comparisonStart.toISOString().split('T')[0],
    comparisonEndDate: comparisonEnd.toISOString().split('T')[0]
  }
}

const buildDateFilters = (startParam?: string, endParam?: string) => {
  const comparisonRange = calculateComparisonRange(startParam, endParam)
  const today = new Date().toISOString().split('T')[0] ?? ''
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? ''
  return { today, yesterday, startDate: startParam, endDate: endParam, ...comparisonRange }
}

// GET /api/dashboard/[...slug] - Dynamic dashboard routes
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/dashboard',
    securityPreset: SecurityPresets.enhanced(),
  },
  async (context) => {
    const { params } = context
    const slug = params?.['slug'] as string[] | undefined

    if (!slug || slug.length === 0) {
      return handleAPIError(new Error('Invalid path'), 'GET /api/dashboard')
    }

    const subRoute = slug[0]

    switch (subRoute) {
      case 'stats': {
        // Dashboard stats uses custom query handling
        const validatedQuery = { start_date: undefined, end_date: undefined }
        return getDashboardStatsHandler(context, validatedQuery)
      }
      case 'hpp-summary':
        return getHppSummaryHandler(context)
      case 'production-schedule':
        return getProductionScheduleHandler(context)
      case 'recent-orders': {
        // Recent orders uses custom query handling
        const validatedQuery = { limit: 5 }
        return getRecentOrdersHandler(context, validatedQuery)
      }
      case 'weekly-sales':
        return getWeeklySalesHandler(context)
      case 'top-products':
        return getTopProductsHandler(context)
      default:
        return handleAPIError(new Error('Invalid dashboard route'), 'GET /api/dashboard')
    }
  }
)

// Dashboard stats handler
async function getDashboardStatsHandler(context: RouteContext, query: z.infer<typeof DashboardQuerySchema>) {
  const { user, supabase } = context
  const startParam = normalizeDate(query.start_date)
  const endParam = normalizeDate(query.end_date)
  const filters = buildDateFilters(startParam, endParam)

  try {
    const typedSupabase = supabase as TypedSupabaseClient

    let currentPeriodQuery = typedSupabase
      .from('orders')
      .select('id, total_amount, status, order_date, customer_name, created_at')
      .eq('user_id', user.id)

    if (filters.startDate && filters.endDate) {
      currentPeriodQuery = currentPeriodQuery.gte('order_date', filters.startDate).lte('order_date', filters.endDate)
    } else {
      currentPeriodQuery = currentPeriodQuery.eq('order_date', filters.today)
    }

    let comparisonQuery = typedSupabase.from('orders').select('total_amount').eq('user_id', user.id)
    if (filters.comparisonStartDate && filters.comparisonEndDate) {
      comparisonQuery = comparisonQuery.gte('order_date', filters.comparisonStartDate).lte('order_date', filters.comparisonEndDate)
    } else {
      comparisonQuery = comparisonQuery.eq('order_date', filters.yesterday)
    }

    const [ordersResult, currentPeriodResult, comparisonResult, customersResult, ingredientsResult, recipesResult, expensesResult, recipeIngredientsResult] = await Promise.all([
      typedSupabase.from('orders').select('id, total_amount, status, order_date, customer_name, created_at').eq('user_id', user.id),
      currentPeriodQuery,
      comparisonQuery,
      typedSupabase.from('customers').select('id, customer_type').eq('user_id', user.id),
      typedSupabase.from('ingredients').select('id, name, current_stock, min_stock, category, reorder_point').eq('user_id', user.id),
      typedSupabase.from('recipes').select('id, name, times_made').eq('user_id', user.id),
      typedSupabase.from('financial_records').select('amount').eq('user_id', user.id).eq('type', 'EXPENSE'),
      typedSupabase.from('recipe_ingredients').select('quantity, ingredients(price_per_unit)').eq('user_id', user.id)
    ])

    if (ordersResult.error || currentPeriodResult.error || comparisonResult.error || customersResult.error || ingredientsResult.error || recipesResult.error || expensesResult.error || recipeIngredientsResult.error) {
      apiLogger.error({ error: ordersResult.error || currentPeriodResult.error || comparisonResult.error || customersResult.error || ingredientsResult.error || recipesResult.error || expensesResult.error || recipeIngredientsResult.error, userId: user.id }, 'Database query failed in dashboard stats')
      return handleAPIError(new Error('Database query failed'), 'GET /api/dashboard/stats')
    }

    const orders = ordersResult.data || []
    const currentPeriodOrders = currentPeriodResult.data || []
    const comparisonOrders = comparisonResult.data || []
    const customers = customersResult.data || []
    const ingredients = ingredientsResult.data || []
    const recipes = recipesResult.data || []
    const expenses = expensesResult.data || []
    const recipeIngredients = recipeIngredientsResult.data || []

    const recipeCosts = recipeIngredients.map((ri: { quantity?: number; ingredients?: { price_per_unit?: number } | null }) => {
      const ingredient = ri.ingredients
      if (!ingredient) return 0
      return (ri.quantity || 0) * (ingredient.price_per_unit || 0)
    })
    const averageHpp = recipeCosts.length > 0 ? recipeCosts.reduce((sum, cost) => sum + cost, 0) / recipeCosts.length : 0

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const currentPeriodRevenue = currentPeriodOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const comparisonRevenue = comparisonOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const { ORDER_STATUSES } = await import('@/lib/shared/constants')
    const pendingStatus = ORDER_STATUSES.find(s => s.value === 'PENDING')?.value
    const inProgressStatus = ORDER_STATUSES.find(s => s.value === 'IN_PROGRESS')?.value
    const activeOrders = orders.filter(o => o.status === pendingStatus || o.status === inProgressStatus).length
    const vipCustomers = customers.filter(c => c.customer_type === 'vip').length
    const lowStockItems = ingredients.filter(i => (i.current_stock || 0) <= (i.min_stock || 0)).length
    const expensesTotal = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

    const revenueChange = currentPeriodRevenue - comparisonRevenue
    const growthPercent = comparisonRevenue > 0 ? ((revenueChange / comparisonRevenue) * 100).toFixed(1) : '0.0'
    const trend: 'up' | 'down' = revenueChange >= 0 ? 'up' : 'down'

    const response = {
      revenue: { today: currentPeriodRevenue, total: totalRevenue, growth: `${growthPercent}%`, trend },
      orders: {
        active: activeOrders,
        total: orders.length,
        today: currentPeriodOrders.length,
        recent: orders.slice(0, 5).map(o => ({
          id: o.id,
          customer: o.customer_name || 'Unknown',
          amount: o.total_amount,
          status: o.status as OrderStatus | null,
          created_at: o.created_at
        }))
      },
      customers: { total: customers.length, vip: vipCustomers, regular: customers.length - vipCustomers },
      inventory: {
        total: ingredients.length,
        lowStock: lowStockItems,
        lowStockAlerts: ingredients.filter(i => (i.current_stock || 0) <= (i.reorder_point || i.min_stock || 0)).slice(0, 5).map(i => ({
          id: i.id,
          name: i.name,
          currentStock: i.current_stock || 0,
          reorderPoint: i.reorder_point || i.min_stock || 0
        })),
        categories: new Set(ingredients.map(i => i.category).filter(Boolean)).size,
        categoryBreakdown: ingredients.reduce((acc, i) => {
          const cat = i.category || 'Uncategorized'
          acc[cat] = (acc[cat] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      },
      recipes: { total: recipes.length, popular: recipes.sort((a, b) => (b.times_made || 0) - (a.times_made || 0)).slice(0, 5) },
      hpp: { average: averageHpp, total: recipeCosts.reduce((sum, cost) => sum + cost, 0) },
      expenses: { today: expensesTotal, total: expensesTotal, netProfit: currentPeriodRevenue - expensesTotal },
      alerts: { lowStock: lowStockItems, highExpenses: expensesTotal > currentPeriodRevenue ? 1 : 0 },
      lastUpdated: new Date().toISOString()
    }

    apiLogger.info({ userId: user.id }, 'Dashboard stats fetched')
    return createSuccessResponse(response)
  } catch (error) {
    apiLogger.error({ error, userId: user.id }, 'Dashboard stats error')
    return handleAPIError(error, 'GET /api/dashboard/stats')
  }
}

// HPP summary handler
async function getHppSummaryHandler(context: RouteContext) {
  const { user, supabase: typedSupabase } = context

  try {
    const supabase = typed(typedSupabase)

    const [recipes, hppCalculations, alerts] = await Promise.all([
      supabase.from('recipes').select('id, name, selling_price, is_active').eq('user_id', user.id).eq('is_active', true),
      supabase.from('hpp_calculations').select('recipe_id, total_hpp, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('hpp_alerts').select('id, recipe_id, alert_type, is_read, created_at').eq('user_id', user.id).order('created_at', { ascending: false })
    ])

    const recipesData = recipes.data || []
    const calculations = hppCalculations.data || []
    const alertsData = alerts.data || []

    const hppMap = new Map()
    calculations.forEach(calc => {
      if (calc.recipe_id && calc.total_hpp !== null && !hppMap.has(calc.recipe_id)) {
        hppMap.set(calc.recipe_id, calc)
      }
    })

    const recipesWithHpp = new Set(calculations.map(calc => calc.recipe_id).filter(Boolean)).size
    const averageHpp = calculations.filter(calc => calc.total_hpp !== null && calc.total_hpp > 0).length > 0
      ? calculations.filter(calc => calc.total_hpp !== null && calc.total_hpp > 0).reduce((sum, calc) => sum + (calc.total_hpp as number), 0) /
        calculations.filter(calc => calc.total_hpp !== null && calc.total_hpp > 0).length
      : 0

    const averageMargin = recipesData.filter(recipe => (recipe.selling_price ?? 0) > 0).length > 0
      ? recipesData.filter(recipe => (recipe.selling_price ?? 0) > 0).reduce((sum, recipe) => {
          const calc = recipe.id ? hppMap.get(recipe.id) : undefined
          const hppValue = calc?.total_hpp ?? 0
          const sellingPrice = recipe.selling_price ?? 0
          const margin = sellingPrice > 0 ? ((sellingPrice - hppValue) / sellingPrice) * 100 : 0
          return sum + margin
        }, 0) / recipesData.filter(recipe => (recipe.selling_price ?? 0) > 0).length
      : 0

    const unreadAlerts = alertsData.filter(alert => !alert.is_read).length

    const response = {
      totalRecipes: recipesData.length,
      recipesWithHpp,
      averageHpp: Math.round(averageHpp),
      averageMargin: Math.round(averageMargin * 10) / 10,
      totalAlerts: alertsData.length,
      unreadAlerts,
      hppTrends: calculations.slice(0, 10).map(calc => ({ date: calc.created_at, value: calc.total_hpp ?? null })),
      topRecipes: recipesData.map(recipe => {
        const calc = recipe.id ? hppMap.get(recipe.id) : undefined
        const hppValue = calc?.total_hpp ?? 0
        const sellingPrice = recipe.selling_price ?? 0
        const margin = sellingPrice > 0 ? ((sellingPrice - hppValue) / sellingPrice) * 100 : 0
        return {
          id: recipe.id ?? '',
          name: recipe.name ?? 'Unknown Recipe',
          hpp_value: hppValue,
          margin_percentage: margin,
          last_updated: calc?.created_at ?? ''
        }
      }).filter(recipe => recipe.id && recipe.hpp_value > 0).sort((a, b) => b.margin_percentage - a.margin_percentage).slice(0, 3),
      recentChanges: alertsData.filter(alert => alert.alert_type === 'PRICE_INCREASE' || alert.alert_type === 'PRICE_DECREASE').slice(0, 3).map(alert => {
        const recipe = recipesData.find(entry => entry.id === alert.recipe_id)
        return {
          recipe_id: alert.recipe_id,
          recipe_name: recipe?.name ?? 'Unknown Recipe',
          change_percentage: 10,
          direction: alert.alert_type === 'PRICE_INCREASE' ? 'increase' as const : 'decrease' as const
        }
      })
    }

    return createSuccessResponse(response)
  } catch (error) {
    apiLogger.error({ error, userId: user.id }, 'Error fetching HPP dashboard summary')
    return handleAPIError(error, 'GET /api/dashboard/hpp-summary')
  }
}

// Production schedule handler
async function getProductionScheduleHandler(context: RouteContext) {
  const { user, supabase: typedSupabase } = context

  try {
    const supabase = typed(typedSupabase)
    const today = new Date()
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const start = today.toISOString().split('T')[0]
    const end = tomorrow.toISOString().split('T')[0]
    
    if (!start || !end) {
      return handleAPIError(new Error('Invalid date format'), 'GET /api/dashboard/production-schedule')
    }

    const [batches, pendingOrders, lowStockAlerts] = await Promise.all([
      supabase.from('productions').select(`
        id, quantity, status, started_at, completed_at,
        recipe:recipes (id, name, image_url, cost_per_unit)
      `).eq('user_id', user.id).gte('started_at', start).lt('started_at', end).order('started_at'),
      supabase.from('orders').select(`
        id, order_no, customer_name, delivery_date, priority, status,
        order_items (recipe:recipes (name))
      `).eq('user_id', user.id).in('status', [
        ORDER_STATUSES.find(s => s.value === 'CONFIRMED')?.value ?? 'CONFIRMED',
        ORDER_STATUSES.find(s => s.value === 'IN_PROGRESS')?.value ?? 'IN_PROGRESS'
      ]).is('production_batch_id', null).order('delivery_date', { nullsFirst: false }).limit(100),
      supabase.from('ingredients').select('id, name, current_stock, min_stock').eq('user_id', user.id).order('current_stock').limit(100)
    ])

    const batchesData = (batches.data ?? []) as Array<{ id: string; status: string; started_at?: string }>
    const pendingOrdersData = (pendingOrders.data ?? []) as Array<{ id: string; priority?: string }>
    const lowStockData = (lowStockAlerts.data ?? []).map(item => ({
      id: item.id,
      name: item.name,
      current_stock: item.current_stock,
      stock_status: (item.current_stock ?? 0) <= (item.min_stock ?? 0) ? 'LOW_STOCK' : 'IN_STOCK'
    }))

    // Note: Production batches use different status values than orders
    const summary = {
      total_batches_today: batchesData.length,
      planned_batches: batchesData.filter(batch => batch.status === 'PLANNED').length,
      in_progress_batches: batchesData.filter(batch => batch.status === 'IN_PROGRESS').length,
      completed_batches: batchesData.filter(batch => batch.status === 'COMPLETED').length,
      pending_orders_count: pendingOrdersData.length,
      urgent_orders: pendingOrdersData.filter(order => order.priority === 'URGENT').length,
      critical_stock_items: lowStockData.filter(item => item.stock_status === 'OUT_OF_STOCK').length
    }

    const response = {
      production_schedule: batchesData,
      pending_orders: pendingOrdersData,
      low_stock_alerts: lowStockData,
      summary
    }

    apiLogger.info({
      userId: user.id,
      batchCount: batchesData.length,
      pendingCount: pendingOrdersData.length,
      lowStockCount: lowStockData.length
    }, 'Dashboard production schedule fetched')

    return createSuccessResponse(response)
  } catch (error) {
    apiLogger.error({ error, userId: user.id }, 'Dashboard production schedule error')
    return handleAPIError(error, 'GET /api/dashboard/production-schedule')
  }
}

// Recent orders handler
async function getRecentOrdersHandler(context: RouteContext, query: z.infer<typeof RecentOrdersQuerySchema>) {
  const { user, supabase } = context
  const limit = query.limit

  const typedSupabase = supabase as TypedSupabaseClient
  const { data, error } = await typedSupabase
    .from('orders')
    .select(`
      id,
      order_number,
      total_amount,
      status,
      created_at,
      customers (
        name
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    apiLogger.error({ error }, 'Failed to fetch recent orders')
    return handleAPIError(error, 'GET /api/dashboard/recent-orders')
  }

  return createSuccessResponse(data)
}

// Top products handler
async function getTopProductsHandler(context: RouteContext) {
  const { user, supabase } = context

  try {
    const typedSupabase = supabase as TypedSupabaseClient

    // Get top products by revenue from completed orders
    const { data, error } = await typedSupabase
      .from('order_items')
      .select(`
        product_name,
        quantity,
        unit_price,
        total_price,
        orders!inner (
          status,
          user_id
        )
      `)
      .eq('orders.user_id', user.id)
      .eq('orders.status', 'DELIVERED')
      .order('total_price', { ascending: false })
      .limit(100) // Get more data to aggregate properly

    if (error) {
      apiLogger.error({ error }, 'Failed to fetch top products data')
      return handleAPIError(error, 'GET /api/dashboard/top-products')
    }

    // Aggregate by product name
    const productMap = new Map<string, { sold: number; revenue: number }>()

    data?.forEach((item: { product_name: string | null; quantity: number; total_price: number }) => {
      const name = item.product_name || 'Unknown Product'
      const existing = productMap.get(name) || { sold: 0, revenue: 0 }

      productMap.set(name, {
        sold: existing.sold + (item.quantity || 0),
        revenue: existing.revenue + (item.total_price || 0)
      })
    })

    // Convert to array and sort by revenue
    const topProducts = Array.from(productMap.entries())
      .map(([name, stats]) => ({
        name,
        sold: stats.sold,
        revenue: stats.revenue,
        color: getProductColor(name) // Simple color assignment
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5) // Top 5 products

    return createSuccessResponse(topProducts)
  } catch (error) {
    apiLogger.error({ error }, 'Unhandled error in top products handler')
    return handleAPIError(error, 'GET /api/dashboard/top-products')
  }
}

// Helper function to assign colors to products
function getProductColor(productName: string): string {
  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ]

  // Simple hash function to assign consistent colors
  let hash = 0
  for (let i = 0; i < productName.length; i++) {
    hash = productName.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]!
}

// Weekly sales handler - returns last 30 days of data
async function getWeeklySalesHandler(context: RouteContext) {
  const { user, supabase } = context

  try {
    const today = new Date()
    const daysToShow = 30 // Show last 30 days
    
    // Calculate date range
    const startDate = new Date(today.getTime() - (daysToShow - 1) * 24 * 60 * 60 * 1000)
    const startDateStr = startDate.toISOString().split('T')[0] ?? ''
    const endDateStr = today.toISOString().split('T')[0] ?? ''

    // Fetch all orders and expenses in date range with single queries
    const [ordersResult, expensesResult] = await Promise.all([
      supabase
        .from('orders')
        .select('total_amount, order_date')
        .eq('user_id', user.id)
        .gte('order_date', startDateStr)
        .lte('order_date', endDateStr),
      supabase
        .from('financial_records')
        .select('amount, date')
        .eq('user_id', user.id)
        .eq('type', 'EXPENSE')
        .gte('date', startDateStr)
        .lte('date', endDateStr)
    ])

    if (ordersResult.error) {
      apiLogger.error({ error: ordersResult.error }, 'Error fetching orders for weekly sales')
      return handleAPIError(ordersResult.error, 'GET /api/dashboard/weekly-sales')
    }

    const orders = ordersResult.data || []
    const expenses = expensesResult.data || []

    // Group orders by date
    const ordersByDate = new Map<string, { revenue: number; count: number }>()
    orders.forEach(order => {
      const dateKey = order.order_date || ''
      const existing = ordersByDate.get(dateKey) || { revenue: 0, count: 0 }
      ordersByDate.set(dateKey, {
        revenue: existing.revenue + (order.total_amount || 0),
        count: existing.count + 1
      })
    })

    // Group expenses by date
    const expensesByDate = new Map<string, number>()
    expenses.forEach(expense => {
      const dateKey = expense.date || ''
      const existing = expensesByDate.get(dateKey) || 0
      expensesByDate.set(dateKey, existing + (expense.amount || 0))
    })

    // Build sales data for each day
    const salesData = []
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0] ?? ''
      
      const orderData = ordersByDate.get(dateStr) || { revenue: 0, count: 0 }
      const totalExpenses = expensesByDate.get(dateStr) || 0

      // Format date for display (e.g., "9 Des" or "Mon" for recent days)
      const dayLabel = i < 7 
        ? date.toLocaleDateString('id-ID', { weekday: 'short' })
        : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

      salesData.push({
        day: dayLabel,
        date: dateStr,
        revenue: orderData.revenue,
        orders: orderData.count,
        expenses: totalExpenses,
        isToday: i === 0
      })
    }

    return createSuccessResponse(salesData)
  } catch (error) {
    apiLogger.error({ error }, 'Error in weekly sales API')
    return handleAPIError(error, 'GET /api/dashboard/weekly-sales')
  }
}