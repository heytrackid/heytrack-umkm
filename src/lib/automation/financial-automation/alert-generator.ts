import type { FinancialMetrics, Ingredient, FinancialAlert, AutomationConfig } from '@/lib/automation/types'

/**
 * Alert Generator Module
 * Handles financial alert generation based on metrics and thresholds
 */


export class AlertGenerator {
  /**
   * Generate financial alerts based on metrics and inventory
   */
  static generateFinancialAlerts(
    metrics: FinancialMetrics,
    inventory: Ingredient[],
    config: AutomationConfig
  ): FinancialAlert[] {
    const alerts: FinancialAlert[] = []

    // Low profitability alert
    if (metrics.grossMargin < config.lowProfitabilityThreshold) {
      alerts.push({
        type: 'warning',
        message: `Gross margin is below ${config.lowProfitabilityThreshold}%`,
        metric: 'grossMargin',
        value: metrics.grossMargin,
        threshold: config.lowProfitabilityThreshold
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

    // Sort by severity
    const severityOrder: Record<'critical' | 'warning' | 'info', number> = {
      critical: 3,
      warning: 2,
      info: 1
    }

    const getSeverity = (type: FinancialAlert['type']): number =>
      severityOrder[type] ?? 0

    return alerts.sort((a, b) => getSeverity(b.type) - getSeverity(a.type))
  }

  /**
   * Generate alerts for specific financial scenarios
   */
  static generateScenarioAlerts(scenario: string, metrics: FinancialMetrics): FinancialAlert[] {
    const alerts: FinancialAlert[] = []

    switch (scenario) {
      case 'startup':
        if (metrics.netMargin < 5) {
          alerts.push({
            type: 'info',
            message: 'Early-stage business - focus on customer acquisition and product-market fit',
            metric: 'netMargin',
            value: metrics.netMargin,
            threshold: 5
          })
        }
        break

      case 'growth':
        if (metrics.grossMargin < 40) {
          alerts.push({
            type: 'warning',
            message: 'Growth phase - optimize operations to improve margins',
            metric: 'grossMargin',
            value: metrics.grossMargin,
            threshold: 40
          })
        }
        break

      case 'mature':
        if (metrics.netMargin > 30) {
          alerts.push({
            type: 'info',
            message: 'Strong performance - consider expansion or dividend distribution',
            metric: 'netMargin',
            value: metrics.netMargin,
            threshold: 30
          })
        }
        break
    }

    return alerts
  }

  /**
   * Generate alerts for inventory-related financial issues
   */
  static generateInventoryAlerts(metrics: FinancialMetrics, inventory: Ingredient[]): FinancialAlert[] {
    const alerts: FinancialAlert[] = []

    // Dead stock alert
    const oldInventory = inventory.filter(item => {
      // Assume items older than 90 days are potentially dead stock
      const lastUpdated = item.updated_at ? new Date(item.updated_at) : new Date()
      const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceUpdate > 90 && (item.current_stock || 0) > 0
    })

    if (oldInventory.length > 0) {
      const totalValue = oldInventory.reduce((sum, item) =>
        sum + (item.current_stock || 0) * (item.price_per_unit || 0), 0
      )

      alerts.push({
        type: 'warning',
        message: `${oldInventory.length} items may be dead stock (total value: ${totalValue.toLocaleString()})`,
        metric: 'deadStock',
        value: totalValue,
        threshold: metrics.inventoryValue * 0.1 // 10% of inventory value
      })
    }

    return alerts
  }
}
