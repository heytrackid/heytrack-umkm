import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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
      console.error('Auth error:', authError)
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
      console.error('Error fetching orders:', ordersError)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    // Get all recipes with ingredients and their current WAC
    const { data: recipes, error: recipesError } = await supabase
      .from('resep')
      .select(`
        id,
        nama,
        yield_pcs,
        resep_item (
          qty_per_batch,
          bahan:bahan_baku (
            id,
            nama_bahan,
            wac_harga,
            satuan
          )
        )
      `)
      .eq('user_id', user.id)

    if (recipesError) {
      console.error('Error fetching recipes:', recipesError)
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
      .eq('jenis', 'pengeluaran')
      .gte('tanggal', startDate)
      .lte('tanggal', endDate)

    if (expensesError) {
      console.error('Error fetching expenses:', expensesError)
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

  } catch (error: any) {
    console.error('Error generating profit report:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
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
  const profitByPeriod: Record<string, any> = {}
  const productProfitability: Record<string, any> = {}

  // Process each order
  orders.forEach(order => {
    const revenue = Number(order.total_amount)
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

        productProfitability[productKey].total_revenue += Number(item.total_price)
        productProfitability[productKey].total_cogs += itemCOGS
        productProfitability[productKey].total_quantity += item.quantity
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

    profitByPeriod[periodKey].revenue += revenue
    profitByPeriod[periodKey].cogs += orderCOGS
    profitByPeriod[periodKey].gross_profit = profitByPeriod[periodKey].revenue - profitByPeriod[periodKey].cogs
    profitByPeriod[periodKey].gross_margin = profitByPeriod[periodKey].revenue > 0
      ? (profitByPeriod[periodKey].gross_profit / profitByPeriod[periodKey].revenue) * 100
      : 0
    profitByPeriod[periodKey].orders_count++
  })

  // Calculate final product profitability metrics
  Object.values(productProfitability).forEach((product: any) => {
    product.gross_profit = product.total_revenue - product.total_cogs
    product.gross_margin = product.total_revenue > 0
      ? (product.gross_profit / product.total_revenue) * 100
      : 0
    product.avg_selling_price = product.total_quantity > 0
      ? product.total_revenue / product.total_quantity
      : 0
  })

  // Calculate operating expenses
  const totalOperatingExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)

  // Calculate operating expenses breakdown by category
  const operatingExpensesBreakdown: Record<string, any> = {}
  expenses.forEach(exp => {
    const category = exp.category || 'Other'
    if (!operatingExpensesBreakdown[category]) {
      operatingExpensesBreakdown[category] = {
        category: category,
        total: 0,
        count: 0,
        percentage: 0
      }
    }
    operatingExpensesBreakdown[category].total += Number(exp.amount)
    operatingExpensesBreakdown[category].count++
  })

  // Calculate percentages for operating expenses
  Object.values(operatingExpensesBreakdown).forEach((cat: any) => {
    cat.percentage = totalOperatingExpenses > 0
      ? (cat.total / totalOperatingExpenses) * 100
      : 0
  })

  // Calculate COGS breakdown by ingredient category
  const cogsBreakdown = calculateCOGSBreakdown(orders, recipeCostMap)

  // Calculate final metrics
  const grossProfit = totalRevenue - totalCOGS
  const netProfit = grossProfit - totalOperatingExpenses

  // Sort products by profitability
  const sortedProducts = Object.values(productProfitability).sort((a: any, b: any) =>
    b.gross_profit - a.gross_profit
  )

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
      b.total - a.total
    ),
    topProfitableProducts: sortedProducts.slice(0, 5),
    leastProfitableProducts: sortedProducts.slice(-5).reverse()
  }
}

// Helper: Calculate recipe COGS using WAC
function calculateRecipeCOGS(recipe: any): number {
  if (!recipe.recipe_ingredients || recipe.recipe_ingredients.length === 0) {
    return Number(recipe.cost_per_unit) || 0
  }

  let totalCost = 0
  recipe.recipe_ingredients.forEach((ri: any) => {
    if (ri.ingredient) {
      const wac = Number(ri.ingredient.weighted_average_cost) || 0
      const quantity = Number(ri.quantity) || 0
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
                wac: Number(ri.ingredient.weighted_average_cost) || 0,
                percentage: 0
              }
            }

            const quantity = Number(ri.quantity) * item.quantity
            const cost = quantity * (Number(ri.ingredient.weighted_average_cost) || 0)

            breakdown[ingredientName].total_cost += cost
            breakdown[ingredientName].total_quantity += quantity
          }
        })
      }
    })
  })

  // Calculate percentages
  const totalCOGS = Object.values(breakdown).reduce((sum: number, ing: any) => sum + ing.total_cost, 0)
  Object.values(breakdown).forEach((ing: any) => {
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
