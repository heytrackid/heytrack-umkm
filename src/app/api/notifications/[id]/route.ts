/**
 * PATCH /api/notifications/[id] - Update notification (mark as read/dismiss)
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { apiLogger } from '@/lib/logger'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id: notificationId } = params
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { is_read, is_dismissed } = body

    if (typeof is_read !== 'boolean' && typeof is_dismissed !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid update data. Must provide is_read or is_dismissed' },
        { status: 400 }
      )
    }

    interface NotificationUpdate {
      is_read?: boolean
      is_dismissed?: boolean
      updated_at: string
    }

    const updateData: NotificationUpdate = {
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
    apiLogger.error({ error }, 'Error in PATCH /api/notifications/[id]')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
