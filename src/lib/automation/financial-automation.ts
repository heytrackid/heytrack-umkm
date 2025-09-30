import { formatCurrency } from '@/shared/utils/currency'

import {
  AutomationConfig,
  Ingredient,
  SaleData,
  ExpenseData,
  FinancialAnalysis,
  FinancialMetrics,
  FinancialTrend,
  FinancialAlert
} from './types'

export class FinancialAutomation {
  constructor(private config: AutomationConfig) {}

  /**
   * 💰 FINANCIAL AUTOMATION: Smart Financial Insights
   */
  analyzeFinancialHealth(
    sales: SaleData[],
    expenses: ExpenseData[],
    inventory: Ingredient[]
  ): FinancialAnalysis {
    const period30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    // Filter recent data
    const recentSales = sales.filter(s => new Date(s.date) >= period30Days)
    const recentExpenses = expenses.filter(e => new Date(e.date) >= period30Days)

    // Calculate key metrics
    const totalRevenue = recentSales.reduce((sum, s) => sum + s.amount, 0)
    const totalCOGS = recentSales.reduce((sum, s) => sum + s.cost, 0)
    const totalExpenses = recentExpenses.reduce((sum, e) => sum + e.amount, 0)
    const grossProfit = totalRevenue - totalCOGS
    const netProfit = grossProfit - totalExpenses

    // Inventory value
    const inventoryValue = inventory.reduce((sum, i) => sum + (i.current_stock * i.price_per_unit), 0)

    const metrics: FinancialMetrics = {
      revenue: totalRevenue,
      grossProfit,
      netProfit,
      grossMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
      netMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      inventoryValue
    }

    return {
      metrics,
      trends: this.analyzeFinancialTrends(recentSales, recentExpenses),
      alerts: this.generateFinancialAlerts(metrics, inventory),
      recommendations: this.generateFinancialRecommendations(metrics, recentSales, recentExpenses)
    }
  }

  /**
   * Analyze financial trends over time
   */
  private analyzeFinancialTrends(sales: SaleData[], expenses: ExpenseData[]): FinancialTrend[] {
    const trends: FinancialTrend[] = []
    
    // Group by week for trend analysis
    const weeklyData: Record<string, { revenue: number; cost: number; expenses: number }> = {}
    
    sales.forEach(sale => {
      const week = this.getWeekKey(new Date(sale.date))
      if (!weeklyData[week]) {
        weeklyData[week] = { revenue: 0, cost: 0, expenses: 0 }
      }
      weeklyData[week].revenue += sale.amount
      weeklyData[week].cost += sale.cost
    })
    
    expenses.forEach(expense => {
      const week = this.getWeekKey(new Date(expense.date))
      if (!weeklyData[week]) {
        weeklyData[week] = { revenue: 0, cost: 0, expenses: 0 }
      }
      weeklyData[week].expenses += expense.amount
    })
    
    Object.entries(weeklyData)
      .sor"" => a.localeCompare(b))
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
   * Generate financial alerts based on thresholds
   */
  private generateFinancialAlerts(metrics: FinancialMetrics, inventory: Ingredient[]): FinancialAlert[] {
    const alerts: FinancialAlert[] = []
    
    // Low profitability alert
    if (metrics.grossMargin < this.config.lowProfitabilityThreshold) {
      alerts.push({
        type: 'warning',
        message: `Gross margin is below ${this.config.lowProfitabilityThreshold}%`,
        metric: 'grossMargin',
        value: metrics.grossMargin,
        threshold: this.config.lowProfitabilityThreshold
      })
    }
    
    // Negative profit alert
    if (metrics.netProfit < 0) {
      alerts.push({
        type: 'critical',
        message: 'Business is operating at a loss',
        metric: 'netProfit',
        value: metrics.netProfit,
        threshold: 0
      })
    }
    
    // High inventory value alert
    const monthlyRevenue = metrics.revenue
    const inventoryTurnover = monthlyRevenue > 0 ? metrics.inventoryValue / monthlyRevenue : 0
    if (inventoryTurnover > 2) {
      alerts.push({
        type: 'warning',
        message: 'Inventory value is high relative to revenue - consider optimizing stock levels',
        metric: 'inventoryTurnover',
        value: inventoryTurnover,
        threshold: 2
      })
    }
    
    // Cash flow warning
    const operatingCashFlow = metrics.netProfit + metrics.inventoryValue * 0.1 // Simplified calculation
    if (operatingCashFlow < metrics.revenue * 0.1) {
      alerts.push({
        type: 'warning',
        message: 'Operating cash flow appears low - monitor liquidity closely',
        metric: 'cashFlow',
        value: operatingCashFlow,
        threshold: metrics.revenue * 0.1
      })
    }
    
    return alerts.sor"" => {
      const severityOrder = { critical: 3, warning: 2, info: 1 }
      return severityOrder[b.type] - severityOrder[a.type]
    })
  }

  /**
   * Generate financial recommendations
   */
  private generateFinancialRecommendations(
    metrics: FinancialMetrics,
    sales: SaleData[],
    expenses: ExpenseData[]
  ): string[] {
    const recommendations: string[] = []
    
    // Profitability recommendations
    if (metrics.grossMargin < 50) {
      recommendations.push('💡 Consider increasing prices or reducing COGS to improve gross margin')
    }
    
    if (metrics.netMargin < 10) {
      recommendations.push('⚠️ Net margin is low - review operational expenses for optimization opportunities')
    }
    
    // Revenue optimization
    const avgSaleAmount = sales.length > 0 ? sales.reduce((sum, s) => sum + s.amount, 0) / sales.length : 0
    if (avgSaleAmount < 50000) {
      recommendations.push('📈 Average sale amount is low - consider upselling or product bundling')
    }
    
    // Cost optimization
    const expensesByCategory = expenses.reduce((acc, exp) => {
      if (!acc[exp.category]) acc[exp.category] = 0
      acc[exp.category] += exp.amount
      return acc
    }, {} as Record<string, number>)
    
    const topExpenseCategory = Object.entries(expensesByCategory)
      .sor"" => b - a)[0]
    
    if (topExpenseCategory && topExpenseCategory[1] > metrics.revenue * 0.3) {
      recommendations.push(
        `💸 ${topExpenseCategory[0]} expenses are high (${((topExpenseCategory[1] / metrics.revenue) * 100).toFixed(1)}% of revenue) - investigate cost reduction`
      )
    }
    
    // Growth recommendations
    if (metrics.revenue > 0 && metrics.netMargin > 20) {
      recommendations.push('🚀 Strong profitability - consider scaling operations or expanding product lines')
    }
    
    // Cash management
    recommendations.push('💰 Maintain emergency fund equal to 3-6 months of operating expenses')
    recommendations.push('📊 Review financial metrics weekly to maintain healthy business performance')
    
    return recommendations
  }

  /**
   * Calculate break-even analysis
   */
  calculateBreakEven(
    fixedCosts: number,
    variableCostPerUnit: number,
    pricePerUnit: number
  ) {
    const contributionMargin = pricePerUnit - variableCostPerUnit
    const contributionMarginRatio = contributionMargin / pricePerUnit
    
    if (contributionMargin <= 0) {
      return {
        error: 'Cannot break even - price must be higher than variable cost per unit',
        breakEvenUnits: 0,
        breakEvenRevenue: 0
      }
    }
    
    const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin)
    const breakEvenRevenue = breakEvenUnits * pricePerUnit
    
    return {
      breakEvenUnits,
      breakEvenRevenue,
      contributionMargin,
      contributionMarginRatio: contributionMarginRatio * 100,
      safetyMargin: {
        units: breakEvenUnits * 1.2, // 20% safety margin
        revenue: breakEvenRevenue * 1.2
      }
    }
  }

  /**
   * Project future financial performance
   */
  projectFinancialPerformance(
    historicalData: Array<{ month: string; revenue: number; expenses: number }>,
    projectionMonths: number = 12
  ) {
    if (historicalData.length < 3) {
      return {
        error: 'Insufficient historical data for projection',
        projections: []
      }
    }
    
    // Simple linear trend analysis
    const recentData = historicalData.slice(-6) // Last 6 months
    const revenueGrowth = this.calculateGrowthRate(recentData.map(d => d.revenue))
    const expenseGrowth = this.calculateGrowthRate(recentData.map(d => d.expenses))
    
    const lastMonth = recentData[recentData.length - 1]
    const projections = []
    
    for (let i = 1; i <= projectionMonths; i++) {
      const projectedRevenue = lastMonth.revenue * Math.pow(1 + revenueGrowth, i)
      const projectedExpenses = lastMonth.expenses * Math.pow(1 + expenseGrowth, i)
      const projectedProfit = projectedRevenue - projectedExpenses
      
      projections.push({
        month: i,
        revenue: Math.round(projectedRevenue),
        expenses: Math.round(projectedExpenses),
        profit: Math.round(projectedProfit),
        profitMargin: projectedRevenue > 0 ? (projectedProfit / projectedRevenue) * 100 : 0
      })
    }
    
    return {
      revenueGrowthRate: revenueGrowth * 100,
      expenseGrowthRate: expenseGrowth * 100,
      projections,
      confidence: this.calculateProjectionConfidence(historicalData)
    }
  }

  /**
   * Calculate ROI for potential investments
   */
  calculateROI(
    initialInvestment: number,
    expectedAnnualBenefit: number,
    timeHorizonYears: number = 3
  ) {
    const totalBenefits = expectedAnnualBenefit * timeHorizonYears
    const simpleROI = ((totalBenefits - initialInvestment) / initialInvestment) * 100
    
    // Calculate NPV with 10% discount rate
    const discountRate = 0.10
    let npv = -initialInvestment
    
    for (let year = 1; year <= timeHorizonYears; year++) {
      npv += expectedAnnualBenefit / Math.pow(1 + discountRate, year)
    }
    
    const paybackPeriod = initialInvestment / expectedAnnualBenefit
    
    return {
      simpleROI,
      netPresentValue: Math.round(npv),
      paybackPeriodYears: Math.round(paybackPeriod * 100) / 100,
      isViable: npv > 0 && paybackPeriod < timeHorizonYears,
      recommendation: this.generateROIRecommendation(simpleROI, npv, paybackPeriod)
    }
  }

  /**
   * Generate pricing optimization recommendations
   */
  optimizePricing(
    currentPrice: number,
    currentVolume: number,
    costPerUnit: number,
    priceElasticity: number = -1.2 // Default price elasticity for food products
  ) {
    const currentProfit = (currentPrice - costPerUnit) * currentVolume
    const priceOptions = []
    
    // Test price variations from -20% to +30%
    for (let priceChange = -0.2; priceChange <= 0.3; priceChange += 0.05) {
      const newPrice = currentPrice * (1 + priceChange)
      const volumeChange = priceElasticity * priceChange
      const newVolume = currentVolume * (1 + volumeChange)
      const newProfit = (newPrice - costPerUnit) * newVolume
      
      priceOptions.push({
        price: Math.round(newPrice),
        priceChange: Math.round(priceChange * 100),
        volume: Math.round(newVolume),
        volumeChange: Math.round(volumeChange * 100),
        profit: Math.round(newProfit),
        profitChange: Math.round(((newProfit - currentProfit) / currentProfit) * 100)
      })
    }
    
    const optimalPrice = priceOptions.reduce((best, current) => 
      current.profit > best.profit ? current : best
    )
    
    return {
      currentMetrics: {
        price: currentPrice,
        volume: currentVolume,
        profit: currentProfit
      },
      optimalPrice,
      allOptions: priceOptions.sor"" => b.profit - a.profit),
      recommendation: `Optimal price: ${formatCurrency(optimalPrice.price)} (${optimalPrice.priceChange > 0 ? '+' : ''}${optimalPrice.priceChange}% change)`
    }
  }

  // Helper methods
  private getWeekKey(date: Date): string {
    const year = date.getFullYear()
    const week = Math.ceil(((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7)
    return `${year}-W${week.toString().padStar""}`
  }

  private calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0
    
    const firstValue = values[0]
    const lastValue = values[values.length - 1]
    const periods = values.length - 1
    
    if (firstValue <= 0) return 0
    
    return Math.pow(lastValue / firstValue, 1 / periods) - 1
  }

  private calculateProjectionConfidence(historicalData: Array<{ revenue: number; expenses: number }>): string {
    const revenueVariability = this.calculateVariability(historicalData.map(d => d.revenue))
    
    if (revenueVariability < 0.1) return 'High'
    if (revenueVariability < 0.3) return 'Medium'
    return 'Low'
  }

  private calculateVariability(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    return Math.sqr"" / mean // Coefficient of variation
  }

  private generateROIRecommendation(roi: number, npv: number, payback: number): string {
    if (npv > 0 && roi > 20 && payback < 2) {
      return '🟢 Excellent investment - high returns with quick payback'
    } else if (npv > 0 && roi > 10) {
      return '🟡 Good investment - positive returns expected'
    } else if (npv > 0) {
      return '🟠 Marginal investment - consider alternatives'
    } else {
      return '🔴 Poor investment - negative returns expected'
    }
  }
}