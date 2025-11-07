// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


/* eslint-disable */
import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import type { Row } from '@/types/database'
import { apiLogger } from '@/lib/logger'
 import { calculateRecipeCOGS, toNumber } from '@/lib/supabase/query-helpers'
 import type { RecipeWithIngredients } from '@/types/query-results'
 import { withSecurity, SecurityPresets } from '@/utils/security'



type Order = Row<'orders'>
type OrderItem = Row<'order_items'>
type FinancialRecord = Row<'financial_records'>
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
async function getHandler(request: NextRequest) {
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
    // const includeBreakdown = searchParams.get('include_breakdown') === 'true'

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
      .eq('user_id', user['id'])
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
    const { data: recipesRaw, error: recipesError } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          *,
          ingredient:ingredients (*)
        )
      `)
      .eq('user_id', user['id'])

    if (recipesError) {
      apiLogger.error({ error: recipesError }, 'Error fetching recipes:')
      return NextResponse.json(
        { error: 'Failed to fetch recipes data' },
        { status: 500 }
      )
    }

    // Transform recipes - handle Supabase join structure
    // Supabase returns ingredient as array, we need to extract first element
    const recipes: RecipeWithIngredients[] = Array.isArray(recipesRaw) 
      ? recipesRaw.map((recipe) => ({
          ...recipe,
          recipe_ingredients: Array.isArray(recipe.recipe_ingredients)
            ? recipe.recipe_ingredients.map((ri) => ({
                ...ri,
                ingredient: Array.isArray(ri.ingredient) ? ri.ingredient[0]! : ri.ingredient
              }))
            : []
        })) as RecipeWithIngredients[]
      : []

    // Get all expenses (non-revenue) in the period for operating costs
    const { data: expenses, error: expensesError } = await supabase
      .from('financial_records')
      .select('id, user_id, date, description, category, amount, reference, type, created_at, created_by')
      .eq('user_id', user['id'])
      .eq('type', 'EXPENSE')
      .gte('date', startDate)
      .lte('date', endDate)

    if (expensesError) {
      apiLogger.error({ error: expensesError }, 'Error fetching expenses:')
    }

    // Calculate profit metrics
    const profitData = await calculateProfitMetrics(
      orders ?? [],
      recipes,
      expenses ?? [],
      period
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
    apiLogger.error({ error }, 'Error generating profit report:')
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export const GET = withSecurity(getHandler, SecurityPresets.enhanced())

// Typed interfaces for profit calculation
interface OrderWithItemsForProfit extends Order {
  order_items?: OrderItem[]
}

interface RecipeCostData {
  name: string
  cogs: number
}

interface ProductProfitability {
  product_name: string
  recipe_id: string
  total_revenue: number
  total_cogs: number
  total_quantity: number
  gross_profit: number
  gross_margin: number
  avg_selling_price: number
  avg_cost_per_unit: number
}

interface PeriodProfit {
  period: string
  revenue: number
  cogs: number
  gross_profit: number
  gross_margin: number
  orders_count: number
}

interface COGSBreakdown {
  ingredient_name: string
  total_cost: number
  total_quantity: number
  wac: number
  percentage: number
}

interface OperatingExpenseBreakdown {
  category: string
  total: number
  count: number
  percentage: number
}

// Main calculation function
async function calculateProfitMetrics(
  orders: OrderWithItemsForProfit[],
  recipes: RecipeWithIngredients[],
  expenses: FinancialRecord[],
  period: string
) {
  // Build recipe cost lookup map
  const recipeCostMap = new Map<string, RecipeCostData>()
  
  recipes.forEach(recipe => {
    const cogs = calculateRecipeCOGS(recipe)
    recipeCostMap.set(recipe['id'], {
      name: recipe.name,
      cogs
    })
  })

  let totalRevenue = 0
  let totalCOGS = 0
  const profitByPeriod: Record<string, PeriodProfit> = {}
  const productProfitability: Record<string, ProductProfitability> = {}

  // Process each order
  orders.forEach(order => {
    const revenue = toNumber(order.total_amount)
    totalRevenue += revenue

    // Calculate COGS for this order using WAC
    let orderCOGS = 0
    
    if (order.order_items) {
      for (const item of order.order_items) {
        const recipeData = recipeCostMap.get(item.recipe_id)
        if (recipeData) {
          const itemQuantity = toNumber(item.quantity)
          const itemCOGS = recipeData.cogs * itemQuantity
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

          const profItem = productProfitability[productKey]
          profItem.total_revenue += toNumber(item.total_price)
          profItem.total_cogs += itemCOGS
          profItem.total_quantity += itemQuantity
        }
      }
    }

    totalCOGS += orderCOGS

    // Group by period
    const orderDate = (order.delivery_date || order.order_date) || new Date().toISOString()
    const periodKey = getPeriodKey(orderDate, period)
    
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

    const periodData = profitByPeriod[periodKey]
    periodData.revenue += revenue
    periodData.cogs += orderCOGS
    periodData.gross_profit = periodData.revenue - periodData.cogs
    periodData.gross_margin = periodData.revenue > 0
      ? (periodData.gross_profit / periodData.revenue) * 100
      : 0
    periodData.orders_count++
  })

  // Calculate final product profitability metrics
  Object.values(productProfitability).forEach((product) => {
    product.gross_profit = product.total_revenue - product.total_cogs
    product.gross_margin = product.total_revenue > 0
      ? (product.gross_profit / product.total_revenue) * 100
      : 0
    product.avg_selling_price = product.total_quantity > 0
      ? product.total_revenue / product.total_quantity
      : 0
  })

  // Calculate operating expenses
  const totalOperatingExpenses = expenses.reduce(
    (sum, exp) => sum + toNumber(exp.amount),
    0
  )

  // Calculate operating expenses breakdown by category
  const operatingExpensesBreakdown: Record<string, OperatingExpenseBreakdown> = {}
  
  expenses.forEach((exp) => {
    const category = exp.category || 'Other'
    if (!operatingExpensesBreakdown[category]) {
      operatingExpensesBreakdown[category] = {
        category,
        total: 0,
        count: 0,
        percentage: 0
      }
    }
    
    operatingExpensesBreakdown[category].total += toNumber(exp.amount)
    operatingExpensesBreakdown[category].count++
  })

  // Calculate percentages for operating expenses
  Object.values(operatingExpensesBreakdown).forEach((cat) => {
    cat.percentage = totalOperatingExpenses > 0 
      ? (cat.total / totalOperatingExpenses) * 100 
      : 0
  })

  // Calculate COGS breakdown by ingredient
  const cogsBreakdown = calculateCOGSBreakdown(orders, recipes)

  // Calculate final metrics
  const grossProfit = totalRevenue - totalCOGS
  const netProfit = grossProfit - totalOperatingExpenses

  // Sort products by profitability
  const sortedProducts = Object.values(productProfitability).sort(
    (a, b) => b.gross_profit - a.gross_profit
  )

  return {
    totalRevenue,
    totalCOGS,
    grossProfit,
    grossProfitMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
    totalOperatingExpenses,
    netProfit,
    netProfitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
    profitByPeriod: Object.values(profitByPeriod).sort((a, b) =>
      a.period.localeCompare(b.period)
    ),
    productProfitability: sortedProducts,
    cogsBreakdown: Object.values(cogsBreakdown),
    operatingExpensesBreakdown: Object.values(operatingExpensesBreakdown).sort(
      (a, b) => b.total - a.total
    ),
    topProfitableProducts: sortedProducts.slice(0, 5),
    leastProfitableProducts: sortedProducts.slice(-5).reverse()
  }
}

// Helper: Calculate COGS breakdown by ingredient
function calculateCOGSBreakdown(
  orders: OrderWithItemsForProfit[],
  recipes: RecipeWithIngredients[]
): Record<string, COGSBreakdown> {
  const breakdown: Record<string, COGSBreakdown> = {}
  
  // Create recipe lookup map
  const recipeMap = new Map<string, RecipeWithIngredients>()
  recipes.forEach(recipe => recipeMap.set(recipe['id'], recipe))

  orders.forEach(order => {
    if (!order.order_items) {return}
    
    for (const item of order.order_items) {
      const recipe = recipeMap.get(item.recipe_id)
      if (!recipe?.recipe_ingredients) {continue}
      
      for (const ri of recipe.recipe_ingredients) {
        const {ingredient} = ri
        if (!ingredient) {continue}
        
        const ingredientName = ingredient.name
        if (!breakdown[ingredientName]) {
          breakdown[ingredientName] = {
            ingredient_name: ingredientName,
            total_cost: 0,
            total_quantity: 0,
            wac: toNumber(ingredient.weighted_average_cost),
            percentage: 0
          }
        }

        const quantity = toNumber(ri.quantity) * toNumber(item.quantity)
        const cost = quantity * toNumber(ingredient.weighted_average_cost)

        breakdown[ingredientName].total_cost += cost
        breakdown[ingredientName].total_quantity += quantity
      }
    }
  })

  // Calculate percentages
  const totalCOGS = Object.values(breakdown).reduce(
    (sum, ing) => sum + ing.total_cost,
    0
  )
  
  Object.values(breakdown).forEach((ing) => {
    ing.percentage = totalCOGS > 0 ? (ing.total_cost / totalCOGS) * 100 : 0
  })

  return breakdown
}

// Helper: Get period key for grouping
function getPeriodKey(date: string, period: string): string {
  const d = new Date(date)

  switch (period) {
    case 'daily':
      return date
    case 'weekly': {
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())
      return weekStart.toISOString().split('T')[0]!
    }
    case 'monthly':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    case 'yearly':
      return String(d.getFullYear())
    default:
      return date
  }
}
