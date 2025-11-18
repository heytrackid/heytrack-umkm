export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { apiLogger } from '@/lib/logger'
import { calculateRecipeCOGS, toNumber } from '@/lib/supabase/query-helpers'
import type { RecipeWithIngredients } from '@/types/query-results'
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
          ingredient:ingredients (*)
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
                    ingredient: Array.isArray(riRecord['ingredient']) ? riRecord['ingredient'][0]! : riRecord['ingredient']
                  }
                })
              : []
          }
        }) as RecipeWithIngredients[]
      : []

    // Get all expenses from financial_records
    const { data: expenses, error: expensesError } = await supabase
      .from('financial_records' as never)
      .select('*')
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

    // Calculate total COGS using WAC for each recipe sold
    type OrderWithItems = { order_items: Array<{ recipe_id: string | null; quantity: number }> }
    const ordersWithItems = (orders || []) as OrderWithItems[]
    let totalCOGS = 0

    ordersWithItems.forEach((order) => {
      (order.order_items || []).forEach((item) => {
        if (!item.recipe_id) return
        const recipe = recipes.find(r => (r as { id: string }).id === item.recipe_id)
        if (recipe) {
          const recipeCOGS = calculateRecipeCOGS(recipe)
          totalCOGS += recipeCOGS * item.quantity
        }
      })
    })

    // Calculate operational expenses
    const expensesData = (expenses || []) as Array<{ amount: number | null }>
    const operationalExpenses = expensesData.reduce((sum, expense) => sum + toNumber(expense.amount), 0)

    // Calculate profit metrics
    const grossProfit = totalRevenue - totalCOGS
    const netProfit = grossProfit - operationalExpenses
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
    const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    const profitReport = {
      period: {
        start: startDate,
        end: endDate
      },
      summary: {
        totalRevenue,
        totalCOGS,
        grossProfit,
        grossProfitMargin: Number(grossProfitMargin.toFixed(2)),
        operationalExpenses,
        netProfit,
        netProfitMargin: Number(netProfitMargin.toFixed(2))
      },
      orders: {
        total: ordersData.length,
        averageOrderValue: ordersData.length > 0 ? totalRevenue / ordersData.length : 0
      }
    }

    apiLogger.info({ userId: user.id, startDate, endDate }, 'Profit report generated')
    return NextResponse.json({ success: true, data: profitReport })
  } catch (error) {
    apiLogger.error({ error, userId: user.id }, 'Profit report error')
    return NextResponse.json({ error: 'Failed to generate profit report' }, { status: 500 })
  }
}

export const GET = createApiRoute(
  { method: 'GET', path: '/api/reports/profit', querySchema: ProfitReportQuerySchema },
  getProfitReportHandler
)
