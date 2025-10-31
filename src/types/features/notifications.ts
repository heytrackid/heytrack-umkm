import type { NotificationsTable, NotificationsInsert, NotificationsUpdate } from '@/types/database'

// Use database field types - these match the actual database schema
export type Notification = NotificationsTable
export type NotificationInsert = NotificationsInsert
export type NotificationUpdate = NotificationsUpdate

// Use database field types for notification attributes to ensure consistency with DB schema
export type NotificationType = Notification['type']
export type NotificationCategory = Notification['category']
export type NotificationPriority = Notification['priority']

/**
 * Notification data payload
 */
export interface NotificationData {
  type: NotificationType
  priority: NotificationPriority
  metadata?: Record<string, unknown>
  entity_id?: string
  entity_type?: string
  action_url?: string
  action_label?: string
  orders?: unknown[]
  [key: string]: unknown
}

/**
 * Smart notification for UI
 */
export interface SmartNotification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  timestamp: Date
  read: boolean
  data?: NotificationData
  action_url?: string
  action_label?: string
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email_enabled: boolean
  push_enabled: boolean
  sms_enabled: boolean
  categories: Record<NotificationCategory, boolean>
  quiet_hours?: {
    enabled: boolean
    start: string // HH:mm format
    end: string   // HH:mm format
  }
}
