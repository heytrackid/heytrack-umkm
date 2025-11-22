import type { SupabaseClient } from '@supabase/supabase-js'
import { apiLogger } from '@/lib/logger'

import type {
  OperatingExpenseBreakdownEntry,
  ProductProfitabilityEntry,
  ProfitTrends,
} from '@/types/features/profit-report'
import type { Database } from '@/types/database'



type AggregationPeriod = 'daily' | 'weekly' | 'monthly'

type OrderItemWithRecipe = {
  quantity: number
  unit_price: number
  total_price: number
  recipes: {
    id: string
    name: string
    cost_per_unit: number
  } | null
}

export interface InventoryReport {
  totalItems: number
  lowStockItems: number
  outOfStockItems: number
  totalValue: number
  items: Array<{
    id: string
    name: string
    category: string
    current_stock: number
    reorder_point: number
    unit_price: number
    total_value: number
    status: 'in_stock' | 'low_stock' | 'out_of_stock'
  }>
  summary: {
    categories: Record<string, number>
    top_expensive: Array<{
      name: string
      total_value: number
    }>
  }
}

export interface ProfitReport {
  period: {
    start: string
    end: string
    aggregation: AggregationPeriod
  }
  summary: {
    totalRevenue: number
    totalCOGS: number
    totalOperatingExpenses: number
    grossProfit: number
    netProfit: number
    profitMargin: number
  }
  trends: ProfitTrends
  productProfitability: ProductProfitabilityEntry[]
  operatingExpenses: OperatingExpenseBreakdownEntry[]
}

export interface SalesReport {
  period: {
    start: string
    end: string
  }
  summary: {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    topProducts: Array<{
      recipe_id: string
      recipe_name: string
      total_sold: number
      revenue: number
    }>
  }
  dailySales: Array<{
    date: string
    orders: number
    revenue: number
  }>
  productPerformance: Array<{
    recipe_id: string
    recipe_name: string
    orders: number
    quantity_sold: number
    revenue: number
    profit: number
  }>
}

export class ReportService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getInventoryReport(userId: string): Promise<InventoryReport> {
    try {
      // Get all ingredients with stock info
      const { data: ingredients, error } = await this.supabase
        .from('ingredients')
        .select(`
          id,
          name,
          category,
          current_stock,
          reorder_point,
          price_per_unit,
          unit
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('name')

      if (error) {
        apiLogger.error({ error, userId }, 'Failed to fetch ingredients for inventory report')
        throw error
      }

      const items = (ingredients || []).map(item => {
        const totalValue = (item.current_stock || 0) * (item.price_per_unit || 0)
        let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock'

        if ((item.current_stock || 0) === 0) {
          status = 'out_of_stock'
        } else if ((item.current_stock || 0) <= (item.reorder_point || 0)) {
          status = 'low_stock'
        }

        return {
          id: item.id,
          name: item.name,
          category: item.category || 'Uncategorized',
          current_stock: item.current_stock || 0,
          reorder_point: item.reorder_point || 0,
          unit_price: item.price_per_unit || 0,
          total_value: totalValue,
          status
        }
      })

      const totalItems = items.length
      const lowStockItems = items.filter(item => item.status === 'low_stock').length
      const outOfStockItems = items.filter(item => item.status === 'out_of_stock').length
      const totalValue = items.reduce((sum, item) => sum + item.total_value, 0)

      // Category breakdown
      const categories = items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Top expensive items
      const topExpensive = items
        .sort((a, b) => b.total_value - a.total_value)
        .slice(0, 5)
        .map(item => ({
          name: item.name,
          total_value: item.total_value
        }))

      return {
        totalItems,
        lowStockItems,
        outOfStockItems,
        totalValue,
        items,
        summary: {
          categories,
          top_expensive: topExpensive
        }
      }
    } catch (error) {
      apiLogger.error({ error, userId }, 'Failed to generate inventory report')
      throw error
    }
  }

  async getProfitReport(
    userId: string,
    filters: {
      startDate?: string
      endDate?: string
      aggregation?: AggregationPeriod
      includeBreakdown?: boolean
    } = {}
  ): Promise<ProfitReport> {
    const { startDate, endDate, aggregation = 'monthly' } = filters

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    try {
      // Get orders in date range
      const { data: orders, error: ordersError } = await this.supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          created_at,
          order_items (
            quantity,
            unit_price,
            total_price,
            recipes (
              id,
              name,
              cost_per_unit
            )
          )
        `)
        .eq('user_id', userId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .eq('status', 'DELIVERED')

      if (ordersError) {
        apiLogger.error({ error: ordersError, userId }, 'Failed to fetch orders for profit report')
        throw ordersError
      }

      // Calculate revenue and COGS
      let totalRevenue = 0
      let totalCOGS = 0
      const productProfitability: ProductProfitabilityEntry[] = []

      const productMap = new Map<string, {
        recipe_id: string
        recipe_name: string
        orders: number
        quantity_sold: number
        revenue: number
        cogs: number
      }>()

      for (const order of orders || []) {
        totalRevenue += order.total_amount || 0

        for (const item of (order.order_items as OrderItemWithRecipe[]) || []) {
          const recipe = item.recipes
          if (!recipe) continue

          const revenue = item.total_price || 0
          const cogs = (item.quantity || 0) * (recipe.cost_per_unit || 0)
          totalCOGS += cogs

          const key = recipe.id
          if (!productMap.has(key)) {
            productMap.set(key, {
              recipe_id: recipe.id,
              recipe_name: recipe.name,
              orders: 0,
              quantity_sold: 0,
              revenue: 0,
              cogs: 0
            })
          }

          const product = productMap.get(key)!
          product.orders += 1
          product.quantity_sold += item.quantity || 0
          product.revenue += revenue
          product.cogs += cogs
        }
      }

      // Convert to array and calculate profitability
      for (const product of productMap.values()) {
        const profit = product.revenue - product.cogs
        const profitMargin = product.revenue > 0 ? (profit / product.revenue) * 100 : 0

        productProfitability.push({
          product_name: product.recipe_name,
          total_revenue: product.revenue,
          total_cogs: product.cogs,
          gross_profit: profit,
          gross_margin: profitMargin,
          total_quantity: product.quantity_sold
        })
      }

      // Get operating expenses
      const { data: expenses, error: expensesError } = await this.supabase
        .from('financial_records')
        .select('amount, category, description')
        .eq('user_id', userId)
        .gte('date', start.toISOString())
        .lte('date', end.toISOString())

      if (expensesError) {
        apiLogger.error({ error: expensesError, userId }, 'Failed to fetch expenses for profit report')
        throw expensesError
      }

      const totalOperatingExpenses = (expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0)

      const grossProfit = totalRevenue - totalCOGS
      const netProfit = grossProfit - totalOperatingExpenses
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

      // Calculate actual trends from historical data
      const previousPeriodStart = new Date(start)
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
      const previousPeriodEnd = new Date(end)
      previousPeriodEnd.setMonth(previousPeriodEnd.getMonth() - 1)

      const { data: previousOrders } = await this.supabase
        .from('orders')
        .select('total_amount')
        .eq('user_id', userId)
        .gte('created_at', previousPeriodStart.toISOString())
        .lte('created_at', previousPeriodEnd.toISOString())
        .eq('status', 'DELIVERED')

      const previousRevenue = previousOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0

      const trends: ProfitTrends = {
        revenue_trend: revenueChange,
        profit_trend: revenueChange * 0.7 // Estimate profit trend based on revenue
      }

      // Operating expenses breakdown
      const operatingExpenses: OperatingExpenseBreakdownEntry[] = []
      const expenseByCategory = (expenses || []).reduce((acc, exp) => {
        const category = exp.category || 'Other'
        acc[category] = (acc[category] || 0) + (exp.amount || 0)
        return acc
      }, {} as Record<string, number>)

      for (const [category, amount] of Object.entries(expenseByCategory)) {
        operatingExpenses.push({
          category,
          total: amount,
          percentage: totalOperatingExpenses > 0 ? (amount / totalOperatingExpenses) * 100 : 0
        })
      }

      return {
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
          aggregation
        },
        summary: {
          totalRevenue,
          totalCOGS,
          totalOperatingExpenses,
          grossProfit,
          netProfit,
          profitMargin
        },
        trends,
        productProfitability,
        operatingExpenses
      }
    } catch (error) {
      apiLogger.error({ error, userId, filters }, 'Failed to generate profit report')
      throw error
    }
  }

  async getSalesReport(
    userId: string,
    filters: {
      startDate?: string
      endDate?: string
    } = {}
  ): Promise<SalesReport> {
    const { startDate, endDate } = filters

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    try {
      // Get orders in date range
      const { data: orders, error: ordersError } = await this.supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          created_at,
          order_items (
            quantity,
            unit_price,
            total_price,
            recipes (
              id,
              name,
              cost_per_unit
            )
          )
        `)
        .eq('user_id', userId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .eq('status', 'DELIVERED')

      if (ordersError) {
        apiLogger.error({ error: ordersError, userId }, 'Failed to fetch orders for sales report')
        throw ordersError
      }

      const totalOrders = orders?.length || 0
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Daily sales aggregation
      const dailySalesMap = new Map<string, { orders: number; revenue: number }>()
      const productMap = new Map<string, {
        recipe_id: string
        recipe_name: string
        orders: number
        quantity_sold: number
        revenue: number
        profit: number
      }>()

      for (const order of orders || []) {
        const date = new Date(order.created_at || '').toISOString().split('T')[0] as string

        if (!dailySalesMap.has(date)) {
          dailySalesMap.set(date, { orders: 0, revenue: 0 })
        }
        const daily = dailySalesMap.get(date)!
        daily.orders += 1
        daily.revenue += order.total_amount || 0

        // Process order items
        for (const item of (order.order_items as OrderItemWithRecipe[]) || []) {
          const recipe = item.recipes
          if (!recipe) continue

          const key = recipe.id as string
          if (!productMap.has(key)) {
            productMap.set(key, {
              recipe_id: recipe.id,
              recipe_name: recipe.name,
              orders: 0,
              quantity_sold: 0,
              revenue: 0,
              profit: 0
            })
          }

          const product = productMap.get(key)!
          product.orders += 1
          product.quantity_sold += item.quantity || 0
          product.revenue += item.total_price || 0
          product.profit += (item.total_price || 0) - ((item.quantity || 0) * (recipe['cost_per_unit'] as number || 0))
        }
      }

      const dailySales = Array.from(dailySalesMap.entries())
        .map(([date, data]) => ({
          date,
          orders: data.orders,
          revenue: data.revenue
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      const productPerformance = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)

      const topProducts = productPerformance.slice(0, 5).map(p => ({
        recipe_id: p.recipe_id,
        recipe_name: p.recipe_name,
        total_sold: p.quantity_sold,
        revenue: p.revenue
      }))

      return {
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        summary: {
          totalOrders,
          totalRevenue,
          averageOrderValue,
          topProducts
        },
        dailySales,
        productPerformance
      }
    } catch (error) {
      apiLogger.error({ error, userId, filters }, 'Failed to generate sales report')
      throw error
    }
  }
}