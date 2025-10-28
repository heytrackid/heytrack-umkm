import type { Json } from '../shared/common'

/**
 * Notification priority levels
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical'

/**
 * Notification types
 */
export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'inventory_alert'
  | 'order_update'
  | 'payment_received'
  | 'production_complete'
  | 'system_alert'

/**
 * Notification category
 */
export type NotificationCategory = 
  | 'system'
  | 'order'
  | 'inventory'
  | 'production'
  | 'payment'
  | 'customer'
  | 'general'

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

// Re-export table types from generated
import type { Database } from '@/types/supabase-generated'

export type NotificationsTable = Database['public']['Tables']['notifications']
export type Notification = NotificationsTable['Row']
export type NotificationInsert = NotificationsTable['Insert']
export type NotificationUpdate = NotificationsTable['Update']
