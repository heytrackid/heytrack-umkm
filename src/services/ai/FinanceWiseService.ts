/**
 * FinanceWise AI Service
 * Cash Flow Intelligence Agent for UMKM
 * 
 * Features:
 * - Cash flow forecasting (3-6 months)
 * - Financial health analysis
 * - Budget planning and tracking
 * - Expense optimization
 */

import { apiLogger } from '@/lib/logger'
import { BaseService, type ServiceContext } from '@/services/base'

// Types
export interface FinancialSummary {
  period: string
  revenue: number
  expenses: number
  profit: number
  profitMargin: number
  revenueGrowth: number
  expenseGrowth: number
  topExpenseCategories: Array<{ category: string; amount: number; percentage: number }>
  topRevenueProducts: Array<{ name: string; amount: number; percentage: number }>
}

export interface CashFlowForecast {
  month: string
  projectedRevenue: number
  projectedExpenses: number
  projectedProfit: number
  confidence: number
  factors: string[]
}

export interface FinancialHealth {
  status: 'excellent' | 'good' | 'warning' | 'critical'
  score: number // 0-100
  cashBalance: number
  monthlyBurn: number
  runway: number // months
  alerts: FinancialAlert[]
  recommendations: string[]
}

export interface FinancialAlert {
  type: 'cash_flow' | 'expense' | 'revenue' | 'margin' | 'payment'
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  actionUrl?: string
}

export interface ProfitAnalysis {
  totalRevenue: number
  totalCogs: number // Cost of Goods Sold
  grossProfit: number
  grossMargin: number
  operationalExpenses: number
  netProfit: number
  netMargin: number
  breakEvenPoint: number
  productProfitability: Array<{
    name: string
    revenue: number
    cost: number
    profit: number
    margin: number
    salesCount: number
  }>
}

export interface FinanceWiseResponse {
  summary: FinancialSummary
  health: FinancialHealth
  forecast: CashFlowForecast[]
  profitAnalysis: ProfitAnalysis
  aiInsights: string
  generatedAt: string
}

export class FinanceWiseService extends BaseService {
  constructor(context: ServiceContext) {
    super(context)
  }

  /**
   * Get comprehensive financial summary for a period
   */
  async getFinancialSummary(
    startDate: string,
    endDate: string
  ): Promise<FinancialSummary> {
    const userId = this.context.userId

    try {
      // Get revenue from orders
      const { data: orders } = await this.context.supabase
        .from('orders')
        .select('total_amount, order_date, status')
        .eq('user_id', userId)
        .eq('status', 'DELIVERED')
        .gte('order_date', startDate)
        .lte('order_date', endDate)

      const revenue = (orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0)

      // Get expenses from financial_records
      const { data: expenses } = await this.context.supabase
        .from('financial_records')
        .select('amount, category, type')
        .eq('user_id', userId)
        .eq('type', 'EXPENSE')
        .gte('date', startDate)
        .lte('date', endDate)

      const totalExpenses = (expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0)

      // Calculate expense categories
      const categoryMap = new Map<string, number>()
      for (const expense of expenses || []) {
        const current = categoryMap.get(expense.category || 'Lainnya') || 0
        categoryMap.set(expense.category || 'Lainnya', current + (expense.amount || 0))
      }

      const topExpenseCategories = Array.from(categoryMap.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)

      // Get previous period for growth calculation
      const periodDays = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      const prevStartDate = new Date(new Date(startDate).getTime() - periodDays * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]
      const prevEndDate = new Date(new Date(startDate).getTime() - 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]

      const { data: prevOrders } = await this.context.supabase
        .from('orders')
        .select('total_amount')
        .eq('user_id', userId)
        .eq('status', 'DELIVERED')
        .gte('order_date', prevStartDate)
        .lte('order_date', prevEndDate)

      const prevRevenue = (prevOrders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0)

      const { data: prevExpenses } = await this.context.supabase
        .from('financial_records')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'EXPENSE')
        .gte('date', prevStartDate)
        .lte('date', prevEndDate)

      const prevTotalExpenses = (prevExpenses || []).reduce((sum, e) => sum + (e.amount || 0), 0)

      // Get top revenue products
      const { data: orderItems } = await this.context.supabase
        .from('order_items')
        .select(`
          quantity,
          unit_price,
          total_price,
          product_name,
          orders!inner(user_id, status, order_date),
          recipes(name)
        `)
        .eq('orders.user_id', userId)
        .eq('orders.status', 'DELIVERED')
        .gte('orders.order_date', startDate)
        .lte('orders.order_date', endDate)

      const productMap = new Map<string, number>()
      for (const item of orderItems || []) {
        const recipeName = (item.recipes as { name: string } | null)?.name || item.product_name || 'Unknown'
        const current = productMap.get(recipeName) || 0
        productMap.set(recipeName, current + (item.total_price || 0))
      }

      const topRevenueProducts = Array.from(productMap.entries())
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: revenue > 0 ? (amount / revenue) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)

      const profit = revenue - totalExpenses
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0
      const revenueGrowth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0
      const expenseGrowth = prevTotalExpenses > 0 ? ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100 : 0

      return {
        period: `${startDate} - ${endDate}`,
        revenue,
        expenses: totalExpenses,
        profit,
        profitMargin,
        revenueGrowth,
        expenseGrowth,
        topExpenseCategories,
        topRevenueProducts
      }
    } catch (error) {
      apiLogger.error({ error, userId }, 'Failed to get financial summary')
      throw error
    }
  }

  /**
   * Get actual cash balance from financial records
   * This calculates real cash position, not profit
   */
  private async getActualCashBalance(userId: string): Promise<number> {
    try {
      const { data: records, error } = await this.context.supabase
        .from('financial_records')
        .select('amount, type')
        .eq('user_id', userId)

      if (error) {
        apiLogger.error({ error, userId }, 'Failed to fetch financial records for cash balance')
        return 0
      }

      if (!records || records.length === 0) {
        return 0
      }

      // Calculate actual cash flow: income - expenses
      const cashBalance = records.reduce((balance, record) => {
        const amount = Number(record.amount || 0)
        return record.type === 'INCOME' 
          ? balance + amount 
          : balance - amount
      }, 0)

      return Math.max(0, cashBalance) // Ensure non-negative
    } catch (error) {
      apiLogger.error({ error, userId }, 'Error calculating cash balance')
      return 0
    }
  }

  /**
   * Analyze financial health of the business
   */
  async analyzeFinancialHealth(): Promise<FinancialHealth> {
    const userId = this.context.userId

    try {
      // Get last 30 days data
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const summary = await this.getFinancialSummary(startDate!, endDate!)

      // Calculate health metrics with ACTUAL cash balance
      const monthlyBurn = summary.expenses
      const cashBalance = await this.getActualCashBalance(userId) // FIXED: Use actual cash, not profit
      const runway = monthlyBurn > 0 ? cashBalance / monthlyBurn : 12

      // Generate alerts
      const alerts: FinancialAlert[] = []

      // Check profit margin
      if (summary.profitMargin < 10) {
        alerts.push({
          type: 'margin',
          severity: 'critical',
          title: 'Margin Profit Rendah',
          message: `Margin profit hanya ${summary.profitMargin.toFixed(1)}%. Target minimal 15-20%.`,
          actionUrl: '/hpp'
        })
      } else if (summary.profitMargin < 15) {
        alerts.push({
          type: 'margin',
          severity: 'warning',
          title: 'Margin Profit Perlu Ditingkatkan',
          message: `Margin profit ${summary.profitMargin.toFixed(1)}%. Pertimbangkan optimasi HPP.`,
          actionUrl: '/hpp'
        })
      }

      // Check revenue trend
      if (summary.revenueGrowth < -10) {
        alerts.push({
          type: 'revenue',
          severity: 'warning',
          title: 'Revenue Menurun',
          message: `Revenue turun ${Math.abs(summary.revenueGrowth).toFixed(1)}% dari periode sebelumnya.`,
          actionUrl: '/reports'
        })
      }

      // Check expense growth
      if (summary.expenseGrowth > 20) {
        alerts.push({
          type: 'expense',
          severity: 'warning',
          title: 'Biaya Meningkat Signifikan',
          message: `Biaya naik ${summary.expenseGrowth.toFixed(1)}%. Review pengeluaran Anda.`,
          actionUrl: '/cash-flow'
        })
      }

      // Check runway
      if (runway < 1) {
        alerts.push({
          type: 'cash_flow',
          severity: 'critical',
          title: 'Cash Flow Kritis',
          message: 'Modal kerja kurang dari 1 bulan. Segera tingkatkan revenue atau kurangi biaya.',
          actionUrl: '/cash-flow'
        })
      } else if (runway < 2) {
        alerts.push({
          type: 'cash_flow',
          severity: 'warning',
          title: 'Cash Flow Perlu Perhatian',
          message: `Modal kerja tersisa ${runway.toFixed(1)} bulan.`,
          actionUrl: '/cash-flow'
        })
      }

      // Calculate health score (0-100)
      let score = 100
      if (summary.profitMargin < 10) score -= 30
      else if (summary.profitMargin < 15) score -= 15
      if (summary.revenueGrowth < -10) score -= 20
      else if (summary.revenueGrowth < 0) score -= 10
      if (summary.expenseGrowth > 20) score -= 15
      if (runway < 1) score -= 25
      else if (runway < 2) score -= 10
      score = Math.max(0, score)

      // Determine status
      let status: FinancialHealth['status'] = 'excellent'
      if (score < 40) status = 'critical'
      else if (score < 60) status = 'warning'
      else if (score < 80) status = 'good'

      // Generate recommendations
      const recommendations: string[] = []
      if (summary.profitMargin < 15) {
        recommendations.push('Optimalkan HPP dengan mencari supplier lebih murah atau substitusi bahan')
      }
      if (summary.revenueGrowth < 0) {
        recommendations.push('Tingkatkan promosi dan pertimbangkan menu baru untuk menarik pelanggan')
      }
      if (summary.expenseGrowth > 10) {
        recommendations.push('Review pengeluaran bulanan dan identifikasi yang bisa dikurangi')
      }
      if (summary.topExpenseCategories[0]?.percentage && summary.topExpenseCategories[0].percentage > 50) {
        recommendations.push(`Diversifikasi pengeluaran - ${summary.topExpenseCategories[0].category} terlalu dominan (${summary.topExpenseCategories[0].percentage.toFixed(0)}%)`)
      }

      return {
        status,
        score,
        cashBalance,
        monthlyBurn,
        runway,
        alerts,
        recommendations
      }
    } catch (error) {
      apiLogger.error({ error, userId }, 'Failed to analyze financial health')
      throw error
    }
  }

  /**
   * Generate cash flow forecast for next 3 months
   */
  async generateForecast(months: number = 3): Promise<CashFlowForecast[]> {
    const userId = this.context.userId

    try {
      // Get historical data (last 6 months)
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      // Get monthly revenue data
      const { data: orders } = await this.context.supabase
        .from('orders')
        .select('total_amount, order_date')
        .eq('user_id', userId)
        .eq('status', 'DELIVERED')
        .gte('order_date', startDate)
        .lte('order_date', endDate)

      // Group by month
      const monthlyRevenue = new Map<string, number>()
      for (const order of orders || []) {
        if (order.order_date) {
          const month = order.order_date.substring(0, 7) // YYYY-MM
          const current = monthlyRevenue.get(month) || 0
          monthlyRevenue.set(month, current + (order.total_amount || 0))
        }
      }

      // Get monthly expenses
      const { data: expenses } = await this.context.supabase
        .from('financial_records')
        .select('amount, date')
        .eq('user_id', userId)
        .eq('type', 'EXPENSE')
        .gte('date', startDate)
        .lte('date', endDate)

      const monthlyExpenses = new Map<string, number>()
      for (const expense of expenses || []) {
        if (expense.date) {
          const month = expense.date.substring(0, 7)
          const current = monthlyExpenses.get(month) || 0
          monthlyExpenses.set(month, current + (expense.amount || 0))
        }
      }

      // Calculate averages and trends
      const revenueValues = Array.from(monthlyRevenue.values())
      const expenseValues = Array.from(monthlyExpenses.values())

      const avgRevenue = revenueValues.length > 0
        ? revenueValues.reduce((a, b) => a + b, 0) / revenueValues.length
        : 0
      const avgExpenses = expenseValues.length > 0
        ? expenseValues.reduce((a, b) => a + b, 0) / expenseValues.length
        : 0

      // Simple trend calculation (last 3 months vs previous 3 months)
      const recentRevenue = revenueValues.slice(-3)
      const olderRevenue = revenueValues.slice(-6, -3)
      const revenueTrend = olderRevenue.length > 0 && recentRevenue.length > 0
        ? (recentRevenue.reduce((a, b) => a + b, 0) / recentRevenue.length) /
          (olderRevenue.reduce((a, b) => a + b, 0) / olderRevenue.length)
        : 1

      // Generate forecasts
      const forecasts: CashFlowForecast[] = []
      const now = new Date()

      for (let i = 1; i <= months; i++) {
        const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
        const monthStr = forecastDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

        // Apply trend and seasonality (simplified)
        const seasonalFactor = this.getSeasonalFactor(forecastDate.getMonth())
        const trendFactor = Math.pow(revenueTrend, i / 3) // Dampen trend over time

        const projectedRevenue = avgRevenue * trendFactor * seasonalFactor
        const projectedExpenses = avgExpenses * (1 + (i * 0.02)) // Assume slight expense growth
        const projectedProfit = projectedRevenue - projectedExpenses

        // Confidence decreases with time
        const confidence = Math.max(50, 90 - (i * 10))

        const factors: string[] = []
        if (seasonalFactor > 1.1) factors.push('Musim ramai (Ramadan/Lebaran)')
        if (seasonalFactor < 0.9) factors.push('Musim sepi')
        if (revenueTrend > 1.05) factors.push('Trend revenue positif')
        if (revenueTrend < 0.95) factors.push('Trend revenue menurun')

        forecasts.push({
          month: monthStr,
          projectedRevenue: Math.round(projectedRevenue),
          projectedExpenses: Math.round(projectedExpenses),
          projectedProfit: Math.round(projectedProfit),
          confidence,
          factors
        })
      }

      return forecasts
    } catch (error) {
      apiLogger.error({ error, userId }, 'Failed to generate forecast')
      throw error
    }
  }

  /**
   * Get seasonal factor for Indonesian market
   */
  private getSeasonalFactor(month: number): number {
    // Indonesian seasonal patterns for food business
    // Ramadan typically March-April, Lebaran April-May
    // Year-end holidays December
    const seasonalFactors: Record<number, number> = {
      0: 0.95,  // January - post holiday slowdown
      1: 0.95,  // February
      2: 1.15,  // March - Ramadan prep
      3: 1.25,  // April - Ramadan peak
      4: 1.20,  // May - Lebaran
      5: 1.00,  // June
      6: 0.95,  // July
      7: 1.05,  // August - Independence Day
      8: 0.95,  // September
      9: 1.00,  // October
      10: 1.05, // November
      11: 1.15  // December - year-end holidays
    }
    return seasonalFactors[month] || 1.0
  }

  /**
   * Analyze profit by product/recipe
   */
  async analyzeProfitByProduct(
    startDate: string,
    endDate: string
  ): Promise<ProfitAnalysis> {
    const userId = this.context.userId

    try {
      // Get order items with recipe info
      const { data: orderItems } = await this.context.supabase
        .from('order_items')
        .select(`
          quantity,
          unit_price,
          total_price,
          recipe_id,
          product_name,
          hpp_at_order,
          orders!inner(user_id, status, order_date),
          recipes(name)
        `)
        .eq('orders.user_id', userId)
        .eq('orders.status', 'DELIVERED')
        .gte('orders.order_date', startDate)
        .lte('orders.order_date', endDate)

      // Get HPP data for recipes (use cost_per_unit)
      const { data: hppData } = await this.context.supabase
        .from('hpp_calculations')
        .select('recipe_id, cost_per_unit')
        .eq('user_id', userId)

      const hppMap = new Map<string, number>()
      for (const hpp of hppData || []) {
        if (hpp.recipe_id) {
          hppMap.set(hpp.recipe_id, hpp.cost_per_unit || 0)
        }
      }

      // Calculate product profitability
      const productStats = new Map<string, {
        name: string
        revenue: number
        cost: number
        salesCount: number
      }>()

      let totalRevenue = 0
      let totalCogs = 0

      for (const item of orderItems || []) {
        const recipeId = item.recipe_id || 'unknown'
        const recipeName = (item.recipes as { name: string } | null)?.name || item.product_name || 'Unknown'
        const revenue = item.total_price || 0
        // Use hpp_at_order if available, otherwise lookup from hppMap
        const hpp = item.hpp_at_order || hppMap.get(recipeId) || 0
        const cost = hpp * (item.quantity || 1)

        totalRevenue += revenue
        totalCogs += cost

        const existing = productStats.get(recipeId) || {
          name: recipeName,
          revenue: 0,
          cost: 0,
          salesCount: 0
        }

        productStats.set(recipeId, {
          name: recipeName,
          revenue: existing.revenue + revenue,
          cost: existing.cost + cost,
          salesCount: existing.salesCount + (item.quantity || 1)
        })
      }

      // Get operational expenses
      const { data: opExpenses } = await this.context.supabase
        .from('financial_records')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'EXPENSE')
        .neq('category', 'Bahan Baku')
        .gte('date', startDate)
        .lte('date', endDate)

      const operationalExpenses = (opExpenses || []).reduce((sum, e) => sum + (e.amount || 0), 0)

      const grossProfit = totalRevenue - totalCogs
      const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
      const netProfit = grossProfit - operationalExpenses
      const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

      // FIXED: Calculate break-even point using correct formula
      // Break-Even Revenue = Fixed Costs / Contribution Margin Ratio
      // Contribution Margin Ratio = Gross Profit / Revenue = grossMargin / 100
      const contributionMarginRatio = grossMargin / 100
      const breakEvenPoint = contributionMarginRatio > 0 
        ? Math.round(operationalExpenses / contributionMarginRatio)
        : 0

      // Format product profitability
      const productProfitability = Array.from(productStats.values())
        .map(p => ({
          name: p.name,
          revenue: p.revenue,
          cost: p.cost,
          profit: p.revenue - p.cost,
          margin: p.revenue > 0 ? ((p.revenue - p.cost) / p.revenue) * 100 : 0,
          salesCount: p.salesCount
        }))
        .sort((a, b) => b.profit - a.profit)

      return {
        totalRevenue,
        totalCogs,
        grossProfit,
        grossMargin,
        operationalExpenses,
        netProfit,
        netMargin,
        breakEvenPoint: Math.round(breakEvenPoint),
        productProfitability
      }
    } catch (error) {
      apiLogger.error({ error, userId }, 'Failed to analyze profit by product')
      throw error
    }
  }

  /**
   * Generate AI insights based on financial data
   */
  async generateAIInsights(summary: FinancialSummary, health: FinancialHealth): Promise<string> {
    const apiKey = process.env['OPENROUTER_API_KEY']
    
    if (!apiKey) {
      // Return template-based insights if no API key
      return this.generateTemplateInsights(summary, health)
    }

    try {
      const prompt = `Kamu adalah FinanceWise AI, asisten keuangan untuk bisnis kuliner UMKM Indonesia.

Berdasarkan data keuangan berikut, berikan insight dan rekomendasi dalam Bahasa Indonesia yang friendly dan actionable:

DATA KEUANGAN:
- Periode: ${summary.period}
- Revenue: Rp ${summary.revenue.toLocaleString('id-ID')}
- Biaya: Rp ${summary.expenses.toLocaleString('id-ID')}
- Profit: Rp ${summary.profit.toLocaleString('id-ID')} (margin ${summary.profitMargin.toFixed(1)}%)
- Pertumbuhan Revenue: ${summary.revenueGrowth >= 0 ? '+' : ''}${summary.revenueGrowth.toFixed(1)}%
- Pertumbuhan Biaya: ${summary.expenseGrowth >= 0 ? '+' : ''}${summary.expenseGrowth.toFixed(1)}%

STATUS KESEHATAN: ${health.status} (skor ${health.score}/100)
- Cash Balance: Rp ${health.cashBalance.toLocaleString('id-ID')}
- Monthly Burn: Rp ${health.monthlyBurn.toLocaleString('id-ID')}
- Runway: ${health.runway.toFixed(1)} bulan

TOP BIAYA:
${summary.topExpenseCategories.map(c => `- ${c.category}: Rp ${c.amount.toLocaleString('id-ID')} (${c.percentage.toFixed(0)}%)`).join('\n')}

TOP PRODUK:
${summary.topRevenueProducts.map(p => `- ${p.name}: Rp ${p.amount.toLocaleString('id-ID')} (${p.percentage.toFixed(0)}%)`).join('\n')}

Berikan:
1. Ringkasan kondisi keuangan (2-3 kalimat)
2. 3 insight utama dengan emoji
3. 2-3 rekomendasi aksi konkret

Format dengan markdown, maksimal 300 kata.`

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000',
          'X-Title': 'FinanceWise AI'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 800
        })
      })

      if (!response.ok) {
        throw new Error('AI API call failed')
      }

      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
      return data.choices?.[0]?.message?.content || this.generateTemplateInsights(summary, health)
    } catch (error) {
      apiLogger.warn({ error }, 'AI insights generation failed, using template')
      return this.generateTemplateInsights(summary, health)
    }
  }

  /**
   * Generate template-based insights when AI is unavailable
   */
  private generateTemplateInsights(summary: FinancialSummary, health: FinancialHealth): string {
    const statusEmoji = {
      excellent: '🟢',
      good: '🟡',
      warning: '🟠',
      critical: '🔴'
    }

    let insights = `## 💰 Ringkasan Keuangan\n\n`
    insights += `Status bisnis kamu: ${statusEmoji[health.status]} **${health.status.toUpperCase()}** (skor ${health.score}/100)\n\n`

    if (summary.profitMargin >= 20) {
      insights += `📈 **Margin profit bagus!** ${summary.profitMargin.toFixed(1)}% - di atas target 20%.\n\n`
    } else if (summary.profitMargin >= 15) {
      insights += `📊 **Margin profit cukup baik** ${summary.profitMargin.toFixed(1)}% - masih bisa dioptimalkan.\n\n`
    } else {
      insights += `⚠️ **Margin profit perlu perhatian** ${summary.profitMargin.toFixed(1)}% - target minimal 15-20%.\n\n`
    }

    insights += `### 💡 Insight Utama\n\n`

    if (summary.revenueGrowth > 0) {
      insights += `✅ Revenue naik ${summary.revenueGrowth.toFixed(1)}% - pertahankan momentum!\n`
    } else if (summary.revenueGrowth < -5) {
      insights += `⚠️ Revenue turun ${Math.abs(summary.revenueGrowth).toFixed(1)}% - perlu strategi baru.\n`
    }

    if (summary.topRevenueProducts[0]) {
      insights += `🏆 Produk terlaris: **${summary.topRevenueProducts[0].name}** (${summary.topRevenueProducts[0].percentage.toFixed(0)}% revenue)\n`
    }

    if (summary.topExpenseCategories[0]) {
      insights += `💸 Biaya terbesar: **${summary.topExpenseCategories[0].category}** (${summary.topExpenseCategories[0].percentage.toFixed(0)}% total biaya)\n`
    }

    insights += `\n### 🎯 Rekomendasi\n\n`

    if (summary.profitMargin < 15) {
      insights += `1. Review HPP dan cari supplier lebih murah\n`
    }
    if (summary.revenueGrowth < 0) {
      insights += `2. Tingkatkan promosi dan pertimbangkan menu baru\n`
    }
    if (health.runway < 3) {
      insights += `3. Jaga cash flow - pastikan modal kerja minimal 3 bulan\n`
    }

    return insights
  }

  /**
   * Get complete FinanceWise analysis
   */
  async getCompleteAnalysis(): Promise<FinanceWiseResponse> {
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const [summary, health, forecast, profitAnalysis] = await Promise.all([
      this.getFinancialSummary(startDate!, endDate!),
      this.analyzeFinancialHealth(),
      this.generateForecast(3),
      this.analyzeProfitByProduct(startDate!, endDate!)
    ])

    const aiInsights = await this.generateAIInsights(summary, health)

    return {
      summary,
      health,
      forecast,
      profitAnalysis,
      aiInsights,
      generatedAt: new Date().toISOString()
    }
  }
}
