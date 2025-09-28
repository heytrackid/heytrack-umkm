import { AutomationConfig } from './types'
import { PricingAutomation } from './pricing-automation'
import { InventoryAutomation } from './inventory-automation'
import { ProductionAutomation } from './production-automation'
import { FinancialAutomation } from './financial-automation'
import { NotificationSystem } from './notification-system'

// Export all types
export * from './types'
export type { AutomationConfig } from './types'

// Export individual modules
export { PricingAutomation } from './pricing-automation'
export { InventoryAutomation } from './inventory-automation'
export { ProductionAutomation } from './production-automation'
export { FinancialAutomation } from './financial-automation'
export { NotificationSystem } from './notification-system'

/**
 * Smart Automation Engine for UMKM F&B
 * Modular system that handles automatic calculations, notifications, and business logic
 * 
 * Usage:
 * ```typescript
 * const automationEngine = new AutomationEngine({
 *   defaultProfitMargin: 60,
 *   autoReorderDays: 7,
 *   // ... other config
 * })
 * 
 * // Use individual modules
 * const pricing = automationEngine.pricing.calculateSmartPricing(recipe)
 * const inventory = automationEngine.inventory.analyzeInventoryNeeds(ingredients, usage)
 * const production = automationEngine.production.generateProductionPlan(orders, recipes, inventory)
 * const notifications = automationEngine.notifications.generateSmartNotifications(...)
 * ```
 */
export class AutomationEngine {
  public readonly pricing: PricingAutomation
  public readonly inventory: InventoryAutomation
  public readonly production: ProductionAutomation
  public readonly financial: FinancialAutomation
  public readonly notifications: NotificationSystem
  
  constructor(config?: Partial<AutomationConfig>) {
    const defaultConfig: AutomationConfig = {
      defaultProfitMargin: 60, // 60% margin
      minimumProfitMargin: 30,
      maximumProfitMargin: 200,
      autoReorderDays: 7,
      safetyStockMultiplier: 1.5,
      productionLeadTime: 4, // 4 hours
      batchOptimizationThreshold: 5,
      lowProfitabilityThreshold: 20,
      cashFlowWarningDays: 7,
      ...config
    }

    // Initialize all automation modules
    this.pricing = new PricingAutomation(defaultConfig)
    this.inventory = new InventoryAutomation(defaultConfig)
    this.production = new ProductionAutomation(defaultConfig)
    this.financial = new FinancialAutomation(defaultConfig)
    this.notifications = new NotificationSystem(defaultConfig)
  }

  /**
   * Get comprehensive business health overview
   * Combines insights from all automation modules
   */
  async getBusinessHealthOverview(data: {
    recipes: any[]
    ingredients: any[]
    orders: any[]
    sales: any[]
    expenses: any[]
    usageData: Record<string, number>
  }) {
    const { recipes, ingredients, orders, sales, expenses, usageData } = data

    // Get insights from each module
    const inventoryAnalysis = this.inventory.analyzeInventoryNeeds(ingredients, usageData)
    const financialAnalysis = this.financial.analyzeFinancialHealth(sales, expenses, ingredients)
    
    // Generate notifications based on all data
    const notifications = this.notifications.generateSmartNotifications(
      ingredients,
      orders.map(o => ({ delivery_date: o.delivery_date, status: o.status })),
      financialAnalysis.metrics
    )

    // Calculate overall health score
    const healthScore = this.calculateOverallHealthScore({
      inventory: inventoryAnalysis,
      financial: financialAnalysis,
      notifications
    })

    return {
      healthScore,
      inventory: {
        analysis: inventoryAnalysis,
        criticalCount: inventoryAnalysis.filter(a => a.status === 'critical').length,
        lowStockCount: inventoryAnalysis.filter(a => a.status === 'low').length,
        reorderCount: inventoryAnalysis.filter(a => a.reorderRecommendation.shouldReorder).length
      },
      financial: financialAnalysis,
      notifications: {
        all: notifications,
        summary: this.notifications.getNotificationSummary(notifications),
        urgent: notifications.filter(n => n.priority === 'high').slice(0, 5)
      },
      recommendations: this.generateBusinessRecommendations({
        inventoryAnalysis,
        financialAnalysis,
        notifications
      })
    }
  }

  /**
   * Calculate overall business health score (0-100)
   */
  private calculateOverallHealthScore(data: {
    inventory: any[]
    financial: any
    notifications: any[]
  }): number {
    let score = 100

    // Inventory health (30% weight)
    const criticalStockPenalty = data.inventory.filter(a => a.status === 'critical').length * 10
    const lowStockPenalty = data.inventory.filter(a => a.status === 'low').length * 5
    score -= Math.min(criticalStockPenalty + lowStockPenalty, 30)

    // Financial health (40% weight)
    if (data.financial.metrics.netProfit < 0) {
      score -= 25 // Major penalty for losses
    } else if (data.financial.metrics.netMargin < 10) {
      score -= 15 // Penalty for low margins
    }
    
    if (data.financial.metrics.grossMargin < 30) {
      score -= 10 // Penalty for very low gross margins
    }

    // Notification urgency (30% weight)
    const criticalNotifications = data.notifications.filter(n => n.type === 'critical').length
    const warningNotifications = data.notifications.filter(n => n.type === 'warning').length
    score -= criticalNotifications * 8 + warningNotifications * 3

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Generate comprehensive business recommendations
   */
  private generateBusinessRecommendations(data: {
    inventoryAnalysis: any[]
    financialAnalysis: any
    notifications: any[]
  }): string[] {
    const recommendations: string[] = []

    // Top priority recommendations based on critical issues
    const criticalStock = data.inventoryAnalysis.filter(a => a.status === 'critical').length
    if (criticalStock > 0) {
      recommendations.push(`🚨 URGENT: ${criticalStock} bahan dalam stok kritis - restock immediately`)
    }

    if (data.financialAnalysis.metrics.netProfit < 0) {
      recommendations.push('🔴 CRITICAL: Business operating at loss - immediate financial review needed')
    }

    // Include financial recommendations
    recommendations.push(...data.financialAnalysis.recommendations.slice(0, 3))

    // Include inventory insights
    const urgentReorders = data.inventoryAnalysis
      .filter(a => a.reorderRecommendation.urgency === 'urgent')
      .slice(0, 2)
    
    urgentReorders.forEach(item => {
      recommendations.push(`📦 Urgent reorder: ${item.ingredient.name} (${item.daysRemaining} days left)`)
    })

    // Operational excellence recommendations
    if (data.financialAnalysis.metrics.grossMargin > 50 && data.financialAnalysis.metrics.netMargin > 15) {
      recommendations.push('🚀 Strong financial position - consider expansion or new product lines')
    }

    return recommendations.slice(0, 8) // Limit to top 8 recommendations
  }

  /**
   * Quick business status check
   * Returns simplified status for dashboard widgets
   */
  getQuickStatus(data: {
    ingredients: any[]
    financialMetrics: any
    orders: any[]
  }) {
    const now = new Date()
    
    return {
      inventory: {
        status: this.getInventoryStatus(data.ingredients),
        criticalCount: data.ingredients.filter(ing => ing.current_stock <= ing.min_stock * 0.5).length
      },
      financial: {
        status: this.getFinancialStatus(data.financialMetrics),
        netMargin: data.financialMetrics.netMargin
      },
      production: {
        status: this.getProductionStatus(data.orders, now),
        urgentOrders: data.orders.filter(order => {
          const deliveryDate = new Date(order.delivery_date)
          const hoursUntilDelivery = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60)
          return hoursUntilDelivery <= 24 && hoursUntilDelivery > 0
        }).length
      }
    }
  }

  private getInventoryStatus(ingredients: any[]): 'good' | 'warning' | 'critical' {
    const criticalCount = ingredients.filter(ing => ing.current_stock <= ing.min_stock * 0.5).length
    const lowCount = ingredients.filter(ing => ing.current_stock <= ing.min_stock).length
    
    if (criticalCount > 0) return 'critical'
    if (lowCount > 2) return 'warning'
    return 'good'
  }

  private getFinancialStatus(metrics: any): 'good' | 'warning' | 'critical' {
    if (metrics.netProfit < 0) return 'critical'
    if (metrics.netMargin < 10) return 'warning'
    return 'good'
  }

  private getProductionStatus(orders: any[], now: Date): 'good' | 'warning' | 'critical' {
    const overdueCount = orders.filter(order => {
      const deliveryDate = new Date(order.delivery_date)
      return deliveryDate < now && order.status !== 'DELIVERED'
    }).length
    
    const urgentCount = orders.filter(order => {
      const deliveryDate = new Date(order.delivery_date)
      const hoursUntilDelivery = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60)
      return hoursUntilDelivery <= 8 && hoursUntilDelivery > 0
    }).length
    
    if (overdueCount > 0) return 'critical'
    if (urgentCount > 3) return 'warning'
    return 'good'
  }
}

// Create a default instance with standard configuration
export const defaultAutomationEngine = new AutomationEngine()

// Backwards compatibility - export the class as default
export default AutomationEngine