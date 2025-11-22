export const runtime = 'nodejs'
import { handleAPIError } from '@/lib/errors/api-error-handler'

import { createSuccessResponse } from '@/lib/api-core'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { apiLogger } from '@/lib/logger'
import { SecurityPresets } from '@/utils/security/api-middleware'
import type { NextResponse } from 'next/server'
import { z } from 'zod'

interface NotificationRow {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

// GET /api/notifications - Fetch notifications
async function getNotificationsHandler(context: RouteContext): Promise<NextResponse> {
  const { user, supabase } = context

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('id, user_id, type, title, message, is_read, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    apiLogger.error({ error, userId: user.id }, 'Failed to fetch notifications')
    return handleAPIError(new Error('Failed to fetch notifications'), 'API Route')
  }

  const rows = (notifications || []) as unknown as NotificationRow[]
  const mappedNotifications = rows.map((n) => ({
    ...n,
    read: n.is_read
  }))

  return createSuccessResponse(mappedNotifications)
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/notifications',
    securityPreset: SecurityPresets.polling(), // Use polling preset for high-frequency requests
  },
  getNotificationsHandler
)

// PATCH /api/notifications - Mark as read
const MarkReadSchema = z.object({
  id: z.string().optional(), // If missing, mark all as read
  all: z.boolean().optional(),
})

async function markReadHandler(
  context: RouteContext,
  _query?: never,
  body?: z.infer<typeof MarkReadSchema>
): Promise<NextResponse> {
  const { user, supabase } = context

  if (body?.all) {
    // Mark all as read
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) {
      apiLogger.error({ error, userId: user.id }, 'Failed to mark all notifications as read')
      return handleAPIError(new Error('Failed to mark notifications as read'), 'API Route')
    }
  } else if (body?.id) {
    // Mark specific one as read
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('id', body.id)

    if (error) {
      apiLogger.error({ error, userId: user.id }, 'Failed to mark notification as read')
      return handleAPIError(new Error('Failed to mark notification as read'), 'API Route')
    }
  } else {
    return handleAPIError(new Error('Invalid request parameters'), 'API Route')
  }

  return createSuccessResponse({ success: true })
}

export const PATCH = createApiRoute(
  {
    method: 'PATCH',
    path: '/api/notifications',
    bodySchema: MarkReadSchema,
    securityPreset: SecurityPresets.polling(), // Use polling preset for high-frequency requests
  },
  markReadHandler
)
