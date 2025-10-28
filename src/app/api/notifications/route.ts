/**
 * GET /api/notifications - Get user notifications
 * Query parameters:
 * - category: filter by category (inventory, financial, etc.)
 * - limit: number of notifications to return (default 20)
 * - unread_only: boolean, return only unread notifications
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase-generated'

type Notification = Database['public']['Tables']['notifications']['Row']

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
      .select('id, title, message, category, severity, is_read, is_dismissed, created_at, metadata')
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

  } catch (err: unknown) {
    apiLogger.error({ err }, 'Error in notifications API')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


