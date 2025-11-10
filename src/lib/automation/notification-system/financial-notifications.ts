import { formatCurrency, getCurrentCurrency } from '@/lib/currency'

import type { SmartNotification, FinancialMetrics, AutomationConfig } from '@/lib/automation/notification-system/types'

/**
 * Financial Notifications Module
 * Handles financial-related notification generation
 */


export class FinancialNotifications {
  /**
   * Generate financial-related notifications
   */
  static generateFinancialNotifications(
    financialMetrics: FinancialMetrics,
    config: AutomationConfig
  ): SmartNotification[] {
    const notifications: SmartNotification[] = []
    const now = new Date()
    const currency = getCurrentCurrency()

    // Low profitability alert
    if (financialMetrics.grossMargin < config.lowProfitabilityThreshold) {
      notifications.push({
        type: 'warning',
        category: 'financial',
        title: 'Margin Keuntungan Rendah',
        message: `Margin kotor hanya ${financialMetrics.grossMargin.toFixed(1)}%. Pertimbangkan menaikkan harga atau efisiensi cost.`,
        action: 'review_pricing',
        priority: 'medium',
        timestamp: now,
        data: {
          currentMargin: financialMetrics.grossMargin,
          threshold: config.lowProfitabilityThreshold
        }
      })
    }

    // Negative profit alert
    if (financialMetrics.netProfit < 0) {
      notifications.push({
        type: 'critical',
        category: 'financial',
        title: 'Kerugian Operasional',
        message: `Bisnis mengalami kerugian ${formatCurrency(Math.abs(financialMetrics.netProfit), currency)}. Perlu analisis segera.`,
        action: 'analyze_losses',
        priority: 'high',
        timestamp: now,
        data: { netLoss: Math.abs(financialMetrics.netProfit) }
      })
    }

    // Excellent performance
    else if (financialMetrics.netMargin > 25) {
      notifications.push({
        type: 'success',
        category: 'financial',
        title: 'Performa Finansial Excellent!',
        message: `Net margin ${financialMetrics.netMargin.toFixed(1)}% sangat baik. Pertimbangkan ekspansi.`,
        action: 'consider_expansion',
        priority: 'low',
        timestamp: now,
        data: { netMargin: financialMetrics.netMargin }
      })
    }

    // High inventory value relative to revenue
    if (financialMetrics.revenue > 0) {
      const inventoryTurnover = financialMetrics.inventoryValue / financialMetrics.revenue
      if (inventoryTurnover > 2) {
        notifications.push({
          type: 'warning',
          category: 'financial',
          title: 'Inventory Value Tinggi',
          message: `Nilai inventory ${inventoryTurnover.toFixed(1)}x dari revenue bulanan. Optimasi diperlukan.`,
          action: 'optimize_inventory_value',
          priority: 'medium',
          timestamp: now,
          data: {
            inventoryTurnover,
            inventoryValue: financialMetrics.inventoryValue,
            revenue: financialMetrics.revenue
          }
        })
      }
    }

    return notifications
  }
}
