import type { NotificationsTable, NotificationsInsert, NotificationsUpdate } from '@/types/database'



// Base types from generated schema
export type Notification = NotificationsTable
export type NotificationInsert = NotificationsInsert
export type NotificationUpdate = NotificationsUpdate

// Use database field types - these match the actual database schema
export type NotificationType = Notification['type']
export type NotificationCategory = Notification['category']
export type NotificationPriority = Notification['priority']

// Extended types for UI
export interface NotificationWithDetails extends Notification {
  entity_name?: string
  entity_details?: Record<string, unknown>
}

// Notification creation helpers
export interface CreateNotificationParams {
  type: NotificationType
  category: NotificationCategory
  title: string
  message: string
  priority?: NotificationPriority
  entity_type?: string
  entity_id?: string
  action_url?: string
  metadata?: Record<string, unknown>
  expires_at?: string
}
