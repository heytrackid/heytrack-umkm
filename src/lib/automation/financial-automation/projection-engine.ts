import type { HistoricalData, ProjectionResult, FinancialProjection } from './types'
import { TrendAnalyzer } from './trend-analyzer'

/**
 * Projection Engine Module
 * Handles financial projection and forecasting
 */


export class ProjectionEngine {
  /**
   * Project future financial performance
   */
  static projectFinancialPerformance(
    historicalData: HistoricalData[],
    projectionMonths = 12
  ): ProjectionResult | { error: string } {
    if (historicalData.length < 3) {
      return {
        error: 'Insufficient historical data for projection'
      }
    }

    // Simple linear trend analysis
    const recentData = historicalData.slice(-6) // Last 6 months
    const revenueGrowth = TrendAnalyzer.calculateGrowthRate(recentData.map(d => d.revenue))
    const expenseGrowth = TrendAnalyzer.calculateGrowthRate(recentData.map(d => d.expenses))

    const lastMonth = recentData[recentData.length - 1]
    const projections: FinancialProjection[] = []

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

    const confidence = TrendAnalyzer.calculateProjectionConfidence(
      historicalData.map(d => ({ revenue: d.revenue, expenses: d.expenses }))
    )

    return {
      revenueGrowthRate: revenueGrowth * 100,
      expenseGrowthRate: expenseGrowth * 100,
      projections,
      confidence
    }
  }

  /**
   * Project with seasonal adjustments
   */
  static projectWithSeasonalAdjustments(
    historicalData: HistoricalData[],
    projectionMonths = 12
  ):
    | (ProjectionResult & {
      seasonalFactors: Record<number, number>
    })
    | { error: string } {
    const baseProjection = this.projectFinancialPerformance(historicalData, projectionMonths)
    
    if ('error' in baseProjection) {
      return baseProjection
    }

    // Calculate seasonal factors based on historical data
    const seasonalFactors = this.calculateSeasonalFactors(historicalData)

    // Apply seasonal adjustments to projections
    const adjustedProjections: FinancialProjection[] = baseProjection.projections
      .map((projection) => {
        const seasonalFactor = seasonalFactors[projection.month % 12] ?? 1
        return {
          ...projection,
          revenue: Math.round(projection.revenue * seasonalFactor),
          expenses: Math.round(projection.expenses * seasonalFactor),
        }
      })
      .map((projection) => ({
        ...projection,
        profit: projection.revenue - projection.expenses,
        profitMargin: projection.revenue > 0 ? (projection.profit / projection.revenue) * 100 : 0
      }))

    return {
      ...baseProjection,
      projections: adjustedProjections,
      seasonalFactors
    }
  }

  /**
   * Calculate seasonal factors from historical data
   */
  private static calculateSeasonalFactors(historicalData: HistoricalData[]): Record<number, number> {
    const monthlyData: Record<number, number[]> = {}

    // Group data by month
    historicalData.forEach((data: HistoricalData) => {
      const monthInput = data.month ?? ''
      const parsedMonth = new Date(`${monthInput}-01`)
      if (Number.isNaN(parsedMonth.getTime())) {return}
      const monthIndex = parsedMonth.getMonth()
      if (!monthlyData[monthIndex]) {monthlyData[monthIndex] = []}
      monthlyData[monthIndex].push(data.revenue)
    })

    // Calculate average for each month
    const monthlyAverages: Record<number, number> = {}
    Object.entries(monthlyData).forEach(([month, revenues]) => {
      monthlyAverages[parseInt(month)] = revenues.reduce((sum, r) => sum + r, 0) / revenues.length
    })

    // Calculate overall average
    const overallAverage = Object.values(monthlyAverages).reduce((sum, avg) => sum + avg, 0) / Object.keys(monthlyAverages).length

    // Calculate seasonal factors
    const seasonalFactors: Record<number, number> = {}
    Object.entries(monthlyAverages).forEach(([month, average]) => {
      seasonalFactors[parseInt(month)] = average / overallAverage
    })

    return seasonalFactors
  }

  /**
   * Project with scenario analysis
   */
  static projectScenarios(
    baseHistoricalData: HistoricalData[],
    scenarios: Array<{
      name: string
      revenueMultiplier: number
      expenseMultiplier: number
    }>,
    projectionMonths = 12
  ): Array<{
    scenarioName: string
    projection: ProjectionResult | { error: string }
  }> {
    return scenarios.map(scenario => {
      // Adjust historical data for scenario
      const adjustedData = baseHistoricalData.map((data: HistoricalData) => ({
        ...data,
        revenue: data.revenue * scenario.revenueMultiplier,
        expenses: data.expenses * scenario.expenseMultiplier
      }))

      const projection = this.projectFinancialPerformance(adjustedData, projectionMonths)

      return {
        scenarioName: scenario.name,
        projection
      }
    })
  }

  /**
   * Generate projection insights and recommendations
   */
  static generateProjectionInsights(projection: ProjectionResult): string[] {
    const insights: string[] = []

    if (projection.revenueGrowthRate > 0) {
      insights.push(`📈 Revenue growing at ${(projection.revenueGrowthRate).toFixed(1)}% annually`)
    } else {
      insights.push(`📉 Revenue declining at ${Math.abs(projection.revenueGrowthRate).toFixed(1)}% annually - consider growth strategies`)
    }

    if (projection.expenseGrowthRate > projection.revenueGrowthRate) {
      insights.push(`⚠️ Expenses growing faster than revenue - monitor cost control`)
    }

    const profitableMonths = projection.projections.filter(p => p.profit > 0).length
    const profitabilityRate = (profitableMonths / projection.projections.length) * 100

    if (profitabilityRate < 70) {
      insights.push(`💸 Only ${profitabilityRate.toFixed(0)}% of projected months are profitable`)
    } else {
      insights.push(`✅ ${profitabilityRate.toFixed(0)}% of projected months show profitability`)
    }

    const {confidence} = projection
    if (confidence === 'Low') {
      insights.push(`🎲 Projection confidence is low - consider gathering more historical data`)
    } else if (confidence === 'High') {
      insights.push(`🎯 Projection confidence is high - reliable forecasts`)
    }

    return insights
  }
}
