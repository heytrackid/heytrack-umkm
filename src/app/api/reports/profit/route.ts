import { createClient } from '@/utils/supabase/server'
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { DateRangeQuerySchema } from '@/lib/validations/api-validations'
import type { Database } from '@/types'

import { apiLogger } from '@/lib/logger'
/**
 * GET /api/reports/profit
 * 
 * Generate Real Profit Report using WAC-based COGS calculation
 * 
 * Query Parameters:
 * - start_date: Start date (YYYY-MM-DD)
 * - end_date: End date (YYYY-MM-DD)
 * - period: 'daily' | 'weekly' | 'monthly' | 'yearly'
 * - include_breakdown: 'true' | 'false' (include detailed product breakdown)
 */
export async function GET(request: NextRequest) {
  try {
    // Create authenticated Supabase client
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error:')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const startDate = searchParams.get('start_date') || new Date(new Date().setDate(1)).toISOString().split('T')[0]
    const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0]
    const period = searchParams.get('period') || 'monthly'
    const includeBreakdown = searchParams.get('include_breakdown') === 'true'

    // Get all DELIVERED orders with items in date range
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
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
      .gte('delivery_date', startDate)
      .lte('delivery_date', endDate)
      .order('delivery_date', { ascending: true })

    if (ordersError) {
      apiLogger.error({ error: ordersError }, 'Error fetching orders:')
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    // Get all recipes with ingredients and their current WAC
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select(`
        id,
        name,
        yield_pcs,
        recipe_ingredients (
          qty_per_batch,
          ingredient:ingredients (
            id,
            name,
            weighted_average_cost,
            unit
          )
        )
      `)
      .eq('user_id', user.id)

    if (recipesError) {
      apiLogger.error({ error: recipesError }, 'Error fetching recipes:')
      return NextResponse.json(
        { error: 'Failed to fetch recipes data' },
        { status: 500 }
      )
    }

    // Get all expenses (non-revenue) in the period for operating costs
    const { data: expenses, error: expensesError } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)

    if (expensesError) {
      apiLogger.error({ error: expensesError }, 'Error fetching expenses:')
    }

    // Calculate profit metrics
    const profitData = await calculateProfitMetrics(
      orders || [],
      recipes || [],
      expenses || [],
      period,
      includeBreakdown
    )

    // Build response
    const response = {
      summary: {
        period: {
          start: startDate,
          end: endDate,
          type: period
        },
        total_revenue: profitData.totalRevenue,
        total_cogs: profitData.totalCOGS,
        gross_profit: profitData.grossProfit,
        gross_profit_margin: profitData.grossProfitMargin,
        total_operating_expenses: profitData.totalOperatingExpenses,
        net_profit: profitData.netProfit,
        net_profit_margin: profitData.netProfitMargin,
        orders_count: orders?.length || 0
      },
      profit_by_period: profitData.profitByPeriod,
      product_profitability: profitData.productProfitability,
      cogs_breakdown: profitData.cogsBreakdown,
      operating_expenses_breakdown: profitData.operatingExpensesBreakdown,
      top_profitable_products: profitData.topProfitableProducts,
      least_profitable_products: profitData.leastProfitableProducts,
      generated_at: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error: unknown) {
    apiLogger.error({ error: error }, 'Error generating profit report:')
    return NextResponse.json(
      { error: 'Internal server error', details: (error as any).message },
      { status: 500 }
    )
  }
}

// Main calculation function
async function calculateProfitMetrics(
  orders: any[],
  recipes: any[],
  expenses: any[],
  period: string,
  includeBreakdown: boolean
) {
  // Build recipe cost lookup map
  const recipeCostMap = new Map()
  recipes.forEach(recipe => {
    const cogs = calculateRecipeCOGS(recipe)
    recipeCostMap.set(recipe.id, {
      name: recipe.name,
      cogs: cogs,
      ingredients: recipe.recipe_ingredients || []
    })
  })

  let totalRevenue = 0
  let totalCOGS = 0
  const profitByPeriod: Record<string, unknown> = {}
  const productProfitability: Record<string, unknown> = {}

  // Process each order
  orders.forEach(order => {
    const revenue = +(order.total_amount || 0)
    totalRevenue += revenue

    // Calculate COGS for this order using WAC
    let orderCOGS = 0
    order.order_items?.forEach((item: any) => {
      const recipeData = recipeCostMap.get(item.recipe_id)
      if (recipeData) {
        const itemCOGS = recipeData.cogs * item.quantity
        orderCOGS += itemCOGS

        // Track product profitability
        const productKey = item.product_name || recipeData.name
        if (!productProfitability[productKey]) {
          productProfitability[productKey] = {
            product_name: productKey,
            recipe_id: item.recipe_id,
            total_revenue: 0,
            total_cogs: 0,
            total_quantity: 0,
            gross_profit: 0,
            gross_margin: 0,
            avg_selling_price: 0,
            avg_cost_per_unit: recipeData.cogs
          }
        }

        const profItem = productProfitability[productKey] as any
        profItem.total_revenue += +(item.total_price || 0)
        profItem.total_cogs += itemCOGS
        profItem.total_quantity += +(item.quantity || 0)
      }
    })

    totalCOGS += orderCOGS

    // Group by period
    const periodKey = getPeriodKey(order.delivery_date || order.order_date, period)
    if (!profitByPeriod[periodKey]) {
      profitByPeriod[periodKey] = {
        period: periodKey,
        revenue: 0,
        cogs: 0,
        gross_profit: 0,
        gross_margin: 0,
        orders_count: 0
      }
    }

    const periodData = profitByPeriod[periodKey] as any
    periodData.revenue += revenue
    periodData.cogs += orderCOGS
    periodData.gross_profit = periodData.revenue - periodData.cogs
    periodData.gross_margin = periodData.revenue > 0
      ? (periodData.gross_profit / periodData.revenue) * 100
      : 0
    periodData.orders_count++
  })

  // Calculate final product profitability metrics
  Object.values(productProfitability).forEach((product: any) => {
    const prod = product as any
    prod.gross_profit = prod.total_revenue - prod.total_cogs
    prod.gross_margin = prod.total_revenue > 0
      ? (prod.gross_profit / prod.total_revenue) * 100
      : 0
    prod.avg_selling_price = prod.total_quantity > 0
      ? prod.total_revenue / prod.total_quantity
      : 0
  })

  // Calculate operating expenses
  const totalOperatingExpenses = expenses.reduce((sum: number, exp: { amount: number | string }) => sum + Number(exp.amount || 0), 0)

  // Calculate operating expenses breakdown by category
  const operatingExpensesBreakdown: Record<string, unknown> = {}
  expenses.forEach((exp: { amount: number | string; category: string }) => {
    const category = exp.category || 'Other'
    if (!operatingExpensesBreakdown[category]) {
      operatingExpensesBreakdown[category] = {
        category: category,
        total: 0,
        count: 0,
        percentage: 0
      }
    }
    const currentTotal = (operatingExpensesBreakdown[category] as any).total || 0
    ;(operatingExpensesBreakdown[category] as any).total = currentTotal + Number(exp.amount || 0)
    (operatingExpensesBreakdown[category] as any).count++
  })

  // Calculate percentages for operating expenses
  Object.values(operatingExpensesBreakdown).forEach((cat: any) => {
    const catTotal = Number(cat.total || 0)
    cat.percentage = totalOperatingExpenses > 0
      ? (catTotal / totalOperatingExpenses) * 100
      : 0
  })

  // Calculate COGS breakdown by ingredient category
  const cogsBreakdown = calculateCOGSBreakdown(orders, recipeCostMap)

  // Calculate final metrics
  const grossProfit = totalRevenue - totalCOGS
  const netProfit = grossProfit - totalOperatingExpenses

  // Sort products by profitability
  const sortedProducts = Object.values(productProfitability).sort((a: any, b: any) => {
    const bProfit = +(b.gross_profit || 0)
    const aProfit = +(a.gross_profit || 0)
    return bProfit - aProfit
  })

  return {
    totalRevenue,
    totalCOGS,
    grossProfit,
    grossProfitMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
    totalOperatingExpenses,
    netProfit,
    netProfitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
    profitByPeriod: Object.values(profitByPeriod).sort((a: any, b: any) =>
      a.period.localeCompare(b.period)
    ),
    productProfitability: sortedProducts,
    cogsBreakdown: Object.values(cogsBreakdown),
    operatingExpensesBreakdown: Object.values(operatingExpensesBreakdown).sort((a: any, b: any) =>
      (b as any).total - (a as any).total
    ),
    topProfitableProducts: sortedProducts.slice(0, 5),
    leastProfitableProducts: sortedProducts.slice(-5).reverse()
  }
}

// Helper: Calculate recipe COGS using WAC
function calculateRecipeCOGS(recipe: any): number {
  if (!recipe.recipe_ingredients || recipe.recipe_ingredients.length === 0) {
    return +(recipe.cost_per_unit || 0)
  }

  let totalCost = 0
  recipe.recipe_ingredients.forEach((ri: any) => {
    if (ri.ingredient) {
      const wac = +(ri.ingredient.weighted_average_cost || 0)
      const quantity = +(ri.quantity || 0)
      totalCost += wac * quantity
    }
  })

  return totalCost
}

// Helper: Calculate COGS breakdown by ingredient
function calculateCOGSBreakdown(orders: any[], recipeCostMap: Map<string, any>) {
  const breakdown: Record<string, any> = {}

  orders.forEach(order => {
    order.order_items?.forEach((item: any) => {
      const recipeData = recipeCostMap.get(item.recipe_id)
      if (recipeData && recipeData.ingredients) {
        recipeData.ingredients.forEach((ri: any) => {
          if (ri.ingredient) {
            const ingredientName = ri.ingredient.name
            if (!breakdown[ingredientName]) {
              breakdown[ingredientName] = {
                ingredient_name: ingredientName,
                total_cost: 0,
                total_quantity: 0,
                wac: +(ri.ingredient.weighted_average_cost || 0),
                percentage: 0
              }
            }

            const quantity = +(ri.quantity || 0) * +(item.quantity || 0)
            const cost = quantity * (+(ri.ingredient.weighted_average_cost || 0))

            const breakdownItem = breakdown[ingredientName]
            breakdownItem.total_cost = +(breakdownItem.total_cost || 0) + cost
            breakdownItem.total_quantity = +(breakdownItem.total_quantity || 0) + quantity
          }
        })
      }
    })
  })

  // Calculate percentages
  const totalCOGS = Object.values(breakdown).reduce((sum: number, ing: any) => sum + Number(ing.total_cost || 0), 0)
  Object.values(breakdown).forEach((ing: any) => {
    const ingCost = Number(ing.total_cost || 0)
    ing.percentage = totalCOGS > 0 ? (ingCost / totalCOGS) * 100 : 0
  })

  return breakdown
}

// Helper: Get period key for grouping
function getPeriodKey(date: string, period: string): string {
  const d = new Date(date)

  switch (period) {
    case 'daily':
      return date
    case 'weekly':
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())
      return weekStart.toISOString().split('T')[0]
    case 'monthly':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    case 'yearly':
      return `${d.getFullYear()}`
    default:
      return date
  }
}
