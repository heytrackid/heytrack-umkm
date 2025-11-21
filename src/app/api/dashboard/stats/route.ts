export const runtime = 'nodejs'

import { createErrorResponse, createSuccessResponse } from '@/lib/api-core/responses'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { apiLogger } from '@/lib/logger'
import type { Database, OrderStatus } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { z } from 'zod'

type TypedSupabaseClient = SupabaseClient<Database>

const DashboardQuerySchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

interface DateFilters {
  startDate?: string
  endDate?: string
  comparisonStartDate?: string
  comparisonEndDate?: string
  today: string
  yesterday: string
}

const normalizeDate = (value: string | null): string | undefined => {
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

const buildDateFilters = (startParam?: string, endParam?: string): DateFilters => {
  const comparisonRange = calculateComparisonRange(startParam, endParam)
  const today = new Date().toISOString().split('T')[0] ?? ''
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? ''
  return { today, yesterday, startDate: startParam, endDate: endParam, ...comparisonRange }
}

// GET /api/dashboard/stats - Aggregate dashboard statistics
async function getDashboardStatsHandler(
  context: RouteContext,
  query?: z.infer<typeof DashboardQuerySchema>
): Promise<NextResponse> {
  const { user, supabase } = context
  const startParam = normalizeDate(query?.start_date ?? null)
  const endParam = normalizeDate(query?.end_date ?? null)
  const filters = buildDateFilters(startParam, endParam)

  try {
    const typedSupabase = supabase as TypedSupabaseClient

    // Build queries
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

    // Fetch all data in parallel
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

    // Check for errors
    if (ordersResult.error) throw new Error(`Orders query failed: ${ordersResult.error.message}`)
    if (currentPeriodResult.error) throw new Error(`Current period query failed: ${currentPeriodResult.error.message}`)
    if (comparisonResult.error) throw new Error(`Comparison query failed: ${comparisonResult.error.message}`)
    if (customersResult.error) throw new Error(`Customers query failed: ${customersResult.error.message}`)
    if (ingredientsResult.error) throw new Error(`Ingredients query failed: ${ingredientsResult.error.message}`)
    if (recipesResult.error) throw new Error(`Recipes query failed: ${recipesResult.error.message}`)
    if (expensesResult.error) throw new Error(`Expenses query failed: ${expensesResult.error.message}`)
    if (recipeIngredientsResult.error) throw new Error(`Recipe ingredients query failed: ${recipeIngredientsResult.error.message}`)

    const orders = ordersResult.data || []
    const currentPeriodOrders = currentPeriodResult.data || []
    const comparisonOrders = comparisonResult.data || []
    const customers = customersResult.data || []
    const ingredients = ingredientsResult.data || []
    const recipes = recipesResult.data || []
    const expenses = expensesResult.data || []
    const recipeIngredients = recipeIngredientsResult.data || []

    // Calculate average HPP from recipe costs
    type RecipeIngredient = { quantity: number; ingredients: { price_per_unit: number } | null }
    const recipeCosts = recipeIngredients.map((ri: RecipeIngredient) => {
      const ingredient = ri.ingredients
      if (!ingredient) return 0
      return (ri.quantity || 0) * (ingredient.price_per_unit || 0)
    })
    const averageHpp = recipeCosts.length > 0 
      ? recipeCosts.reduce((sum, cost) => sum + cost, 0) / recipeCosts.length 
      : 0

    // Calculate stats
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const currentPeriodRevenue = currentPeriodOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const comparisonRevenue = comparisonOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const activeOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'IN_PROGRESS').length
    const vipCustomers = customers.filter(c => c.customer_type === 'VIP').length
    const lowStockItems = ingredients.filter(i => (i.current_stock || 0) <= (i.min_stock || 0)).length
    const expensesTotal = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

    // Calculate growth
    const revenueChange = currentPeriodRevenue - comparisonRevenue
    const growthPercent = comparisonRevenue > 0 ? ((revenueChange / comparisonRevenue) * 100).toFixed(1) : '0.0'
    const trend: 'up' | 'down' = revenueChange >= 0 ? 'up' : 'down'

    // Build response
    const response = {
      revenue: {
        today: currentPeriodRevenue,
        total: totalRevenue,
        growth: `${growthPercent}%`,
        trend
      },
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
      customers: {
        total: customers.length,
        vip: vipCustomers,
        regular: customers.length - vipCustomers
      },
      inventory: {
        total: ingredients.length,
        lowStock: lowStockItems,
        lowStockAlerts: ingredients
          .filter(i => (i.current_stock || 0) <= (i.reorder_point || i.min_stock || 0))
          .slice(0, 5)
          .map(i => ({
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
      recipes: {
        total: recipes.length,
        popular: recipes.sort((a, b) => (b.times_made || 0) - (a.times_made || 0)).slice(0, 5)
      },
      hpp: {
        average: averageHpp,
        total: recipeCosts.reduce((sum, cost) => sum + cost, 0)
      },
      expenses: {
        today: expensesTotal,
        total: expensesTotal,
        netProfit: currentPeriodRevenue - expensesTotal
      },
      alerts: {
        lowStock: lowStockItems,
        highExpenses: expensesTotal > currentPeriodRevenue ? 1 : 0
      },
      lastUpdated: new Date().toISOString()
    }

    apiLogger.info({ userId: user.id }, 'Dashboard stats fetched')
    return createSuccessResponse(response)
  } catch (error) {
    apiLogger.error({ error, userId: user.id }, 'Dashboard stats error')
    return createErrorResponse('Failed to fetch dashboard stats', 500)
  }
}

export const GET = createApiRoute(
  { method: 'GET', path: '/api/dashboard/stats', querySchema: DashboardQuerySchema },
  getDashboardStatsHandler
)
