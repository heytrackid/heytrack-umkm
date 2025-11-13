// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


/**
 * PATCH /api/notifications/[id] - Update notification (mark as read/dismiss)
 */

import { NextRequest, NextResponse } from 'next/server'

 import { apiLogger } from '@/lib/logger'
import { getErrorMessage, isValidUUID } from '@/lib/type-guards'
import { NotificationUpdateSchema } from '@/lib/validations/domains/notification'
import type { NotificationsTable } from '@/types/database'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
 


async function putHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const resolvedParams = await params
    const { id: notificationId } = resolvedParams
    
    // Validate UUID format
    if (!isValidUUID(notificationId)) {
      return NextResponse.json({ error: 'Invalid notification ID format' }, { status: 400 })
    }
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as unknown

    // Validate request body
    const validation = NotificationUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    const { is_read, is_dismissed } = validation.data

    if (is_read === undefined && is_dismissed === undefined) {
      return NextResponse.json(
        { error: 'Invalid update data. Must provide is_read or is_dismissed' },
        { status: 400 }
      )
    }

    const updateData: Partial<Pick<NotificationsTable, 'is_read' | 'is_dismissed' | 'updated_at'>> = {
      updated_at: new Date().toISOString()
    }

    if (typeof is_read === 'boolean') {
      updateData.is_read = is_read
    }
    if (typeof is_dismissed === 'boolean') {
      updateData.is_dismissed = is_dismissed
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      apiLogger.error({ error, notificationId }, 'Failed to update notification')
      return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
    }

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    apiLogger.info({ notificationId, is_read, is_dismissed }, 'Notification updated successfully')

    return NextResponse.json(notification)

  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in PATCH /api/notifications/[id]')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const PUT = withSecurity(putHandler, SecurityPresets.enhanced())
