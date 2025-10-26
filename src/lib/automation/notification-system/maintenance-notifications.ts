/**
 * Maintenance Notifications Module
 * Handles equipment maintenance notification generation
 */

import type { SmartNotification, Equipment } from './types'

export class MaintenanceNotifications {
  /**
   * Generate maintenance-related notifications
   */
  static generateMaintenanceNotifications(equipment: Equipment[]): SmartNotification[] {
    const notifications: SmartNotification[] = []

    equipment.forEach(item => {
      const lastMaintenance = new Date(item.lastMaintenance)
      const daysSinceLastMaintenance = Math.floor((new Date().getTime() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceLastMaintenance >= item.intervalDays) {
        notifications.push({
          type: 'warning',
          category: 'production',
          title: 'Maintenance Equipment',
          message: `${item.name} perlu maintenance (terakhir ${daysSinceLastMaintenance} hari lalu).`,
          action: 'schedule_maintenance',
          priority: 'medium',
          timestamp: new Date(),
          data: {
            equipmentName: item.name,
            daysSinceMaintenance: daysSinceLastMaintenance,
            interval: item.intervalDays
          }
        })
      } else if (daysSinceLastMaintenance >= item.intervalDays * 0.8) {
        // Upcoming maintenance reminder
        const daysUntilMaintenance = item.intervalDays - daysSinceLastMaintenance
        notifications.push({
          type: 'info',
          category: 'production',
          title: 'Maintenance Reminder',
          message: `${item.name} akan perlu maintenance dalam ${daysUntilMaintenance} hari.`,
          action: 'plan_maintenance',
          priority: 'low',
          timestamp: new Date(),
          data: {
            equipmentName: item.name,
            daysUntilMaintenance
          }
        })
      }
    })

    return notifications
  }
}
