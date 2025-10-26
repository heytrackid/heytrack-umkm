import type {
  AutomationConfig,
  Ingredient,
  InventoryAnalysis,
  InventoryStatus,
  ReorderUrgency
} from './types'

export class InventoryAutomation {
  constructor(private config: AutomationConfig) {}

  /**
   * 📊 INVENTORY AUTOMATION: Smart Stock Management
   */
  analyzeInventoryNeeds(
    ingredients: Ingredient[], 
    usageData: Record<string, number>
  ): InventoryAnalysis[] {
    return ingredients.map(ingredient => {
      const monthlyUsage = usageData[ingredient.id] || 0
      const dailyUsage = monthlyUsage / 30
      const daysRemaining = dailyUsage > 0 ? (ingredient.current_stock ?? 0) / dailyUsage : Infinity

      // Smart reorder calculation
      const reorderPoint = dailyUsage * this.config.autoReorderDays
      const optimalOrderQuantity = this.calculateEconomicOrderQuantity(ingredient, monthlyUsage)

      return {
        ingredient,
        status: this.getInventoryStatus(daysRemaining, ingredient.current_stock ?? 0, ingredient.min_stock ?? 0),
        daysRemaining: Math.floor(daysRemaining),
        reorderRecommendation: {
          shouldReorder: ingredient.current_stock ?? 0 <= reorderPoint,
          quantity: optimalOrderQuantity,
          urgency: this.getReorderUrgency(daysRemaining),
          estimatedCost: optimalOrderQuantity * ingredient.price_per_unit
        },
        insights: this.generateInventoryInsights(ingredient, dailyUsage, daysRemaining)
      }
    }) as InventoryAnalysis[]
  }

  /**
   * Calculate Economic Order Quantity (EOQ)
   */
  private calculateEconomicOrderQuantity(ingredient: Ingredient, monthlyUsage: number): number {
    // Simplified EOQ calculation
    const annualDemand = monthlyUsage * 12
    const orderingCost = 50000 // Rp 50k per order (delivery, admin, etc.)
    const holdingCostRate = 0.2 // 20% of item value per year
    const holdingCost = ingredient.price_per_unit * holdingCostRate

    if (holdingCost <= 0) {return ingredient.min_stock ?? 0}

    const eoq = Math.sqrt(2 * annualDemand * orderingCost / holdingCost)
    return Math.max(eoq, ingredient.min_stock ?? 0) // At least minimum stock
  }

  /**
   * Determine inventory status based on current levels
   */
  private getInventoryStatus(
    daysRemaining: number, 
    currentStock: number, 
    minStock: number
  ): InventoryStatus {
    if (currentStock <= minStock * 0.5) {return 'critical'}
    if (currentStock <= minStock) {return 'low'}
    if (currentStock > minStock * 3) {return 'overstocked'}
    return 'adequate'
  }

  /**
   * Determine reorder urgency
   */
  private getReorderUrgency(daysRemaining: number): ReorderUrgency {
    if (daysRemaining <= 3) {return 'urgent'}
    if (daysRemaining <= 7) {return 'soon'}
    return 'normal'
  }

  /**
   * Generate inventory insights and recommendations
   */
  private generateInventoryInsights(
    ingredient: Ingredient, 
    dailyUsage: number, 
    daysRemaining: number
  ): string[] {
    const insights: string[] = []
    
    if (daysRemaining < 7) {
      insights.push(`⚠️ Akan habis dalam ${Math.floor(daysRemaining)} hari`)
    }
    
    if (dailyUsage > 0) {
      const monthlyUsage = dailyUsage * 30
      insights.push(`📊 Pemakaian bulanan: ${monthlyUsage.toFixed(1)} ${ingredient.unit}`)
      
      // Velocity insights
      if (dailyUsage > (ingredient.min_stock ?? 0) / 30) {
        insights.push(`🚀 Bahan fast-moving, pertimbangkan stok buffer lebih besar`)
      }
    } else {
      insights.push(`📉 Tidak ada pemakaian dalam 30 hari terakhir`)
    }

    // Cost efficiency insights
    const monthlyValue = dailyUsage * 30 * ingredient.price_per_unit
    if (monthlyValue > 1000000) { // > 1M per month
      insights.push(`💰 High-value ingredient (${(monthlyValue/1000000).toFixed(1)}M/bulan)`)
    }

    // Storage insights
    if ((ingredient.current_stock ?? 0) > (ingredient.min_stock ?? 0) * 5) {
      insights.push(`📦 Possible overstocking, review purchasing patterns`)
    }

    return insights
  }

  /**
   * Predict future inventory needs based on trends
   */
  predictInventoryNeeds(
    ingredients: Ingredient[],
    historicalUsage: Record<string, Array<{ date: string; quantity: number }>>,
    forecastDays: number = 30
  ) {
    return ingredients.map(ingredient => {
      const usage = historicalUsage[ingredient.id] || []
      
      if (usage.length < 7) {
        return {
          ingredient,
          forecast: 'insufficient_data',
          recommendation: 'Monitor usage for better predictions'
        }
      }

      // Simple linear trend analysis
      const sortedUsage = usage.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const recentUsage = sortedUsage.slice(-14) // Last 14 days
      const avgDailyUsage = recentUsage.reduce((sum, u) => sum + u.quantity, 0) / recentUsage.length

      // Trend calculation
      let trend = 0
      if (recentUsage.length > 1) {
        const firstHalf = recentUsage.slice(0, Math.floor(recentUsage.length / 2))
        const secondHalf = recentUsage.slice(Math.floor(recentUsage.length / 2))
        const firstAvg = firstHalf.reduce((sum, u) => sum + u.quantity, 0) / firstHalf.length
        const secondAvg = secondHalf.reduce((sum, u) => sum + u.quantity, 0) / secondHalf.length
        trend = (secondAvg - firstAvg) / firstAvg
      }

      const projectedDailyUsage = avgDailyUsage * (1 + trend)
      const projectedTotalUsage = projectedDailyUsage * forecastDays
      const currentDaysSupply = ingredient.current_stock ?? 0 / projectedDailyUsage

      return {
        ingredient,
        forecast: {
          projectedDailyUsage,
          projectedTotalUsage,
          currentDaysSupply: Math.floor(currentDaysSupply),
          trend: trend > 0.1 ? 'increasing' : trend < -0.1 ? 'decreasing' : 'stable'
        },
        recommendation: this.generateForecastRecommendation(
          ingredient, 
          currentDaysSupply, 
          projectedTotalUsage, 
          trend
        )
      }
    })
  }

  /**
   * Generate forecast-based recommendations
   */
  private generateForecastRecommendation(
    ingredient: Ingredient,
    daysSupply: number,
    projectedUsage: number,
    trend: number
  ): string {
    if (daysSupply < 7) {
      return `🚨 URGENT: Reorder ${Math.ceil(projectedUsage * 1.5)} ${ingredient.unit} immediately`
    }
    
    if (daysSupply < 14) {
      return `⚠️ Schedule reorder of ${Math.ceil(projectedUsage)} ${ingredient.unit} within 7 days`
    }
    
    if (trend > 0.2) {
      return `📈 Usage increasing rapidly (+${(trend*100).toFixed(0)}%), consider larger orders`
    }
    
    if (trend < -0.2) {
      return `📉 Usage declining (${(trend*100).toFixed(0)}%), reduce order quantities`
    }
    
    return `✅ Current stock adequate for ${Math.floor(daysSupply)} days`
  }

  /**
   * Generate automated purchase orders
   */
  generateAutoPurchaseOrders(inventoryAnalysis: InventoryAnalysis[]) {
    const urgentReorders = inventoryAnalysis
      .filter(analysis => analysis.reorderRecommendation.shouldReorder)
      .sort((a, b) => {
        const urgencyOrder = { urgent: 3, soon: 2, normal: 1 }
        return urgencyOrder[b.reorderRecommendation.urgency] - urgencyOrder[a.reorderRecommendation.urgency]
      })

    return {
      orders: urgentReorders.map(analysis => ({
        ingredient: analysis.ingredient,
        quantity: analysis.reorderRecommendation.quantity,
        estimatedCost: analysis.reorderRecommendation.estimatedCost,
        urgency: analysis.reorderRecommendation.urgency,
        daysRemaining: analysis.daysRemaining,
        supplier: this.suggestOptimalSupplier(analysis.ingredient)
      })),
      summary: {
        totalItems: urgentReorders.length,
        totalCost: urgentReorders.reduce((sum, a) => sum + a.reorderRecommendation.estimatedCost, 0),
        urgentCount: urgentReorders.filter(a => a.reorderRecommendation.urgency === 'urgent').length
      }
    }
  }

  /**
   * Suggest optimal supplier based on price, quality, delivery time
   */
  private suggestOptimalSupplier(ingredient: Ingredient) {
    // This would integrate with supplier database
    // For now, return default suggestion
    return {
      name: 'Default Supplier',
      deliveryDays: 2,
      minOrder: ingredient.min_stock ?? 0,
      reliability: 95
    }
  }

  /**
   * Calculate inventory carrying costs
   */
  calculateCarryingCosts(ingredients: Ingredient[]) {
    const holdingCostRate = 0.25 // 25% per year
    
    return ingredients.map(ingredient => {
      const inventoryValue = ingredient.current_stock ?? 0 * ingredient.price_per_unit
      const annualCarryingCost = inventoryValue * holdingCostRate
      const monthlyCarryingCost = annualCarryingCost / 12

      return {
        ingredient,
        inventoryValue,
        annualCarryingCost,
        monthlyCarryingCost,
        turnoverRate: this.calculateTurnoverRate(ingredient),
        efficiency: this.calculateStorageEfficiency(ingredient)
      }
    }).sort((a, b) => b.monthlyCarryingCost - a.monthlyCarryingCost)
  }

  /**
   * Calculate inventory turnover rate
   */
  private calculateTurnoverRate(ingredient: Ingredient): number {
    // Simplified calculation - would use actual historical data
    const avgStock = (ingredient.current_stock ?? 0 + ingredient.min_stock) / 2
    const estimatedMonthlyCOGS = avgStock * ingredient.price_per_unit * 0.1 // Assume 10% monthly usage
    
    if (avgStock === 0) {return 0}
    return estimatedMonthlyCOGS / (avgStock * ingredient.price_per_unit) * 12
  }

  /**
   * Calculate storage efficiency score
   */
  private calculateStorageEfficiency(ingredient: Ingredient): number {
    const optimalStock = ingredient.min_stock ?? 0 * 2 // Optimal is 2x minimum
    const currentRatio = ingredient.current_stock ?? 0 / optimalStock
    
    // Efficiency score: 100% when at optimal, decreases with over/understocking
    if (currentRatio <= 1) {return currentRatio * 100}
    return Math.max(0, 100 - (currentRatio - 1) * 50)
  }
}