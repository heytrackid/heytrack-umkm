// @ts-nocheck
import type { Notification } from '@/types/domain/notifications'

export interface GroupedNotification {
  id: string
  type: string
  category: string
  title: string
  message: string
  count: number
  notifications: Notification[]
  latest_created_at: string
  priority: string
}

/**
 * Group similar notifications together
 * Groups by: category + entity_type + similar time window
 */
export function groupNotifications(
  notifications: Notification[],
  timeWindowSeconds: number = 300 // 5 minutes default
): GroupedNotification[] {
  if (!notifications || notifications.length === 0) {
    return []
  }

  const groups = new Map<string, GroupedNotification>()
  const now = new Date().getTime()

  for (const notification of notifications) {
    const createdAt = new Date(notification.created_at).getTime()
    const ageSeconds = (now - createdAt) / 1000

    // Don't group if too old
    if (ageSeconds > timeWindowSeconds) {
      // Add as individual notification
      const key = `individual_${notification.id}`
      groups.set(key, {
        id: notification.id,
        type: notification.type,
        category: notification.category,
        title: notification.title,
        message: notification.message,
        count: 1,
        notifications: [notification],
        latest_created_at: notification.created_at,
        priority: notification.priority || 'normal',
      })
      continue
    }

    // Create grouping key
    const groupKey = `${notification.category}_${notification.entity_type || 'general'}`

    if (groups.has(groupKey)) {
      // Add to existing group
      const group = groups.get(groupKey)!
      group.count++
      group.notifications.push(notification)
      
      // Update to latest timestamp
      if (new Date(notification.created_at) > new Date(group.latest_created_at)) {
        group.latest_created_at = notification.created_at
        group.title = notification.title
        group.message = notification.message
      }

      // Upgrade priority if higher
      const priorities = ['low', 'normal', 'high', 'urgent']
      const currentPriorityIndex = priorities.indexOf(group.priority)
      const newPriorityIndex = priorities.indexOf(notification.priority || 'normal')
      if (newPriorityIndex > currentPriorityIndex) {
        group.priority = notification.priority || 'normal'
      }
    } else {
      // Create new group
      groups.set(groupKey, {
        id: notification.id,
        type: notification.type,
        category: notification.category,
        title: notification.title,
        message: notification.message,
        count: 1,
        notifications: [notification],
        latest_created_at: notification.created_at,
        priority: notification.priority || 'normal',
      })
    }
  }

  // Convert to array and sort by latest timestamp
  return Array.from(groups.values()).sort((a, b) => {
    return new Date(b.latest_created_at).getTime() - new Date(a.latest_created_at).getTime()
  })
}

/**
 * Generate grouped notification title
 */
export function getGroupedTitle(group: GroupedNotification): string {
  if (group.count === 1) {
    return group.title
  }

  const categoryTitles: Record<string, string> = {
    inventory: 'Notifikasi Stok',
    orders: 'Notifikasi Pesanan',
    production: 'Notifikasi Produksi',
    finance: 'Notifikasi Keuangan',
    system: 'Notifikasi Sistem',
  }

  return `${group.count} ${categoryTitles[group.category] || 'Notifikasi'}`
}

/**
 * Generate grouped notification message
 */
export function getGroupedMessage(group: GroupedNotification): string {
  if (group.count === 1) {
    return group.message
  }

  // Get unique entity names from metadata
  const entityNames = new Set<string>()
  for (const notif of group.notifications) {
    if (notif.metadata && typeof notif.metadata === 'object') {
      const metadata = notif.metadata as Record<string, any>
      const name = metadata.ingredient_name || 
                   metadata.recipe_name || 
                   metadata.order_no || 
                   metadata.customer_name
      if (name) {
        entityNames.add(name)
      }
    }
  }

  if (entityNames.size > 0) {
    const names = Array.from(entityNames).slice(0, 3)
    const remaining = entityNames.size - names.length
    const nameList = names.join(', ')
    return remaining > 0 
      ? `${nameList} dan ${remaining} lainnya`
      : nameList
  }

  return `${group.count} notifikasi baru`
}

/**
 * Check if notifications should be grouped
 */
export function shouldGroup(
  notif1: Notification,
  notif2: Notification,
  timeWindowSeconds: number = 300
): boolean {
  // Same category and entity type
  if (notif1.category !== notif2.category) return false
  if (notif1.entity_type !== notif2.entity_type) return false

  // Within time window
  const time1 = new Date(notif1.created_at).getTime()
  const time2 = new Date(notif2.created_at).getTime()
  const diffSeconds = Math.abs(time1 - time2) / 1000

  return diffSeconds <= timeWindowSeconds
}
