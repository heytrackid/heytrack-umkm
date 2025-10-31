import { z } from 'zod'

export const NotificationInsertSchema = z.object({
  type: z.enum(['info', 'warning', 'error', 'success', 'alert']),
  category: z.enum(['inventory', 'orders', 'production', 'finance', 'system']),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional().default('normal'),
  entity_type: z.string().max(100).optional(),
  entity_id: z.string().uuid().optional(),
  action_url: z.string().max(500).optional(),
  is_read: z.boolean().optional().default(false),
  is_dismissed: z.boolean().optional().default(false),
  expires_at: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
  user_id: z.string().uuid(),
})

export const NotificationUpdateSchema = z.object({
  is_read: z.boolean().optional(),
  is_dismissed: z.boolean().optional(),
})

export const MarkAllReadSchema = z.object({
  category: z.enum(['inventory', 'orders', 'production', 'finance', 'system']).optional(),
})
