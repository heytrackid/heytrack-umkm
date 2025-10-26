import type { Json } from './common'

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

// Notification table
export type NotificationsTable = {
  Row: {
    action_url: string | null
    category: string
    created_at: string | null
    entity_id: string | null
    entity_type: string | null
    expires_at: string | null
    id: string
    is_dismissed: boolean | null
    is_read: boolean | null
    message: string
    metadata: Json | null
    priority: string | null
    title: string
    type: string
    updated_at: string | null
  }
  Insert: {
    action_url?: string | null
    category: string
    created_at?: string | null
    entity_id?: string | null
    entity_type?: string | null
    expires_at?: string | null
    id?: string
    is_dismissed?: boolean | null
    is_read?: boolean | null
    message: string
    metadata?: Json | null
    priority?: string | null
    title: string
    type: string
    updated_at?: string | null
  }
  Update: {
    action_url?: string | null
    category?: string
    created_at?: string | null
    entity_id?: string | null
    entity_type?: string | null
    expires_at?: string | null
    id?: string
    is_dismissed?: boolean | null
    is_read?: boolean | null
    message?: string
    metadata?: Json | null
    priority?: string | null
    title?: string
    type?: string
    updated_at?: string | null
  }
  Relationships: []
}
