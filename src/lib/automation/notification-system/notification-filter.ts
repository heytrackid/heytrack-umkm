import type { SmartNotification, UserPreferences } from '@/lib/automation/notification-system/types'

/**
 * Notification Filter Module
 * Handles notification filtering based on user preferences
 */


export class NotificationFilter {
  /**
   * Filter notifications based on user preferences
   */
  static filterNotifications(
    notifications: SmartNotification[],
    userPreferences: UserPreferences
  ): SmartNotification[] {
    return notifications.filter(notification => {
      // Category filter
      if (notification.category === 'inventory' && !userPreferences.enableInventory) {return false}
      if (notification.category === 'financial' && !userPreferences.enableFinancial) {return false}
      if (notification.category === 'production' && !userPreferences.enableProduction) {return false}
      if (notification.category === 'orders' && !userPreferences.enableOrders) {return false}

      // Priority filter
      if (userPreferences.minPriority) {
        const priorityOrder = { low: 1, medium: 2, high: 3 }
        const minPriorityLevel = priorityOrder[userPreferences.minPriority]
        const notificationPriorityLevel = priorityOrder[notification.priority]

        if (notificationPriorityLevel < minPriorityLevel) {return false}
      }

      return true
    })
  }
}
