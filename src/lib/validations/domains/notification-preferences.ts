// @ts-nocheck
import { z } from 'zod'

export const NotificationPreferencesUpdateSchema = z.object({
  // Category preferences
  inventory_enabled: z.boolean().optional(),
  orders_enabled: z.boolean().optional(),
  production_enabled: z.boolean().optional(),
  finance_enabled: z.boolean().optional(),
  system_enabled: z.boolean().optional(),
  
  // Type preferences
  info_enabled: z.boolean().optional(),
  warning_enabled: z.boolean().optional(),
  error_enabled: z.boolean().optional(),
  success_enabled: z.boolean().optional(),
  alert_enabled: z.boolean().optional(),
  
  // Priority preferences
  min_priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  
  // Sound preferences
  sound_enabled: z.boolean().optional(),
  sound_volume: z.number().min(0).max(1).optional(),
  sound_for_urgent_only: z.boolean().optional(),
  
  // Grouping preferences
  group_similar_enabled: z.boolean().optional(),
  group_time_window: z.number().min(60).max(3600).optional(), // 1 min to 1 hour
  
  // Email preferences
  email_enabled: z.boolean().optional(),
  email_digest: z.boolean().optional(),
  email_digest_frequency: z.enum(['realtime', 'hourly', 'daily', 'weekly']).optional(),
  
  // Quiet hours
  quiet_hours_enabled: z.boolean().optional(),
  quiet_hours_start: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  quiet_hours_end: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
})
