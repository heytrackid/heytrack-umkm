/**
 * GET /api/notifications - Get user notifications
 * Query parameters:
 * - category: filter by category (inventory, financial, etc.)
 * - limit: number of notifications to return (default 20)
 * - unread_only: boolean, return only unread notifications
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { apiLogger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const unreadOnly = searchParams.get('unread_only') === 'true'

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    // Add filters
    if (category) {
      query = query.eq('category', category)
    }

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    // Only show non-dismissed notifications
    query = query.eq('is_dismissed', false)

    // Optional: filter by user if notifications are user-specific
    // For now, show all notifications (global inventory alerts)

    const { data: notifications, error } = await query

    if (error) {
      apiLogger.error({ error }, 'Failed to fetch notifications')
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    apiLogger.info({
      category,
      limit,
      unreadOnly,
      resultCount: notifications?.length || 0
    }, 'Notifications fetched successfully')

    return NextResponse.json(notifications || [])

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in notifications API')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications/[id] - Update notification (mark as read/dismiss)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const resolvedParams = await params
    const notificationId = resolvedParams.id

    const body = await request.json()
    const { is_read, is_dismissed } = body

    if (typeof is_read !== 'boolean' && typeof is_dismissed !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid update data. Must provide is_read or is_dismissed' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (typeof is_read === 'boolean') {
      updateData.is_read = is_read
    }
    if (typeof is_dismissed === 'boolean') {
      updateData.is_dismissed = is_dismissed
    }
    updateData.updated_at = new Date().toISOString()

    const { data: notification, error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', notificationId)
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
    apiLogger.error({ error }, 'Error in notification update API')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
