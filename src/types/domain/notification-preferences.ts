import type { NotificationPreferencesTable, NotificationPreferencesInsert, NotificationPreferencesUpdate } from '@/types/database'

export type NotificationPreferences = NotificationPreferencesTable
export type NotificationPreferencesInsertType = NotificationPreferencesInsert
export type NotificationPreferencesUpdateType = NotificationPreferencesUpdate

export interface NotificationPreferencesForm {
  // Category toggles
  inventory_enabled: boolean
  orders_enabled: boolean
  production_enabled: boolean
  finance_enabled: boolean
  system_enabled: boolean
  
  // Type toggles
  info_enabled: boolean
  warning_enabled: boolean
  error_enabled: boolean
  success_enabled: boolean
  alert_enabled: boolean
  
  // Priority filter
  min_priority: 'low' | 'normal' | 'high' | 'urgent'
  
  // Sound settings
  sound_enabled: boolean
  sound_volume: number
  sound_for_urgent_only: boolean
  
  // Grouping settings
  group_similar_enabled: boolean
  group_time_window: number
  
  // Email settings
  email_enabled: boolean
  email_digest: boolean
  email_digest_frequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
  
  // Quiet hours
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferencesForm = {
  inventory_enabled: true,
  orders_enabled: true,
  production_enabled: true,
  finance_enabled: true,
  system_enabled: true,
  info_enabled: true,
  warning_enabled: true,
  error_enabled: true,
  success_enabled: true,
  alert_enabled: true,
  min_priority: 'low',
  sound_enabled: true,
  sound_volume: 0.5,
  sound_for_urgent_only: false,
  group_similar_enabled: true,
  group_time_window: 300,
  email_enabled: false,
  email_digest: false,
  email_digest_frequency: 'daily',
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00:00',
  quiet_hours_end: '07:00:00',
}
