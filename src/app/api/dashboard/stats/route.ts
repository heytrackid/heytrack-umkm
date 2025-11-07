// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { type NextRequest, NextResponse } from 'next/server'

import { safeParseAmount, safeParseInt, safeString, safeTimestamp, isInArray } from '@/lib/api-helpers'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
import type { Database, OrderStatus } from '@/types/database'
import { typed } from '@/types/type-utilities'
import { withSecurity, SecurityPresets } from '@/utils/security'
import { createClient } from '@/utils/supabase/server'

import type { SupabaseClient } from '@supabase/supabase-js'

type TypedSupabaseClient = ReturnType<typeof typed>

type OrderRow = Database['public']['Tables']['orders']['Row']
type CustomerRow = Database['public']['Tables']['customers']['Row']
type IngredientRow = Database['public']['Tables']['ingredients']['Row'] & { reorder_point?: number | null }
type RecipeRow = Database['public']['Tables']['recipes']['Row'] & { times_made?: number | null }
type ExpenseRow = Database['public']['Tables']['expenses']['Row']
type DailySalesSummaryInsert = Database['public']['Tables']['daily_sales_summary']['Insert']
type OrdersQueryBuilder = ReturnType<TypedSupabaseClient['from']>

interface DateFilters {
  startDate?: string
  endDate?: string
  comparisonStartDate?: string
  comparisonEndDate?: string
  today: string
  yesterday: string
}

interface DashboardFetchResult {
  orders: OrderRow[]
  currentPeriodOrders: OrderRow[]
  comparisonOrders: Array<{ total_amount: number | null }>
  customers: CustomerRow[]
  ingredients: IngredientRow[]
  recipes: RecipeRow[]
  expenses: ExpenseRow[]
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
      time: string | null
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

function getTypedSupabase(): Promise<TypedSupabaseClient> {
  return createClient().then(client => typed(client))
}

async function requireUserId(supabase: SupabaseClient<Database>): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Unauthorized')
  }
  return user.id
}

function normalizeDate(value: string | null): string | undefined {
  if (!value) {
    return undefined
  }
  return new Date(value).toISOString().split('T')[0]
}

function calculateComparisonRange(startDate?: string, endDate?: string): { comparisonStartDate?: string; comparisonEndDate?: string } {
  if (!startDate || !endDate) {
    return { comparisonStartDate: undefined, comparisonEndDate: undefined }
  }

  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffDays = Math.abs(Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))

  const comparisonEnd = new Date(start)
  comparisonEnd.setDate(comparisonEnd.getDate() - 1)
  const comparisonStart = new Date(comparisonEnd)
  comparisonStart.setDate(comparisonStart.getDate() - diffDays)

  return {
    comparisonStartDate: comparisonStart.toISOString().split('T')[0],
    comparisonEndDate: comparisonEnd.toISOString().split('T')[0]
  }
}

function buildDateFilters(searchParams: URLSearchParams): DateFilters {
  const startParam = normalizeDate(searchParams.get('start_date'))
  const endParam = normalizeDate(searchParams.get('end_date'))
  const { comparisonStartDate, comparisonEndDate } = calculateComparisonRange(startParam, endParam)

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0] ?? ''
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

  return {
    startDate: startParam,
    endDate: endParam,
    comparisonStartDate,
    comparisonEndDate,
    today: todayStr,
    yesterday: yesterday.toISOString().split('T')[0] ?? ''
  }
}

function buildCurrentPeriodQuery(
  supabase: TypedSupabaseClient,
  userId: string,
  filters: DateFilters
): OrdersQueryBuilder {
  const query = supabase
    .from('orders')
    .select('id, total_amount, status, customer_name, created_at')
    .eq('user_id', userId)

  if (filters.startDate && filters.endDate) {
    return query
      .gte('order_date', filters.startDate)
      .lte('order_date', filters.endDate)
  }

  return query.eq('order_date', filters.today)
}

function buildComparisonQuery(
  supabase: TypedSupabaseClient,
  userId: string,
  filters: DateFilters
): OrdersQueryBuilder {
  const query = supabase
    .from('orders')
    .select('total_amount')
    .eq('user_id', userId)

  if (filters.startDate && filters.endDate && filters.comparisonStartDate && filters.comparisonEndDate) {
    return query
      .gte('order_date', filters.comparisonStartDate)
      .lte('order_date', filters.comparisonEndDate)
  }

  return query.eq('order_date', filters.yesterday)
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
    supabase.from('expenses').select('amount').eq('user_id', userId)
  ])

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
  const revenue = data.orders.reduce((sum, order) => sum + safeParseAmount(order.total_amount), 0)
  const currentRevenue = data.currentPeriodOrders.reduce((sum, order) => sum + safeParseAmount(order.total_amount), 0)
  const activeOrders = data.orders.filter(order =>
    isInArray(order.status, ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] as const)
  ).length

  const totalCustomers = data.customers.length
  const vipCustomers = data.customers.filter(customer => safeString(customer.customer_type) === 'vip').length

  const lowStockItems = data.ingredients.filter(ingredient => {
    const currentStock = safeParseAmount(ingredient.current_stock)
    const threshold = safeParseAmount(ingredient.reorder_point ?? ingredient.min_stock)
    return currentStock <= threshold
  }).length

  const expensesTotal = data.expenses.reduce((sum, expense) => sum + safeParseAmount(expense.amount), 0)
  const comparisonRevenue = data.comparisonOrders.reduce((sum, order) => sum + safeParseAmount(order.total_amount), 0)

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

function buildInventoryOverview(ingredients: IngredientRow[]): InventoryOverview {
  const categoryBreakdown = ingredients.reduce<Record<string, number>>((acc, ingredient) => {
    const category = safeString(ingredient.category, 'General')
    acc[category] = (acc[category] ?? 0) + 1
    return acc
  }, {})

  const lowStockAlerts = ingredients
    .filter(ingredient => {
      const currentStock = safeParseAmount(ingredient.current_stock)
      const reorderPoint = safeParseAmount(ingredient.reorder_point ?? ingredient.min_stock)
      return currentStock <= reorderPoint
    })
    .map(ingredient => ({
      id: ingredient.id,
      name: safeString(ingredient.name, 'Unknown'),
      currentStock: safeParseAmount(ingredient.current_stock),
      reorderPoint: safeParseAmount(ingredient.reorder_point ?? ingredient.min_stock)
    }))

  return { categoryBreakdown, lowStockAlerts }
}

function buildRecentOrders(
  orders: OrderRow[]
): Array<{
  id: string
  customer: string
  amount: number | null
  status: OrderStatus | null
  time: string | null
}> {
  return [...orders]
    .sort((a, b) => safeTimestamp(b.created_at) - safeTimestamp(a.created_at))
    .slice(0, 5)
    .map(order => ({
      id: order.id,
      customer: safeString(order.customer_name, 'Walk-in customer'),
      amount: order.total_amount,
      status: order.status,
      time: order.created_at ?? null
    }))
}

function buildPopularRecipes(
  recipes: RecipeRow[]
): Array<Pick<RecipeRow, 'id' | 'name' | 'times_made'>> {
  return [...recipes]
    .sort((a, b) => safeParseInt(b.times_made) - safeParseInt(a.times_made))
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
  try {
    const filters = buildDateFilters(new URL(request.url).searchParams)
    const supabase = await getTypedSupabase()
    const userId = await requireUserId(supabase)

    const dashboardData = await fetchDashboardData(supabase, userId, filters)
    const stats = calculateStats(dashboardData)
    const inventory = buildInventoryOverview(dashboardData.ingredients)
    const recentOrders = buildRecentOrders(dashboardData.orders)
    const popularRecipes = buildPopularRecipes(dashboardData.recipes)

    const response = NextResponse.json(
      buildDashboardResponse(stats, inventory, recentOrders, popularRecipes)
    )
    // Add caching for dashboard stats (5 minutes stale-while-revalidate)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return response
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error fetching dashboard stats')
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

interface DailySummaryResult {
  totalRevenue: number
  totalItemsSold: number
  totalExpenses: number
  orderCount: number
}

async function fetchTodaySummary(
  supabase: TypedSupabaseClient,
  userId: string,
  today: string
): Promise<DailySummaryResult> {
  const [ordersResult, orderItemsResult, expensesResult] = await Promise.all([
    supabase.from('orders').select('id, total_amount').eq('user_id', userId).eq('order_date', today),
    supabase.from('order_items').select('order_id, quantity').eq('user_id', userId),
    supabase.from('expenses').select('amount').eq('user_id', userId).eq('expense_date', today)
  ])

  const orders = ordersResult.data ?? []
  const orderItems = orderItemsResult.data ?? []
  const expenses = expensesResult.data ?? []

  const orderIds = orders.map(order => order.id)
  const todayItems = orderItems.filter(item => orderIds.includes(item.order_id))

  const totalRevenue = orders.reduce((sum, order) => sum + safeParseAmount(order.total_amount), 0)
  const totalItemsSold = todayItems.reduce((sum, item) => sum + safeParseInt(item.quantity), 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + safeParseAmount(expense.amount), 0)

  return {
    totalRevenue,
    totalItemsSold,
    totalExpenses,
    orderCount: orders.length
  }
}

function buildDailySummaryPayload(
  today: string,
  userId: string,
  summary: DailySummaryResult
): DailySalesSummaryInsert {
  const averageOrderValue = summary.orderCount > 0 ? summary.totalRevenue / summary.orderCount : 0

  return {
    sales_date: today,
    user_id: userId,
    total_orders: summary.orderCount,
    total_revenue: summary.totalRevenue,
    total_items_sold: summary.totalItemsSold,
    average_order_value: averageOrderValue,
    expenses_total: summary.totalExpenses,
    profit_estimate: summary.totalRevenue - summary.totalExpenses
  }
}

async function POST(): Promise<NextResponse> {
  try {
    const supabase = await getTypedSupabase()
    const userId = await requireUserId(supabase)
    const today = new Date().toISOString().split('T')[0] ?? ''

    const summary = await fetchTodaySummary(supabase, userId, today)
    const payload = buildDailySummaryPayload(today, userId, summary)

    const { error } = await supabase
      .from('daily_sales_summary')
      .upsert([payload], { onConflict: 'sales_date,user_id' })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, message: 'Daily summary updated' })
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error updating daily summary')
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

const securedGET = withSecurity(GET, SecurityPresets.enhanced())

export { securedGET as GET, POST }
