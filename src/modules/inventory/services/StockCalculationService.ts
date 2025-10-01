import { Ingredient, StockTransaction, ReorderPoint } from '../types'
import { 
  calculateReorderPoint, 
  calculateUsageRate, 
  getAlertLevel,
  normalizeUnit 
} from '../utils'

/**
 * StockCalculationService
 * Business logic untuk stock calculations yang di-extract dari components
 */
export class StockCalculationService {
  /**
   * Calculate EOQ (Economic Order Quantity)
   */
  static calculateEOQ(
    annualDemand: number,
    orderingCost: number,
    holdingCostPerUnit: number
  ): number {
    if (holdingCostPerUnit === 0) return annualDemand / 12 // fallback monthly
    
    const eoq = Math.sqrt(variance) / holdingCostPerUnit
    return Math.max(1, Math.ceil(eoq))
  }

  /**
   * Calculate safety stock berdasarkan demand variability
   */
  static calculateSafetyStock(
    averageDemand: number,
    maxDemand: number,
    averageLeadTime: number,
    maxLeadTime: number
  ): number {
    const demandVariability = maxDemand - averageDemand
    const leadTimeVariability = maxLeadTime - averageLeadTime
    
    const safetyStock = (demandVariability * averageLeadTime) + 
                       (averageDemand * leadTimeVariability)
    
    return Math.max(0, Math.ceil(safetyStock))
  }

  /**
   * Analyze stock levels dan generate recommendations
   */
  static analyzeStockLevels(
    ingredients: Ingredient[],
    transactions: StockTransaction[]
  ) {
    const analysis = ingredients.map(ingredient => {
      const usageRate = calculateUsageRate(ingredient, transactions)
      const alertLevel = getAlertLevel(ingredient)
      const reorderPoint = calculateReorderPoint(ingredient, 
        transactions.filter(t => t.ingredient_id === ingredient.id)
      )
      
      // Calculate turnover ratio
      const yearlyUsage = usageRate * 365
      const averageStock = ingredient.current_stock ?? 0 + (ingredient.min_stock ?? 0 / 2)
      const turnoverRatio = averageStock > 0 ? yearlyUsage / averageStock : 0
      
      // Generate recommendations
      const recommendations = this.generateStockRecommendations(
        ingredient, 
        usageRate, 
        turnoverRatio,
        alertLevel
      )
      
      return {
        ingredient,
        usageRate,
        alertLevel,
        reorderPoint,
        turnoverRatio,
        recommendations,
        metrics: {
          daysOfStock: usageRate > 0 ? ingredient.current_stock ?? 0 / usageRate : 999,
          stockValue: ingredient.current_stock ?? 0 * ingredient.price_per_unit,
          monthlyBurnRate: usageRate * 30
        }
      }
    })
    
    return analysis
  }

  /**
   * Generate stock recommendations berdasarkan analysis
   */
  private static generateStockRecommendations(
    ingredient: Ingredient,
    usageRate: number,
    turnoverRatio: number,
    alertLevel: 'safe' | 'warning' | 'critical'
  ): string[] {
    const recommendations: string[] = []
    
    // Stock level recommendations
    if (alertLevel === 'critical') {
      recommendations.push('🚨 Stock kritis - segera lakukan pembelian')
    } else if (alertLevel === 'warning') {
      recommendations.push('⚠️ Stock rendah - rencanakan pembelian minggu ini')
    }
    
    // Turnover recommendations
    if (turnoverRatio < 2) {
      recommendations.push('📈 Turnover rendah - pertimbangkan mengurangi stock minimum')
    } else if (turnoverRatio > 12) {
      recommendations.push('🔄 Turnover tinggi - pertimbangkan menaikkan stock minimum')
    }
    
    // Usage pattern recommendations
    if (usageRate > 0) {
      const daysUntilOut = ingredient.current_stock ?? 0 / usageRate
      if (daysUntilOut < 7) {
        recommendations.push('📅 Stock akan habis dalam < 7 hari')
      }
    }
    
    // Price optimization
    if (ingredient.price_per_unit > 0) {
      const stockValue = ingredient.current_stock ?? 0 * ingredient.price_per_unit
      if (stockValue > 5000000) { // 5M rupiah
        recommendations.push('💰 Nilai stock tinggi - monitor usage ketat')
      }
    }
    
    return recommendations
  }

  /**
   * Calculate optimal batch size untuk production
   */
  static calculateOptimalBatchSize(
    recipe: any,
    dailyDemand: number,
    setupCost: number,
    holdingCostPerUnit: number
  ): number {
    // Economic Production Quantity (EPQ) formula
    const productionRate = dailyDemand * 2 // assume production 2x demand rate
    
    if (productionRate <= dailyDemand) {
      return dailyDemand * 7 // fallback: weekly demand
    }
    
    const epq = Math.sqrt(
      (2 * dailyDemand * 365 * setupCost) / 
      (holdingCostPerUnit * (1 - (dailyDemand / productionRate)))
    )
    
    return Math.max(1, Math.ceil(epq))
  }

  /**
   * Forecast future stock needs berdasarkan trend
   */
  static forecastStockNeeds(
    ingredient: Ingredient,
    historicalTransactions: StockTransaction[],
    forecastDays: number = 30
  ) {
    // Simple linear regression for trend
    const usageData = historicalTransactions
      .filter(t => t.ingredient_id === ingredient.id && t.type === 'USAGE')
      .map(t => ({
        date: new Date(t.created_at),
        quantity: Math.abs(t.quantity)
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
    
    if (usageData.length < 2) {
      // Not enough data, use current usage rate
      const currentRate = calculateUsageRate(ingredient, historicalTransactions)
      return {
        forecastedUsage: currentRate * forecastDays,
        trend: 'stable',
        confidence: 'low'
      }
    }
    
    // Calculate trend (simple)
    const totalDays = (usageData[usageData.length - 1].date.getTime() - usageData[0].date.getTime()) / (1000 * 60 * 60 * 24)
    const totalUsage = usageData.reduce((sum, d) => sum + d.quantity, 0)
    const averageDailyUsage = totalUsage / totalDays
    
    // Simple trend calculation
    const firstHalf = usageData.slice(0, Math.floor(usageData.length / 2))
    const secondHalf = usageData.slice(Math.floor(usageData.length / 2))
    
    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.quantity, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.quantity, 0) / secondHalf.length
    
    const trendDirection = secondHalfAvg > firstHalfAvg ? 'increasing' : 
                          secondHalfAvg < firstHalfAvg ? 'decreasing' : 'stable'
    
    const trendFactor = trendDirection === 'increasing' ? 1.1 : 
                       trendDirection === 'decreasing' ? 0.9 : 1.0
    
    return {
      forecastedUsage: averageDailyUsage * forecastDays * trendFactor,
      trend: trendDirection,
      confidence: usageData.length > 10 ? 'high' : 'medium',
      averageDailyUsage,
      recommendedStock: Math.ceil(averageDailyUsage * forecastDays * trendFactor * 1.2) // 20% buffer
    }
  }

  /**
   * Calculate stock optimization score
   */
  static calculateOptimizationScore(ingredient: Ingredient, analysis: any): number {
    let score = 100
    
    // Penalize low turnover
    if (analysis.turnoverRatio < 2) score -= 20
    if (analysis.turnoverRatio < 1) score -= 30
    
    // Penalize stock alerts
    if (analysis.alertLevel === 'warning') score -= 15
    if (analysis.alertLevel === 'critical') score -= 40
    
    // Penalize high stock value without proportional usage
    const stockValue = ingredient.current_stock ?? 0 * ingredient.price_per_unit
    if (stockValue > 2000000 && analysis.usageRate < 1) { // 2M+ rupiah, low usage
      score -= 25
    }
    
    // Reward good turnover
    if (analysis.turnoverRatio >= 4 && analysis.turnoverRatio <= 8) score += 10
    
    return Math.max(0, Math.min(100, score))
  }
}