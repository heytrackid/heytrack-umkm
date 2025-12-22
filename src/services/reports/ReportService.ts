import { apiLogger } from '@/lib/logger'
import { BaseService, type ServiceContext } from '@/services/base'

import type {
    OperatingExpenseBreakdownEntry,
    ProductProfitabilityEntry,
    ProfitTrends,
} from '@/types/features/profit-report'

import { BUSINESS_CONSTANTS } from '@/lib/shared/constants'



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
    grossMargin: number
    netMargin: number
    profitMargin: number // Deprecated: use netMargin instead
    has_loss_making_products?: boolean
    loss_making_products_count?: number
    has_unrealistic_margins?: boolean
  }
  trends: ProfitTrends
  productProfitability: ProductProfitabilityEntry[]
  top_profitable_products: ProductProfitabilityEntry[]
  least_profitable_products: ProductProfitabilityEntry[]
  operating_expenses_breakdown: OperatingExpenseBreakdownEntry[]
  profit_by_period: Array<{
    period: string
    revenue: number
    cogs: number
    gross_profit: number
    gross_margin: number
    orders_count: number
  }>
  insights: Array<{
    type: 'warning' | 'success' | 'info' | 'danger'
    title: string
    description: string
    recommendation?: string
    impact?: 'high' | 'medium' | 'low'
  }>
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

export class ReportService extends BaseService {
  constructor(context: ServiceContext) {
    super(context)
  }

  async getInventoryReport(): Promise<InventoryReport> {
    try {
      // Get all ingredients with stock info
      const { data: ingredients, error } = await this.context.supabase
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
          .eq('user_id', this.context.userId)
          .eq('is_active', true)
          .order('name')

      if (error) {
        apiLogger.error({ error, userId: this.context.userId }, 'Failed to fetch ingredients for inventory report')
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
      apiLogger.error({ error, userId: this.context.userId }, 'Failed to generate inventory report')
      throw error
    }
  }

  async getProfitReport(
    filters: {
      startDate?: string
      endDate?: string
      aggregation?: AggregationPeriod
      includeBreakdown?: boolean
    } = {}
  ): Promise<ProfitReport> {
    const { startDate, endDate, aggregation = 'monthly' } = filters

    const start = startDate ? new Date(startDate) : new Date(Date.now() - BUSINESS_CONSTANTS.THIRTY_DAYS_MS)
    const end = endDate ? new Date(endDate) : new Date()

    try {
      // Get orders in date range
      const { data: orders, error: ordersError } = await this.context.supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          order_date,
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
        .eq('user_id', this.context.userId)
        .gte('order_date', start.toISOString().split('T')[0] as string)
        .lte('order_date', end.toISOString().split('T')[0] as string)
        .in('status', ['READY', 'DELIVERED'])

      if (ordersError) {
        apiLogger.error({ error: ordersError, userId: this.context.userId }, 'Failed to fetch orders for profit report')
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
        const isLossMaking = profit < 0
        const isLowMargin = profitMargin < 15 && profitMargin >= 0

        productProfitability.push({
          product_name: product.recipe_name,
          total_revenue: product.revenue,
          total_cogs: product.cogs,
          gross_profit: profit,
          gross_margin: profitMargin,
          total_quantity: product.quantity_sold,
          is_loss_making: isLossMaking,
          is_low_margin: isLowMargin
        })
      }

      // Get operating expenses
      const { data: expenses, error: expensesError } = await this.context.supabase
        .from('financial_records')
        .select('amount, category, description')
        .eq('user_id', this.context.userId)
        .gte('date', start.toISOString())
        .lte('date', end.toISOString())

      if (expensesError) {
        apiLogger.error({ error: expensesError, userId: this.context.userId }, 'Failed to fetch expenses for profit report')
        throw expensesError
      }

      const totalOperatingExpenses = (expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0)

      const grossProfit = totalRevenue - totalCOGS
      const netProfit = grossProfit - totalOperatingExpenses
      const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
      const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
      const profitMargin = netMargin // Keep for backward compatibility

      // Business validation
      const lossMakingProductsCount = productProfitability.filter(p => p.is_loss_making).length
      const unrealisticMargin = grossMargin > 90 || grossMargin < -50 || netMargin > 50 || netMargin < -50

      // Calculate actual trends from historical data
      const previousPeriodStart = new Date(start)
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
      const previousPeriodEnd = new Date(end)
      previousPeriodEnd.setMonth(previousPeriodEnd.getMonth() - 1)

      const { data: previousOrders } = await this.context.supabase
        .from('orders')
        .select(`
          total_amount,
          order_items (
            quantity,
            recipes (cost_per_unit)
          )
        `)
        .eq('user_id', this.context.userId)
        .gte('created_at', previousPeriodStart.toISOString())
        .lte('created_at', previousPeriodEnd.toISOString())
        .eq('status', 'DELIVERED')

      let previousRevenue = 0
      let previousCOGS = 0
      if (previousOrders) {
        for (const order of previousOrders) {
          previousRevenue += order.total_amount || 0
          for (const item of (order.order_items || [])) {
            const recipe = item.recipes
            if (recipe) {
              previousCOGS += (item.quantity || 0) * (recipe.cost_per_unit || 0)
            }
          }
        }
      }

      const previousProfit = previousRevenue - previousCOGS
      const currentProfit = grossProfit

      const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0
      const profitChange = previousProfit !== 0 ? ((currentProfit - previousProfit) / Math.abs(previousProfit)) * 100 : 0

      const trends: ProfitTrends = {
        revenue_trend: revenueChange,
        profit_trend: profitChange
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

      // Generate automated insights
      const insights = this.generateProfitInsights({
        totalRevenue,
        totalCOGS,
        totalOperatingExpenses,
        grossProfit,
        netProfit,
        grossMargin,
        netMargin,
        profitMargin,
        lossMakingProductsCount,
        unrealisticMargin,
        revenueChange,
        profitChange,
        operatingExpenses
      })

      // Sort products by profitability
      const sortedByProfit = [...productProfitability].sort((a, b) => b.gross_profit - a.gross_profit)
      const topProfitable = sortedByProfit.slice(0, 5)
      const leastProfitable = sortedByProfit.slice(-5).reverse()

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
          grossMargin,
          netMargin,
          profitMargin, // Deprecated: use netMargin instead
          has_loss_making_products: lossMakingProductsCount > 0,
          loss_making_products_count: lossMakingProductsCount,
          has_unrealistic_margins: unrealisticMargin
        },
        trends,
        productProfitability,
        top_profitable_products: topProfitable,
        least_profitable_products: leastProfitable,
        operating_expenses_breakdown: operatingExpenses,
        profit_by_period: [],
        insights
      }
    } catch (error) {
      apiLogger.error({ error, userId: this.context.userId, filters }, 'Failed to generate profit report')
      throw error
    }
  }

  /**
   * Generate automated insights from profit report data
   * 
   * IMPORTANT: All calculations are validated to ensure accuracy
   */
  private generateProfitInsights(data: {
    totalRevenue: number
    totalCOGS: number
    totalOperatingExpenses: number
    grossProfit: number
    netProfit: number
    grossMargin: number
    netMargin: number
    profitMargin: number
    lossMakingProductsCount: number
    unrealisticMargin: boolean
    revenueChange: number
    profitChange: number
    operatingExpenses: OperatingExpenseBreakdownEntry[]
  }): Array<{
    type: 'warning' | 'success' | 'info' | 'danger'
    title: string
    description: string
    recommendation?: string
    impact?: 'high' | 'medium' | 'low'
  }> {
    const insights: Array<{
      type: 'warning' | 'success' | 'info' | 'danger'
      title: string
      description: string
      recommendation?: string
      impact?: 'high' | 'medium' | 'low'
    }> = []

    // Validate data integrity
    if (data.totalRevenue < 0 || data.totalCOGS < 0 || data.totalOperatingExpenses < 0) {
      insights.push({
        type: 'warning',
        title: 'Data Tidak Valid',
        description: 'Ditemukan nilai negatif dalam data laporan. Silakan verifikasi data.',
        impact: 'high'
      })
      return insights
    }

    // Net profit analysis (PRIORITY 1 - most important)
    if (data.netProfit < 0) {
      insights.push({
        type: 'danger',
        title: 'Kerugian Bersih',
        description: `Bisnis mengalami kerugian bersih sebesar ${Math.abs(data.netProfit).toLocaleString('id-ID')} dalam periode ini.`,
        recommendation: 'Segera tinjau struktur biaya dan strategi pricing untuk kembali ke zona profit.',
        impact: 'high'
      })
    } else if (data.netProfit > 0) {
      insights.push({
        type: 'success',
        title: 'Keuntungan Bersih Positif',
        description: `Bisnis menghasilkan keuntungan bersih sebesar ${data.netProfit.toLocaleString('id-ID')}.`,
        impact: 'high'
      })
    }

    // Gross margin analysis (COGS efficiency)
    if (data.totalRevenue > 0) {
      if (data.grossMargin < 30) {
        insights.push({
          type: 'danger',
          title: 'Margin Kotor Sangat Rendah',
          description: `Margin kotor ${data.grossMargin.toFixed(1)}% sangat rendah. Standar industri F&B: 60-70%.`,
          recommendation: 'Segera naikkan harga jual atau kurangi biaya bahan baku secara drastis.',
          impact: 'high'
        })
      } else if (data.grossMargin < 50) {
        insights.push({
          type: 'warning',
          title: 'Margin Kotor Rendah',
          description: `Margin kotor ${data.grossMargin.toFixed(1)}% di bawah standar industri F&B (60-70%).`,
          recommendation: 'Optimalkan harga jual atau negosiasikan harga bahan baku dengan supplier.',
          impact: 'high'
        })
      } else if (data.grossMargin >= 60 && data.grossMargin <= 75) {
        insights.push({
          type: 'success',
          title: 'Margin Kotor Optimal',
          description: `Margin kotor ${data.grossMargin.toFixed(1)}% sesuai standar industri F&B (60-70%).`,
          impact: 'low'
        })
      } else if (data.grossMargin > 75) {
        insights.push({
          type: 'warning',
          title: 'Margin Kotor Sangat Tinggi',
          description: `Margin kotor ${data.grossMargin.toFixed(1)}% sangat tinggi. Pastikan harga tetap kompetitif.`,
          recommendation: 'Evaluasi apakah harga jual masih sesuai dengan pasar.',
          impact: 'medium'
        })
      }
    }

    // Net margin analysis (overall profitability)
    if (data.totalRevenue > 0) {
      if (data.netMargin < 5) {
        insights.push({
          type: 'danger',
          title: 'Margin Bersih Sangat Rendah',
          description: `Margin bersih ${data.netMargin.toFixed(1)}% sangat rendah dan tidak sustainable. Standar industri F&B: 10-20%.`,
          recommendation: 'Kurangi biaya operasional dan tingkatkan efisiensi bisnis.',
          impact: 'high'
        })
      } else if (data.netMargin < 10) {
        insights.push({
          type: 'warning',
          title: 'Margin Bersih Rendah',
          description: `Margin bersih ${data.netMargin.toFixed(1)}% di bawah standar industri F&B (10-20%).`,
          recommendation: 'Evaluasi efisiensi operasional dan cari peluang penghematan biaya.',
          impact: 'high'
        })
      } else if (data.netMargin >= 10 && data.netMargin <= 25) {
        insights.push({
          type: 'success',
          title: 'Margin Bersih Sehat',
          description: `Margin bersih ${data.netMargin.toFixed(1)}% dalam kisaran yang sehat untuk bisnis F&B.`,
          impact: 'low'
        })
      } else if (data.netMargin > 25) {
        insights.push({
          type: 'success',
          title: 'Margin Bersih Sangat Baik',
          description: `Margin bersih ${data.netMargin.toFixed(1)}% sangat baik. Bisnis Anda sangat profitable!`,
          impact: 'low'
        })
      }
    }

    // Loss-making products (only if count > 0)
    if (data.lossMakingProductsCount > 0) {
      insights.push({
        type: 'danger',
        title: `${data.lossMakingProductsCount} Produk Rugi`,
        description: `Terdapat ${data.lossMakingProductsCount} produk yang menimbulkan kerugian (margin negatif).`,
        recommendation: 'Evaluasi harga pokok produksi dan pertimbangkan penghentian atau repricing produk yang tidak menguntungkan.',
        impact: 'high'
      })
    }

    // Revenue trend analysis
    if (Math.abs(data.revenueChange) > 20) {
      const trend = data.revenueChange > 0 ? 'peningkatan' : 'penurunan'
      const type = data.revenueChange > 0 ? 'success' : 'warning'
      insights.push({
        type: type as 'success' | 'warning',
        title: `Tren Revenue ${trend.charAt(0).toUpperCase() + trend.slice(1)}`,
        description: `Revenue ${trend} sebesar ${Math.abs(data.revenueChange).toFixed(1)}% dibandingkan periode sebelumnya.`,
        recommendation: data.revenueChange > 0
          ? 'Pertahankan strategi yang berhasil dan identifikasi faktor pendorong pertumbuhan.'
          : 'Analisis penyebab penurunan dan implementasikan strategi perbaikan.',
        impact: 'high'
      })
    }

    // COGS ratio analysis (relative to revenue)
    if (data.totalRevenue > 0) {
      const cogsRatio = (data.totalCOGS / data.totalRevenue) * 100
      if (cogsRatio > 75) {
        insights.push({
          type: 'danger',
          title: 'Biaya Bahan Baku Sangat Tinggi',
          description: `Biaya bahan baku mencapai ${cogsRatio.toFixed(1)}% dari total revenue. Ini meninggalkan margin sangat kecil.`,
          recommendation: 'Optimalkan penggunaan bahan baku, negosiasikan harga dengan supplier, atau naikkan harga jual.',
          impact: 'high'
        })
      } else if (cogsRatio > 65) {
        insights.push({
          type: 'warning',
          title: 'Biaya Bahan Baku Tinggi',
          description: `Biaya bahan baku mencapai ${cogsRatio.toFixed(1)}% dari total revenue.`,
          recommendation: 'Optimalkan penggunaan bahan baku atau negosiasikan harga dengan supplier.',
          impact: 'high'
        })
      }
    }

    // Operating expenses ratio analysis
    if (data.totalRevenue > 0) {
      const opexRatio = (data.totalOperatingExpenses / data.totalRevenue) * 100
      if (opexRatio > 40) {
        insights.push({
          type: 'warning',
          title: 'Biaya Operasional Tinggi',
          description: `Biaya operasional mencapai ${opexRatio.toFixed(1)}% dari total revenue.`,
          recommendation: 'Evaluasi efisiensi operasional dan cari peluang penghematan biaya.',
          impact: 'high'
        })
      }
    }

    // Top operating expense category analysis
    if (data.operatingExpenses.length > 0) {
      const topExpense = data.operatingExpenses.sort((a, b) => b.total - a.total)[0]
      if (topExpense && topExpense.percentage > 35) {
        insights.push({
          type: 'warning',
          title: 'Kategori Biaya Dominan',
          description: `Kategori "${topExpense.category}" menyumbang ${topExpense.percentage.toFixed(1)}% dari total biaya operasional.`,
          recommendation: 'Evaluasi efisiensi dalam kategori biaya ini dan cari alternatif yang lebih hemat.',
          impact: 'medium'
        })
      }
    }

    // Gross profit analysis
    if (data.grossProfit < 0) {
      insights.push({
        type: 'danger',
        title: 'Kerugian Kotor',
        description: 'Harga jual lebih rendah dari biaya bahan baku. Ini sangat kritis.',
        recommendation: 'Segera naikkan harga jual atau kurangi biaya bahan baku.',
        impact: 'high'
      })
    }

    // If no insights generated, add a neutral one
    if (insights.length === 0) {
      insights.push({
        type: 'info',
        title: 'Laporan Stabil',
        description: 'Tidak ada masalah signifikan terdeteksi dalam laporan keuangan.',
        impact: 'low'
      })
    }

    return insights
  }

  async getSalesReport(
    filters: {
      startDate?: string
      endDate?: string
    } = {}
  ): Promise<SalesReport> {
    const { startDate, endDate } = filters

    const start = startDate ? new Date(startDate) : new Date(Date.now() - BUSINESS_CONSTANTS.THIRTY_DAYS_MS)
    const end = endDate ? new Date(endDate) : new Date()

    try {
      // Get orders in date range
      const { data: orders, error: ordersError } = await this.context.supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          order_date,
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
        .eq('user_id', this.context.userId)
        .gte('order_date', start.toISOString().split('T')[0] as string)
        .lte('order_date', end.toISOString().split('T')[0] as string)
        .in('status', ['READY', 'DELIVERED'])

      if (ordersError) {
        apiLogger.error({ error: ordersError, userId: this.context.userId }, 'Failed to fetch orders for sales report')
        throw ordersError
      }

      type SalesReportOrderRow = {
        id: string
        total_amount: number | null
        order_date: string | null
        created_at: string | null
        order_items: unknown
      }

      const ordersData = (orders ?? []) as SalesReportOrderRow[]

      const totalOrders = ordersData.length
      const totalRevenue = ordersData.reduce((sum: number, order: SalesReportOrderRow) => sum + (order.total_amount || 0), 0)
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

      for (const order of ordersData) {
        const date = (order.order_date || (order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : '')) as string

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
      apiLogger.error({ error, userId: this.context.userId, filters }, 'Failed to generate sales report')
      throw error
    }
  }
}