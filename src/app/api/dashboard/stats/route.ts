// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'


import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage, safeString } from '@/lib/type-guards'
import type { Database, OrderStatus } from '@/types/database'
import { typed } from '@/types/type-utilities'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'

import type { SupabaseClient } from '@supabase/supabase-js'

type TypedSupabaseClient = SupabaseClient<Database>

type OrderRow = Database['public']['Tables']['orders']['Row']
type CustomerRow = Database['public']['Tables']['customers']['Row']
type IngredientRow = Database['public']['Tables']['ingredients']['Row'] & { reorder_point?: number | null }
type RecipeRow = Database['public']['Tables']['recipes']['Row'] & { times_made?: number | null }
type FinancialRecordRow = Database['public']['Tables']['financial_records']['Row']
type ExpenseRow = FinancialRecordRow // Alias for backward compatibility



interface DateFilters {
  startDate?: string
  endDate?: string
  comparisonStartDate?: string
  comparisonEndDate?: string
  today: string
  yesterday: string
}

interface DashboardFetchResult {
  orders: Array<Pick<OrderRow, 'id' | 'total_amount' | 'status' | 'order_date' | 'customer_name' | 'created_at'>>
  currentPeriodOrders: Array<Pick<OrderRow, 'id' | 'total_amount' | 'status' | 'order_date' | 'customer_name' | 'created_at'>>
  comparisonOrders: Array<{ total_amount: number | null }>
  customers: Array<Pick<CustomerRow, 'id' | 'customer_type'>>
  ingredients: Array<Pick<IngredientRow, 'id' | 'name' | 'current_stock' | 'min_stock' | 'category' | 'reorder_point'>>
  recipes: Array<Pick<RecipeRow, 'id' | 'name' | 'times_made'>>
  expenses: Array<Pick<ExpenseRow, 'amount'>>
}

interface DashboardStats {
  totalRevenue: number
  currentPeriodRevenue: number
  activeOrders: number
  totalOrders: number
  currentPeriodOrderCount: number
  totalCustomers: number
  vipCustomers: number
  lowStockItems: number
  totalIngredients: number
  totalRecipes: number
  expensesTotal: number
  comparisonRevenue: number
}

interface InventoryOverview {
  categoryBreakdown: Record<string, number>
  lowStockAlerts: Array<{
    id: string
    name: string
    currentStock: number
    reorderPoint: number
  }>
}

interface DashboardResponse {
  revenue: {
    today: number
    total: number
    growth: string
    trend: 'up' | 'down'
  }
  orders: {
    active: number
    total: number
    today: number
    recent: Array<{
      id: string
      customer: string
      amount: number | null
      status: OrderStatus | null
      created_at: string | null
    }>
  }
  customers: {
    total: number
    vip: number
    regular: number
  }
  inventory: {
    total: number
    lowStock: number
    lowStockAlerts: InventoryOverview['lowStockAlerts']
    categories: number
    categoryBreakdown: Record<string, number>
  }
  recipes: {
    total: number
    popular: Array<Pick<RecipeRow, 'id' | 'name' | 'times_made'>>
  }
  expenses: {
    today: number
    netProfit: number
  }
  alerts: {
    lowStock: number
    highExpenses: number
  }
  lastUpdated: string
}

async function getTypedSupabase(): Promise<TypedSupabaseClient> {
  const client = await createClient()
  return typed(client)
}



function normalizeDate(value: string | null): string | undefined {
  if (!value) {
    return undefined
  }
  return new Date(value).toISOString().split('T')[0]
}

function calculateComparisonRange(startDate?: string, endDate?: string): { comparisonStartDate?: string; comparisonEndDate?: string } {
  const result: { comparisonStartDate?: string; comparisonEndDate?: string } = {}
  if (!startDate || !endDate) {
    return result
  }

  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = end.getTime() - start.getTime()

  const comparisonStart = new Date(start.getTime() - diffTime - (24 * 60 * 60 * 1000))
  const comparisonEnd = new Date(end.getTime() - diffTime - (24 * 60 * 60 * 1000))

  result.comparisonStartDate = comparisonStart.toISOString().split('T')[0] as string
  result.comparisonEndDate = comparisonEnd.toISOString().split('T')[0] as string

  return result
}

function buildDateFilters(searchParams: URLSearchParams): DateFilters {
  const startParam = normalizeDate(searchParams.get('start_date'))
  const endParam = normalizeDate(searchParams.get('end_date'))
  const comparisonRange = calculateComparisonRange(startParam, endParam)

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0] ?? ''
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

  const result: DateFilters = {
    today: todayStr,
    yesterday: yesterday.toISOString().split('T')[0] ?? ''
  }

  if (startParam !== undefined) {
    result.startDate = startParam
  }
  if (endParam !== undefined) {
    result.endDate = endParam
  }
  if (comparisonRange.comparisonStartDate !== undefined) {
    result.comparisonStartDate = comparisonRange.comparisonStartDate
  }
  if (comparisonRange.comparisonEndDate !== undefined) {
    result.comparisonEndDate = comparisonRange.comparisonEndDate
  }

  return result
}

function buildCurrentPeriodQuery(
  supabase: TypedSupabaseClient,
  userId: string,
  filters: DateFilters
) {
  let query = supabase
    .from('orders')
    .select('id, total_amount, status, order_date, customer_name, created_at')
    .eq('user_id', userId)

  if (filters.startDate && filters.endDate) {
    query = query
      .gte('order_date', filters.startDate)
      .lte('order_date', filters.endDate)
  } else {
    query = query.eq('order_date', filters.today)
  }

  return query
}

function buildComparisonQuery(
  supabase: TypedSupabaseClient,
  userId: string,
  filters: DateFilters
) {
  let query = supabase
    .from('orders')
    .select('total_amount')
    .eq('user_id', userId)

  if (filters.comparisonStartDate && filters.comparisonEndDate) {
    query = query
      .gte('order_date', filters.comparisonStartDate)
      .lte('order_date', filters.comparisonEndDate)
  } else {
    query = query.eq('order_date', filters.yesterday)
  }

  return query
}

async function fetchDashboardData(
  supabase: TypedSupabaseClient,
  userId: string,
  filters: DateFilters
): Promise<DashboardFetchResult> {
  const ordersQuery = supabase
    .from('orders')
    .select('id, total_amount, status, order_date, customer_name, created_at')
    .eq('user_id', userId)

  const currentPeriodQuery = buildCurrentPeriodQuery(supabase, userId, filters)
  const comparisonQuery = buildComparisonQuery(supabase, userId, filters)

  const [
    ordersResult,
    currentPeriodOrdersResult,
    comparisonOrdersResult,
    customersResult,
    ingredientsResult,
    recipesResult,
    expensesResult
  ] = await Promise.all([
    ordersQuery,
    currentPeriodQuery,
    comparisonQuery,
    supabase.from('customers').select('id, customer_type').eq('user_id', userId),
    supabase.from('ingredients').select('id, name, current_stock, min_stock, category, reorder_point').eq('user_id', userId),
    supabase.from('recipes').select('id, name, times_made').eq('user_id', userId),
    supabase.from('financial_records').select('amount').eq('user_id', userId).eq('type', 'EXPENSE')
  ])

  // Granular error checks per query
  const checkAndLog = (name: string, result: { error?: { message?: string } | null }) => {
    if (result.error) {
      const errMsg = typeof result.error.message === 'string' ? result.error.message : 'Unknown error'
      apiLogger.error({ query: name, error: result.error }, 'Dashboard data query failed')
      throw new Error(`${name} query failed: ${errMsg}`)
    }
  }

  checkAndLog('orders', ordersResult)
  checkAndLog('currentPeriodOrders', currentPeriodOrdersResult)
  checkAndLog('comparisonOrders', comparisonOrdersResult)
  checkAndLog('customers', customersResult)
  checkAndLog('ingredients', ingredientsResult)
  checkAndLog('recipes', recipesResult)
  checkAndLog('expenses', expensesResult)

  return {
    orders: ordersResult.data ?? [],
    currentPeriodOrders: currentPeriodOrdersResult.data ?? [],
    comparisonOrders: comparisonOrdersResult.data ?? [],
    customers: customersResult.data ?? [],
    ingredients: ingredientsResult.data ?? [],
    recipes: recipesResult.data ?? [],
    expenses: expensesResult.data ?? []
  }
}

function calculateStats(data: DashboardFetchResult): DashboardStats {
  const revenue = data.orders.reduce((sum, order) => sum + (order.total_amount ?? 0), 0)
  const currentRevenue = data.currentPeriodOrders.reduce((sum, order) => sum + (order.total_amount ?? 0), 0)
  const activeOrders = data.orders.filter(order =>
    order.status && ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(order.status)
  ).length

  const totalCustomers = data.customers.length
  const vipCustomers = data.customers.filter(customer => safeString(customer.customer_type) === 'vip').length

  const lowStockItems = data.ingredients.filter(ingredient => {
    const currentStock = (value => value ?? 0)(ingredient.current_stock)
    const threshold = (value => value ?? 0)(ingredient.reorder_point ?? ingredient.min_stock)
    return currentStock <= threshold
  }).length

  const expensesTotal = data.expenses.reduce((sum, expense) => sum + (value => value ?? 0)(expense.amount), 0)
  const comparisonRevenue = data.comparisonOrders.reduce((sum, order) => sum + (value => value ?? 0)(order.total_amount), 0)

  return {
    totalRevenue: revenue,
    currentPeriodRevenue: currentRevenue,
    activeOrders,
    totalOrders: data.orders.length,
    currentPeriodOrderCount: data.currentPeriodOrders.length,
    totalCustomers,
    vipCustomers,
    lowStockItems,
    totalIngredients: data.ingredients.length,
    totalRecipes: data.recipes.length,
    expensesTotal,
    comparisonRevenue
  }
}

function buildInventoryOverview(ingredients: DashboardFetchResult['ingredients']): InventoryOverview {
  const categoryBreakdown = ingredients.reduce<Record<string, number>>((acc, ingredient) => {
    const category = safeString(ingredient.category, 'General')
    acc[category] = (acc[category] ?? 0) + 1
    return acc
  }, {})

  const lowStockAlerts = ingredients
    .filter(ingredient => {
      const currentStock = (value => value ?? 0)(ingredient.current_stock)
      const reorderPoint = (value => value ?? 0)(ingredient.reorder_point ?? ingredient.min_stock)
      return currentStock <= reorderPoint
    })
    .map(ingredient => ({
      id: ingredient.id,
      name: safeString(ingredient.name, 'Unknown'),
      currentStock: (value => value ?? 0)(ingredient.current_stock),
      reorderPoint: (value => value ?? 0)(ingredient.reorder_point ?? ingredient.min_stock)
    }))

  return { categoryBreakdown, lowStockAlerts }
}

function buildRecentOrders(
  orders: DashboardFetchResult['orders']
): Array<{
  id: string
  customer: string
  amount: number | null
  status: OrderStatus | null
  created_at: string | null
}> {
  return [...orders]
    .sort((a, b) => (value => new Date(value || 0).getTime())(b.created_at) - (value => new Date(value || 0).getTime())(a.created_at))
    .slice(0, 5)
    .map(order => ({
      id: order.id,
       customer: order.customer_name || 'Walk-in customer',
      amount: order.total_amount,
      status: order.status,
      created_at: order.created_at ?? null
    }))
}

function buildPopularRecipes(
  recipes: DashboardFetchResult['recipes']
): Array<Pick<RecipeRow, 'id' | 'name' | 'times_made'>> {
  return [...recipes]
    .sort((a, b) => (value => Math.floor(value ?? 0))(b.times_made) - (value => Math.floor(value ?? 0))(a.times_made))
    .slice(0, 3)
}

function calculateGrowthMetrics(
  currentRevenue: number,
  comparisonRevenue: number
): { growth: string; trend: 'up' | 'down' } {
  if (comparisonRevenue <= 0) {
    return { growth: '0.0', trend: 'up' as const }
  }
  const growth = ((currentRevenue - comparisonRevenue) / comparisonRevenue) * 100
  return {
    growth: growth.toFixed(1),
    trend: growth >= 0 ? 'up' as const : 'down' as const
  }
}

function buildDashboardResponse(
  stats: DashboardStats,
  inventory: InventoryOverview,
  recentOrders: ReturnType<typeof buildRecentOrders>,
  popularRecipes: ReturnType<typeof buildPopularRecipes>
): DashboardResponse {
  const growth = calculateGrowthMetrics(stats.currentPeriodRevenue, stats.comparisonRevenue)

  return {
    revenue: {
      today: stats.currentPeriodRevenue,
      total: stats.totalRevenue,
      growth: growth.growth,
      trend: growth.trend
    },
    orders: {
      active: stats.activeOrders,
      total: stats.totalOrders,
      today: stats.currentPeriodOrderCount,
      recent: recentOrders
    },
    customers: {
      total: stats.totalCustomers,
      vip: stats.vipCustomers,
      regular: stats.totalCustomers - stats.vipCustomers
    },
    inventory: {
      total: stats.totalIngredients,
      lowStock: stats.lowStockItems,
      lowStockAlerts: inventory.lowStockAlerts,
      categories: Object.keys(inventory.categoryBreakdown).length,
      categoryBreakdown: inventory.categoryBreakdown
    },
    recipes: {
      total: stats.totalRecipes,
      popular: popularRecipes
    },
    expenses: {
      today: stats.expensesTotal,
      netProfit: stats.currentPeriodRevenue - stats.expensesTotal
    },
    alerts: {
      lowStock: stats.lowStockItems,
      highExpenses: stats.expensesTotal > 500000 ? 1 : 0
    },
    lastUpdated: new Date().toISOString()
  }
}

async function GET(request: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now()
  try {
    const url = new URL(request.url)
    const filters = buildDateFilters(url.searchParams)
    apiLogger.info({ path: url.pathname, filters }, 'GET /api/dashboard/stats - Start')

    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      apiLogger.warn('Unauthorized access to dashboard stats')
      return authResult
    }
    const userId = authResult.id
    apiLogger.info({ userId }, 'Authenticated user for dashboard stats')
    
    const supabase = await getTypedSupabase()
    apiLogger.debug('Supabase client initialized')

    const dataStartedAt = Date.now()
    const dashboardData = await fetchDashboardData(supabase, userId, filters)
    apiLogger.info({
      durationMs: Date.now() - dataStartedAt,
      counts: {
        orders: dashboardData.orders.length,
        currentPeriodOrders: dashboardData.currentPeriodOrders.length,
        customers: dashboardData.customers.length,
        ingredients: dashboardData.ingredients.length,
        recipes: dashboardData.recipes.length,
        expenses: dashboardData.expenses.length,
      }
    }, 'Fetched raw dashboard data')

    const stats = calculateStats(dashboardData)
    const inventory = buildInventoryOverview(dashboardData.ingredients)
    const recentOrders = buildRecentOrders(dashboardData.orders)
    const popularRecipes = buildPopularRecipes(dashboardData.recipes)

    const payload = buildDashboardResponse(stats, inventory, recentOrders, popularRecipes)
    apiLogger.info({
      durationTotalMs: Date.now() - startedAt,
      summary: {
        revenueTotal: payload.revenue.total,
        ordersTotal: payload.orders.total,
        customersTotal: payload.customers.total,
        inventoryTotal: payload.inventory.total,
        recipesTotal: payload.recipes.total,
      }
    }, 'Built dashboard response')

    const response = NextResponse.json(payload)
    // Add caching for dashboard stats (5 minutes stale-while-revalidate)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return response
  } catch (error) {
    apiLogger.error({ error, durationTotalMs: Date.now() - startedAt }, 'Error fetching dashboard stats')
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

const securedGET = withSecurity(GET, SecurityPresets.basic())

export { securedGET as GET }
