export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { apiLogger } from '@/lib/logger'
import { calculateRecipeCOGS, toNumber } from '@/lib/supabase/query-helpers'
import type { RecipeWithIngredients } from '@/types/query-results'
import type { ProfitData, ProductProfit, IngredientCost, OperatingExpense, ProfitTrends } from '@/app/profit/constants'
import { NextResponse } from 'next/server'

const ProfitReportQuerySchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional().default('monthly'),
  include_breakdown: z.enum(['true', 'false']).optional(),
})

// GET /api/reports/profit - Generate profit report with WAC calculations
async function getProfitReportHandler(
  context: RouteContext,
  query?: z.infer<typeof ProfitReportQuerySchema>
): Promise<NextResponse> {
  const { user, supabase } = context

  const startDate = query?.start_date || new Date(new Date().setDate(1)).toISOString().split('T')[0]
  const endDate = query?.end_date || new Date().toISOString().split('T')[0]
  // const period = query?.period || 'monthly'

  try {
    // Get all DELIVERED orders with items in date range
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
      .gte('delivery_date', startDate)
      .lte('delivery_date', endDate)
      .order('delivery_date', { ascending: true })

    if (ordersError) {
      apiLogger.error({ error: ordersError }, 'Error fetching orders')
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
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
      return NextResponse.json({ error: 'Failed to fetch recipes data' }, { status: 500 })
    }

    // Transform recipes - handle Supabase join structure
    const recipes: RecipeWithIngredients[] = Array.isArray(recipesRaw)
      ? recipesRaw.map((recipe) => {
          const typedRecipe = recipe as Record<string, unknown>
          return {
            ...(typedRecipe as object),
            recipe_ingredients: Array.isArray(typedRecipe['recipe_ingredients'])
              ? (typedRecipe['recipe_ingredients'] as unknown[]).map((ri: unknown) => {
                  const riRecord = ri as Record<string, unknown>
                  return {
                    ...riRecord,
                    ingredient: riRecord['ingredients'] // Use 'ingredients' key from Supabase join
                  }
                })
              : []
          }
        }) as RecipeWithIngredients[]
      : []

    // Get all expenses from financial_records
    const { data: expenses, error: expensesError } = await supabase
      .from('financial_records' as never)
      .select('id, user_id, type, amount, date, description, category_id')
      .eq('user_id', user.id)
      .eq('type', 'EXPENSE')
      .gte('date', startDate)
      .lte('date', endDate)

    if (expensesError) {
      apiLogger.error({ error: expensesError }, 'Error fetching expenses')
      return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
    }

    // Calculate total revenue
    const ordersData = (orders || []) as Array<{ total_amount: number | null }>
    const totalRevenue = ordersData.reduce((sum, order) => sum + toNumber(order.total_amount), 0)

    // Calculate products breakdown and total COGS
    type OrderWithItems = { order_items: Array<{ recipe_id: string | null; quantity: number; product_name: string | null; unit_price: number | null; total_price: number | null }> }
    const ordersWithItems = (orders || []) as OrderWithItems[]
    const productMap = new Map<string, { quantity: number; revenue: number; cogs: number }>()
    let totalCOGS = 0

    ordersWithItems.forEach((order) => {
      (order.order_items || []).forEach((item) => {
        if (!item.recipe_id) return
        const recipe = recipes.find(r => r.id === item.recipe_id)
        if (!recipe) return

        try {
          const recipeCOGS = calculateRecipeCOGS(recipe)
          const itemCOGS = recipeCOGS * item.quantity
          totalCOGS += itemCOGS

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
    const expensesData = (expenses || []) as Array<{ amount: number | null; category_id: string | null }>
    expensesData.forEach((expense) => {
      const category = expense.category_id || 'Uncategorized'
      const amount = toNumber(expense.amount)
      expenseMap.set(category, (expenseMap.get(category) || 0) + amount)
    })

    const operating_expenses: OperatingExpense[] = Array.from(expenseMap.entries()).map(([category, total_amount]) => ({
      category,
      total_amount
    }))

    const operationalExpenses = operating_expenses.reduce((sum, exp) => sum + exp.total_amount, 0)

    // Calculate profit metrics
    const grossProfit = totalRevenue - totalCOGS
    const netProfit = grossProfit - operationalExpenses
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
    const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // Calculate trends by comparing with previous period
    const periodDuration = new Date(endDate).getTime() - new Date(startDate).getTime()
    const previousStartDate = new Date(new Date(startDate).getTime() - periodDuration - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const previousEndDate = new Date(new Date(startDate).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Get previous period orders
    const { data: previousOrders, error: previousOrdersError } = await supabase
      .from('orders' as never)
      .select(`
        total_amount,
        order_items (
          recipe_id,
          quantity,
          total_price
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'DELIVERED')
      .gte('delivery_date', previousStartDate)
      .lte('delivery_date', previousEndDate)

    let previousRevenue = 0
    let previousCOGS = 0

    if (previousOrders && !previousOrdersError) {
      const previousOrdersData = (previousOrders || []) as Array<{ total_amount: number | null; order_items: Array<{ recipe_id: string | null; quantity: number }> }>
      previousRevenue = previousOrdersData.reduce((sum, order) => sum + toNumber(order.total_amount), 0)

      previousOrdersData.forEach((order) => {
        (order.order_items || []).forEach((item) => {
          if (!item.recipe_id) return
          const recipe = recipes.find(r => r.id === item.recipe_id)
          if (recipe) {
            try {
              const recipeCOGS = calculateRecipeCOGS(recipe)
              previousCOGS += recipeCOGS * item.quantity
            } catch (error) {
              apiLogger.error({ error, recipeId: item.recipe_id }, 'Failed to calculate recipe COGS for previous period')
              // Continue with other items
            }
          }
        })
      })
    }

    const previousProfit = previousRevenue - previousCOGS
    const currentProfit = grossProfit

    const trends: ProfitTrends = {
      revenue_trend: previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0,
      profit_trend: previousProfit > 0 ? ((currentProfit - previousProfit) / previousProfit) * 100 : 0
    }

    const profitReport: ProfitData = {
      summary: {
        total_revenue: totalRevenue,
        total_cogs: totalCOGS,
        gross_profit: grossProfit,
        gross_profit_margin: Number(grossProfitMargin.toFixed(2)),
        total_operating_expenses: operationalExpenses,
        net_profit: netProfit,
        net_profit_margin: Number(netProfitMargin.toFixed(2))
      },
      products,
      ingredients,
      operating_expenses,
      trends
    }

    apiLogger.info({ userId: user.id, startDate, endDate }, 'Profit report generated')
    return NextResponse.json(profitReport)
  } catch (error) {
    apiLogger.error({ error, userId: user.id }, 'Profit report error')
    return NextResponse.json({ error: 'Failed to generate profit report' }, { status: 500 })
  }
}

export const GET = createApiRoute(
  { method: 'GET', path: '/api/reports/profit', querySchema: ProfitReportQuerySchema },
  getProfitReportHandler
)
