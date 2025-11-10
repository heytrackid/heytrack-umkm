import type { SaleData, ExpenseData, FinancialTrend } from '@/lib/automation/types'

import type { WeeklyData } from '@/lib/automation/financial-automation/types'

/**
 * Trend Analyzer Module
 * Handles financial trend analysis and forecasting
 */


export class TrendAnalyzer {
  /**
   * Analyze financial trends over time (weekly aggregation)
   */
  static analyzeFinancialTrends(sales: SaleData[], expenses: ExpenseData[]): FinancialTrend[] {
    const trends: FinancialTrend[] = []

    // Group by week for trend analysis
    const weeklyData: Record<string, WeeklyData> = {}

    // Aggregate sales data by week
    sales.forEach(sale => {
      const week = this.getWeekKey(new Date(sale.date))
      if (!weeklyData[week]) {
        weeklyData[week] = { revenue: 0, cost: 0, expenses: 0 }
      }
      weeklyData[week].revenue += sale.amount
      weeklyData[week].cost += sale.cost
    })

    // Aggregate expenses data by week
    expenses.forEach(expense => {
      const week = this.getWeekKey(new Date(expense.date))
      if (!weeklyData[week]) {
        weeklyData[week] = { revenue: 0, cost: 0, expenses: 0 }
      }
      weeklyData[week].expenses += expense.amount
    })

    // Convert to trend data
    Object.entries(weeklyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([period, data]) => {
        const profit = data.revenue - data.cost - data.expenses
        const margin = data.revenue > 0 ? (profit / data.revenue) * 100 : 0

        trends.push({
          period,
          revenue: data.revenue,
          profit,
          margin
        })
      })

    return trends
  }

  /**
   * Calculate growth rates from historical data
   */
  static calculateGrowthRate(values: number[]): number {
    if (values.length < 2) {return 0}

    const firstValue = values[0] ?? 0
    const lastValue = values[values.length - 1] ?? 0
    const periods = values.length - 1

    if (firstValue <= 0) {return 0}

    return (lastValue / firstValue)**(1 / periods) - 1
  }

  /**
   * Calculate projection confidence based on historical data variability
   */
  static calculateProjectionConfidence(
    historicalData: Array<{ revenue: number; expenses: number }>
  ): 'High' | 'Low' | 'Medium' {
    const revenueVariability = this.calculateVariability(historicalData.map(d => d.revenue))

    if (revenueVariability < 0.1) {return 'High'}
    if (revenueVariability < 0.3) {return 'Medium'}
    return 'Low'
  }

  /**
   * Calculate coefficient of variation (variability measure)
   */
  private static calculateVariability(values: number[]): number {
    if (values.length === 0) {return 0}
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + (val - mean)**2, 0) / values.length
    return Math.sqrt(variance) / mean // Coefficient of variation
  }

  /**
   * Generate week key for data aggregation (YYYY-WWW format)
   */
  private static getWeekKey(date: Date): string {
    const year = date.getFullYear()
    const week = Math.ceil(((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7)
    return `${year}-W${week.toString().padStart(2, '0')}`
  }

  /**
   * Detect seasonal patterns in financial data
   */
  static detectSeasonalPatterns(trends: FinancialTrend[]): {
    hasSeasonality: boolean
    peakMonths: number[]
    lowMonths: number[]
    seasonalityStrength: number
  } {
    if (trends.length < 12) {
      return { hasSeasonality: false, peakMonths: [], lowMonths: [], seasonalityStrength: 0 }
    }

    // Group by month and calculate averages
    const monthlyAverages: Record<number, { revenue: number; count: number }> = {}

    trends.forEach(trend => {
      const periodValue = trend.period ?? ''
      const [periodPart = ''] = periodValue.split('-W')
      const monthSegment = periodPart.slice(-2)
      const month = parseInt(monthSegment, 10)
      if (Number.isNaN(month)) {return}
      if (!monthlyAverages[month]) {
        monthlyAverages[month] = { revenue: 0, count: 0 }
      }
      monthlyAverages[month].revenue += trend.revenue
      monthlyAverages[month].count++
    })

    // Calculate average revenue per month
    const monthlyRevenues = Object.entries(monthlyAverages).map(([month, data]) => ({
      month: parseInt(month),
      revenue: data.revenue / data.count
    }))

    const overallAverage = monthlyRevenues.reduce((sum, m) => sum + m.revenue, 0) / monthlyRevenues.length

    // Find peak and low months
    const sortedMonths = monthlyRevenues.sort((a, b) => b.revenue - a.revenue)
    const peakMonths = sortedMonths.slice(0, 2).map(m => m.month)
    const lowMonths = sortedMonths.slice(-2).map(m => m.month)

    // Calculate seasonality strength (coefficient of variation)
    const variances = monthlyRevenues.map(m => (m.revenue - overallAverage)**2)
    const variance = variances.reduce((sum, v) => sum + v, 0) / variances.length
    const seasonalityStrength = Math.sqrt(variance) / overallAverage

    return {
      hasSeasonality: seasonalityStrength > 0.15, // 15% variation threshold
      peakMonths,
      lowMonths,
      seasonalityStrength
    }
  }
}
