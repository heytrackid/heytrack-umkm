import { automationLogger } from '@/lib/logger'

import { FinancialNotifications } from '@/lib/automation/notification-system/financial-notifications'
import { InventoryNotifications } from '@/lib/automation/notification-system/inventory-notifications'
import { MaintenanceNotifications } from '@/lib/automation/notification-system/maintenance-notifications'
import { NotificationFilter } from '@/lib/automation/notification-system/notification-filter'
import { OrderNotifications } from '@/lib/automation/notification-system/order-notifications'
import { SeasonalNotifications } from '@/lib/automation/notification-system/seasonal-notifications'

import type {

/**
 * Notification System Orchestrator
 * Main coordinator for all notification generation and management
 */

  SmartNotification,
  Ingredient,
  OrderForNotification,
  FinancialMetrics,
  AutomationConfig,
  Equipment,
  UserPreferences,
  NotificationSummary
} from '@/lib/automation/notification-system/types'

export class NotificationSystem {
  constructor(private readonly config: AutomationConfig) {}

  /**
   * 🔔 NOTIFICATION SYSTEM: Smart Alerts
   */
  generateSmartNotifications(
    inventory: Ingredient[],
    orders: OrderForNotification[],
    financialMetrics: FinancialMetrics
  ): SmartNotification[] {
    const notifications: SmartNotification[] = []

    // Ensure arrays are safe
    const safeInventory = Array.isArray(inventory) ? inventory : []
    const safeOrders = Array.isArray(orders) ? orders : []

    // Add inventory notifications
    notifications.push(...InventoryNotifications.generateInventoryNotifications(safeInventory))

    // Add order notifications
    notifications.push(...OrderNotifications.generateOrderNotifications(safeOrders))

    // Add financial notifications
    notifications.push(...FinancialNotifications.generateFinancialNotifications(financialMetrics, this.config))

    // Sort by priority and timestamp
    return notifications
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]

        if (priorityDiff !== 0) {return priorityDiff}

        // If same priority, sort by timestamp (newer first)
        const aTime = a['timestamp']?.getTime() ?? 0
        const bTime = b['timestamp']?.getTime() ?? 0
        return bTime - aTime
      })
      .slice(0, 20) // Limit to 20 most important notifications
  }

  /**
   * Generate maintenance reminders
   */
  generateMaintenanceNotifications(equipment: Equipment[]): SmartNotification[] {
    return MaintenanceNotifications.generateMaintenanceNotifications(equipment)
  }

  /**
   * Generate seasonal business notifications
   */
  generateSeasonalNotifications(): SmartNotification[] {
    return SeasonalNotifications.generateSeasonalNotifications()
  }

  /**
   * Filter notifications based on user preferences
   */
  filterNotifications(
    notifications: SmartNotification[],
    userPreferences: UserPreferences
  ): SmartNotification[] {
    return NotificationFilter.filterNotifications(notifications, userPreferences)
  }

  /**
   * Mark notifications as read/dismissed
   */
  dismissNotification(notificationId: string): boolean {
    // This would typically update a database or state management system
    // For now, we'll just return true to indicate success
    automationLogger.info({ notificationId }, 'Notification dismissed')
    return true
  }

  /**
   * Get notification summary for dashboard
   */
  getNotificationSummary(notifications: SmartNotification[]): NotificationSummary {
    return {
      total: notifications.length,
      critical: notifications.filter(n => n['type'] === 'critical').length,
      warning: notifications.filter(n => n['type'] === 'warning').length,
      info: notifications.filter(n => n['type'] === 'info').length,
      success: notifications.filter(n => n['type'] === 'success').length,
      byCategory: {
        inventory: notifications.filter(n => n.category === 'inventory').length,
        production: notifications.filter(n => n.category === 'production').length,
        financial: notifications.filter(n => n.category === 'financial').length,
        orders: notifications.filter(n => n.category === 'orders').length
      },
      urgent: notifications.filter(n => n.priority === 'high').length
    }
  }
}
