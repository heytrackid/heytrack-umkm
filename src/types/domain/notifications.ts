import type { Database } from '@/types/supabase-generated'

// Base types from generated schema
export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

// Notification types
export type NotificationType = 'info' | 'warning' | 'error' | 'success' | 'alert'
export type NotificationCategory = 'inventory' | 'orders' | 'production' | 'finance' | 'system'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

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
