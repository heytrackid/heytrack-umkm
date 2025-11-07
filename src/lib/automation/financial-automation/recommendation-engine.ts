import type { FinancialMetrics, SaleData, ExpenseData } from '@/lib/automation/types'

/**
 * Recommendation Engine Module
 * Generates financial recommendations and insights
 */


export class RecommendationEngine {
  /**
   * Generate comprehensive financial recommendations
   */
  static generateFinancialRecommendations(
    metrics: FinancialMetrics,
    sales: SaleData[],
    expenses: ExpenseData[]
  ): string[] {
    const recommendations: string[] = []

    // Profitability recommendations
    recommendations.push(...this.generateProfitabilityRecommendations(metrics))

    // Revenue optimization recommendations
    recommendations.push(...this.generateRevenueRecommendations(metrics, sales))

    // Cost optimization recommendations
    recommendations.push(...this.generateCostRecommendations(metrics, expenses))

    // Growth recommendations
    recommendations.push(...this.generateGrowthRecommendations(metrics))

    // Cash management recommendations
    recommendations.push(...this.generateCashManagementRecommendations())

    return recommendations
  }

  /**
   * Generate profitability-focused recommendations
   */
  private static generateProfitabilityRecommendations(metrics: FinancialMetrics): string[] {
    const recommendations: string[] = []

    if (metrics.grossMargin < 50) {
      recommendations.push('💡 Consider increasing prices or reducing COGS to improve gross margin')
    }

    if (metrics.netMargin < 10) {
      recommendations.push('⚠️ Net margin is low - review operational expenses for optimization opportunities')
    }

    if (metrics.netProfit < 0) {
      recommendations.push('🚨 Business is operating at a loss - immediate cost reduction and revenue increase needed')
    }

    return recommendations
  }

  /**
   * Generate revenue optimization recommendations
   */
  private static generateRevenueRecommendations(_metrics: FinancialMetrics, sales: SaleData[]): string[] {
    const recommendations: string[] = []

    const avgSaleAmount = sales.length > 0 ? sales.reduce((sum, s) => sum + s.amount, 0) / sales.length : 0
    if (avgSaleAmount < 50000) {
      recommendations.push('📈 Average sale amount is low - consider upselling or product bundling')
    }

    // Check for seasonal patterns
    const monthlySales = this.groupSalesByMonth(sales)
    const salesVariability = this.calculateVariability(Object.values(monthlySales))
    if (salesVariability > 0.3) {
      recommendations.push('📊 Revenue shows high seasonality - consider marketing campaigns during low periods')
    }

    return recommendations
  }

  /**
   * Generate cost optimization recommendations
   */
  private static generateCostRecommendations(metrics: FinancialMetrics, expenses: ExpenseData[]): string[] {
    const recommendations: string[] = []

    const expensesByCategory = expenses.reduce<Record<string, number>>((acc, exp) => {
      const categoryKey = exp.category ?? 'uncategorized'
      if (!acc[categoryKey]) {acc[categoryKey] = 0}
      acc[categoryKey] += exp.amount
      return acc
    }, {})

    const topExpenseCategoryEntry = (Object.entries(expensesByCategory))
      .sort(([,a], [,b]) => b - a)[0]

    const topExpenseCategory: [string, number] | undefined = topExpenseCategoryEntry

    if (topExpenseCategory && topExpenseCategory[1] > metrics.revenue * 0.3) {
      recommendations.push(
        `💸 ${topExpenseCategory[0]} expenses are high (${((topExpenseCategory[1] / metrics.revenue) * 100).toFixed(1)}% of revenue) - investigate cost reduction`
      )
    }

    // Check for expense growth rate
    const recentExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return expenseDate >= thirtyDaysAgo
    })

    const expenseTotal = recentExpenses.reduce((sum, e) => sum + e.amount, 0)
    if (expenseTotal > metrics.revenue * 0.8) {
      recommendations.push('⚠️ Expenses are very high relative to revenue - focus on cost control')
    }

    return recommendations
  }

  /**
   * Generate growth-focused recommendations
   */
  private static generateGrowthRecommendations(metrics: FinancialMetrics): string[] {
    const recommendations: string[] = []

    if (metrics.revenue > 0 && metrics.netMargin > 20) {
      recommendations.push('🚀 Strong profitability - consider scaling operations or expanding product lines')
    }

    if (metrics.grossMargin > 60 && metrics.netMargin > 25) {
      recommendations.push('💪 Excellent financial health - good time to invest in growth initiatives')
    }

    if (metrics.inventoryValue > metrics.revenue * 2) {
      recommendations.push('📦 High inventory levels - consider faster inventory turnover or storage optimization')
    }

    return recommendations
  }

  /**
   * Generate cash management recommendations
   */
  private static generateCashManagementRecommendations(): string[] {
    return [
      '💰 Maintain emergency fund equal to 3-6 months of operating expenses',
      '📊 Review financial metrics weekly to maintain healthy business performance',
      '🔄 Monitor cash flow patterns and plan for seasonal variations'
    ]
  }

  /**
   * Group sales by month for analysis
   */
  private static groupSalesByMonth(sales: SaleData[]): Record<string, number> {
    return sales.reduce((acc, sale) => {
      const month = new Date(sale.date).toISOString().slice(0, 7) // YYYY-MM format
      acc[month] = (acc[month] || 0) + sale.amount
      return acc
    }, {} as Record<string, number>)
  }

  /**
   * Calculate coefficient of variation for variability analysis
   */
  private static calculateVariability(values: number[]): number {
    if (values.length === 0) {
      return 0
    }

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + (val - mean)**2, 0) / values.length
    return Math.sqrt(variance) / mean // Coefficient of variation
  }

  /**
   * Generate strategic recommendations based on business stage
   */
  static generateStrategicRecommendations(
    metrics: FinancialMetrics,
    businessStage: 'growth' | 'mature' | 'startup'
  ): string[] {
    const recommendations: string[] = []

    switch (businessStage) {
      case 'startup':
        if (metrics.netProfit < 0) {
          recommendations.push('🎯 Focus on achieving profitability before scaling')
          recommendations.push('📈 Prioritize high-margin products/services')
        } else {
          recommendations.push('✅ Profitable startup - focus on customer acquisition and market expansion')
        }
        break

      case 'growth':
        recommendations.push('📊 Invest in marketing and sales to accelerate growth')
        recommendations.push('👥 Consider hiring to support expansion')
        recommendations.push('🏭 Optimize operations to maintain margins during growth')
        break

      case 'mature':
        recommendations.push('💼 Focus on market share maintenance and competitive advantages')
        recommendations.push('🔬 Invest in R&D for product innovation')
        recommendations.push('📈 Consider diversification or adjacent markets')
        break

      default:
        // No specific recommendations for unknown business stages
        break
    }

    return recommendations
  }
}
