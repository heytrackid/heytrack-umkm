export const runtime = 'nodejs'

import { createErrorResponse, createSuccessResponse } from '@/lib/api-core/responses'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { apiLogger } from '@/lib/logger'
import { calculateRecipeCOGS, toNumber, transformRecipeWithIngredients } from '@/lib/supabase/query-helpers'
import type {
    IngredientCost,
    OperatingExpense,
    OperatingExpenseBreakdownEntry,
    ProductProfit,
    ProductProfitabilityEntry,
    ProfitByPeriodEntry,
    ProfitData,
    ProfitTrends,
} from '@/types/features/profit-report'
import type { RecipeWithIngredients } from '@/types/query-results'
import { NextResponse } from 'next/server'
import { z } from 'zod'

type RawRecipeWithIngredients = Parameters<typeof transformRecipeWithIngredients>[0]

type AggregationPeriod = 'daily' | 'weekly' | 'monthly'

const periodNormalizationMap: Record<string, AggregationPeriod> = {
  daily: 'daily',
  day: 'daily',
  harian: 'daily',
  weekly: 'weekly',
  week: 'weekly',
  mingguan: 'weekly',
  monthly: 'monthly',
  month: 'monthly',
  bulanan: 'monthly',
  quarter: 'monthly',
  quarterly: 'monthly',
  year: 'monthly',
  yearly: 'monthly',
  custom: 'monthly'
}

const normalizeAggregationPeriod = (value?: string | null): AggregationPeriod => {
  if (!value) { return 'monthly' }
  const key = value.toLowerCase()
  return periodNormalizationMap[key] ?? 'monthly'
}

const parseDateOrToday = (value?: string | null): Date => {
  if (!value) { return new Date() }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

const startOfDayUTC = (date: Date): Date => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))

const startOfWeekUTC = (date: Date): Date => {
  const normalized = startOfDayUTC(date)
  const day = normalized.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  normalized.setUTCDate(normalized.getUTCDate() + diff)
  return normalized
}

const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string =>
  date.toLocaleDateString('id-ID', options)

interface PeriodBucketInfo {
  key: string
  label: string
  sortValue: number
}

const getPeriodBucketInfo = (date: Date, period: AggregationPeriod): PeriodBucketInfo => {
  if (period === 'daily') {
    const bucketDate = startOfDayUTC(date)
    return {
      key: bucketDate.toISOString().split('T')[0],
      label: formatDate(bucketDate, { day: '2-digit', month: 'short', year: 'numeric' }),
      sortValue: bucketDate.getTime()
    }
  }

  if (period === 'weekly') {
    const weekStart = startOfWeekUTC(date)
    const weekEnd = new Date(weekStart)
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6)
    return {
      key: weekStart.toISOString().split('T')[0],
      label: `${formatDate(weekStart, { day: '2-digit', month: 'short' })} - ${formatDate(weekEnd, { day: '2-digit', month: 'short', year: 'numeric' })}`,
      sortValue: weekStart.getTime()
    }
  }

  const monthStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
  return {
    key: `${monthStart.getUTCFullYear()}-${String(monthStart.getUTCMonth() + 1).padStart(2, '0')}`,
    label: formatDate(monthStart, { month: 'long', year: 'numeric' }),
    sortValue: monthStart.getTime()
  }
}

const ProfitReportQuerySchema = z.object({
  period: z.string().optional(),
  include_breakdown: z.enum(['true', 'false']).optional(),
})

// GET /api/reports/profit - Generate profit report with WAC calculations
async function getProfitReportHandler(
  context: RouteContext,
  query?: z.infer<typeof ProfitReportQuerySchema>
): Promise<NextResponse> {
  const { user, supabase } = context

  const aggregationPeriod = normalizeAggregationPeriod(query?.period)
  const summaryPeriodType = query?.period ?? aggregationPeriod

  try {
    // Get all DELIVERED orders with items
    const { data: orders, error: ordersError } = await supabase
      .from('orders' as never)
      .select(`
        *,
        order_items (
          *,
          recipe_id,
          product_name,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'DELIVERED')
      .order('delivery_date', { ascending: true })

    if (ordersError) {
      apiLogger.error({ error: ordersError }, 'Error fetching orders')
      return createErrorResponse('Failed to fetch orders', 500)
    }

    // Get all recipes with ingredients and their current WAC
    const { data: recipesRaw, error: recipesError } = await supabase
      .from('recipes' as never)
      .select(`
        *,
        recipe_ingredients (
          *,
          ingredients (*)
        )
      `)
      .eq('user_id', user.id)

    if (recipesError) {
      apiLogger.error({ error: recipesError }, 'Error fetching recipes')
      return createErrorResponse('Failed to fetch recipes data', 500)
    }

    // Transform recipes - handle Supabase join structure
    const recipes: RecipeWithIngredients[] = Array.isArray(recipesRaw)
      ? (recipesRaw as RawRecipeWithIngredients[]).map((recipe) => transformRecipeWithIngredients(recipe))
      : []

    // Get all expenses from financial_records
    const { data: expenses, error: expensesError } = await supabase
      .from('financial_records' as never)
      .select('id, user_id, type, amount, date, description, category')
      .eq('user_id', user.id)
      .eq('type', 'EXPENSE')

    if (expensesError) {
      apiLogger.error({ error: expensesError }, 'Error fetching expenses')
      return createErrorResponse('Failed to fetch expenses', 500)
    }

    // Calculate total revenue
    type OrderWithItems = {
      delivery_date?: string | null
      created_at?: string | null
      total_amount: number | null
      order_items?: Array<{ recipe_id: string | null; quantity: number; product_name: string | null; unit_price: number | null; total_price: number | null }> | null
    }
    const ordersWithItems = (orders || []) as OrderWithItems[]
    const totalRevenue = ordersWithItems.reduce((sum, order) => sum + toNumber(order.total_amount), 0)
    const ordersCount = ordersWithItems.length

    // Calculate products breakdown and total COGS
    const productMap = new Map<string, { quantity: number; revenue: number; cogs: number }>()
    const periodStatsMap = new Map<string, { revenue: number; cogs: number; orders: number; label: string; sortValue: number }>()
    let totalCOGS = 0

    ordersWithItems.forEach((order) => {
      let orderCOGSTotal = 0
      const orderItems = order.order_items ?? []

      orderItems.forEach((item) => {
        if (!item.recipe_id) return
        const recipe = recipes.find(r => r.id === item.recipe_id)
        if (!recipe) return

        try {
          const recipeCOGS = calculateRecipeCOGS(recipe)
          const itemCOGS = recipeCOGS * item.quantity
          totalCOGS += itemCOGS
          orderCOGSTotal += itemCOGS

          const productName = item.product_name || recipe.name || 'Unknown Product'
          const existing = productMap.get(productName) || { quantity: 0, revenue: 0, cogs: 0 }
          productMap.set(productName, {
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + toNumber(item.total_price),
            cogs: existing.cogs + itemCOGS
          })
        } catch (error) {
          apiLogger.error({ error, recipeId: item.recipe_id }, 'Failed to calculate recipe COGS for product breakdown')
          // Continue processing other items
        }
      })

      const orderRevenue = toNumber(order.total_amount)
      const orderDate = parseDateOrToday(order.delivery_date ?? order.created_at)
      const bucket = getPeriodBucketInfo(orderDate, aggregationPeriod)
      const existing = periodStatsMap.get(bucket.key) || { revenue: 0, cogs: 0, orders: 0, label: bucket.label, sortValue: bucket.sortValue }
      periodStatsMap.set(bucket.key, {
        revenue: existing.revenue + orderRevenue,
        cogs: existing.cogs + orderCOGSTotal,
        orders: existing.orders + 1,
        label: bucket.label,
        sortValue: existing.sortValue
      })
    })

    // Convert product map to array
    const products: ProductProfit[] = Array.from(productMap.entries()).map(([product_name, data]) => ({
      product_name,
      quantity_sold: data.quantity,
      revenue: data.revenue,
      cogs: data.cogs,
      profit: data.revenue - data.cogs,
      profit_margin: data.revenue > 0 ? ((data.revenue - data.cogs) / data.revenue) * 100 : 0
    }))

    const profitByPeriod: ProfitByPeriodEntry[] = Array.from(periodStatsMap.values())
      .sort((a, b) => a.sortValue - b.sortValue)
      .map((stats) => {
        const grossProfitValue = stats.revenue - stats.cogs
        return {
          period: stats.label,
          revenue: stats.revenue,
          cogs: stats.cogs,
          gross_profit: grossProfitValue,
          gross_margin: stats.revenue > 0 ? (grossProfitValue / stats.revenue) * 100 : 0,
          orders_count: stats.orders
        }
      })

    const productProfitability: ProductProfitabilityEntry[] = products.map((product) => ({
      product_name: product.product_name,
      total_revenue: product.revenue,
      total_cogs: product.cogs,
      gross_profit: product.profit,
      gross_margin: product.profit_margin,
      total_quantity: product.quantity_sold
    }))

    const topProfitableProducts: ProductProfitabilityEntry[] = [...productProfitability]
      .sort((a, b) => b.gross_profit - a.gross_profit)
      .slice(0, 5)

    const leastProfitableProducts: ProductProfitabilityEntry[] = [...productProfitability]
      .sort((a, b) => a.gross_profit - b.gross_profit)
      .slice(0, 5)

    // Calculate ingredients breakdown
    const ingredientMap = new Map<string, { quantity: number; wac_cost: number; total_cost: number }>()
    ordersWithItems.forEach((order) => {
      (order.order_items || []).forEach((item) => {
        if (!item.recipe_id) return
        const recipe = recipes.find(r => r.id === item.recipe_id)
        if (!recipe || !recipe.recipe_ingredients) return

        recipe.recipe_ingredients.forEach((ri) => {
          try {
            if (ri.ingredient && typeof ri.ingredient === 'object') {
              const ingredient = ri.ingredient as { name?: string; weighted_average_cost?: number | null }
              const ingredientName = ingredient.name || 'Unknown Ingredient'
              const quantity = (ri.quantity || 0) * item.quantity
              const wac = ingredient.weighted_average_cost || 0
              const totalCost = wac * quantity

              const existing = ingredientMap.get(ingredientName) || { quantity: 0, wac_cost: 0, total_cost: 0 }
              ingredientMap.set(ingredientName, {
                quantity: existing.quantity + quantity,
                wac_cost: wac,
                total_cost: existing.total_cost + totalCost
              })
            }
          } catch (error) {
            apiLogger.error({ error, recipeId: item.recipe_id }, 'Failed to process ingredient for breakdown')
            // Continue processing other ingredients
          }
        })
      })
    })

    const ingredients: IngredientCost[] = Array.from(ingredientMap.entries()).map(([ingredient_name, data]) => ({
      ingredient_name,
      quantity_used: data.quantity,
      wac_cost: data.wac_cost,
      total_cost: data.total_cost
    }))

    // Calculate operating expenses breakdown
    const expenseMap = new Map<string, number>()
    const expensesData = (expenses || []) as Array<{ amount: number | null; category: string | null }>
    expensesData.forEach((expense) => {
      const category = expense.category || 'Uncategorized'
      const amount = toNumber(expense.amount)
      expenseMap.set(category, (expenseMap.get(category) || 0) + amount)
    })

    const operating_expenses: OperatingExpense[] = Array.from(expenseMap.entries()).map(([category, total_amount]) => ({
      category,
      total_amount
    }))

    const operationalExpenses = operating_expenses.reduce((sum, exp) => sum + exp.total_amount, 0)
    const operatingExpensesBreakdown: OperatingExpenseBreakdownEntry[] = operating_expenses.map((expense) => ({
      category: expense.category,
      total: expense.total_amount,
      percentage: operationalExpenses > 0 ? (expense.total_amount / operationalExpenses) * 100 : 0
    }))

    // Calculate profit metrics
    const grossProfit = totalRevenue - totalCOGS
    const netProfit = grossProfit - operationalExpenses
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
    const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // Since date filtering is removed, no trend calculation
    const trends: ProfitTrends = {
      revenue_trend: 0,
      profit_trend: 0
    }

    const profitReport: ProfitData = {
      summary: {
        period: {
          start: '',
          end: '',
          type: summaryPeriodType
        },
        total_revenue: totalRevenue,
        total_cogs: totalCOGS,
        gross_profit: grossProfit,
        gross_profit_margin: Number(grossProfitMargin.toFixed(2)),
        total_operating_expenses: operationalExpenses,
        net_profit: netProfit,
        net_profit_margin: Number(netProfitMargin.toFixed(2)),
        orders_count: ordersCount
      },
      profit_by_period: profitByPeriod,
      product_profitability: productProfitability,
      top_profitable_products: topProfitableProducts,
      least_profitable_products: leastProfitableProducts,
      operating_expenses_breakdown: operatingExpensesBreakdown,
      products,
      ingredients,
      operating_expenses,
      trends
    }

    apiLogger.info({ userId: user.id }, 'Profit report generated')
    return createSuccessResponse(profitReport)
  } catch (error) {
    apiLogger.error({ error, userId: user.id }, 'Profit report error')
    return createErrorResponse('Failed to generate profit report', 500)
  }
}

export const GET = createApiRoute(
  { method: 'GET', path: '/api/reports/profit', querySchema: ProfitReportQuerySchema },
  getProfitReportHandler
)
