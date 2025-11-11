// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextRequest, NextResponse } from 'next/server'

import { apiLogger } from '@/lib/logger'
import { NotificationInsertSchema } from '@/lib/validations/domains/notification'
import type { Insert, Json, Row } from '@/types/database'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'



type Notification = Row<'notifications'>

async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread_only') === 'true'
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') ?? '50', 10)

    // Build query
    let query = supabase
      .from('notifications')
      .select('id, user_id, title, message, type, is_read, created_at, updated_at, metadata')
      .eq('user_id', user['id'])
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filter by unread
    if (unreadOnly) {
      query = query.eq('is_read', false).eq('is_dismissed', false)
    }

    // Filter by category
    if (category) {
      query = query.eq('category', category)
    }

    // Filter out expired notifications
    query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

    const { data, error } = await query.returns<Notification[]>()

    if (error) {
      apiLogger.error({ error, userId: user['id'] }, 'Failed to fetch notifications')
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user['id'])
      .eq('is_read', false)
      .eq('is_dismissed', false)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

    return NextResponse.json({
      notifications: data,
      unread_count: unreadCount ?? 0,
    })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in GET /api/notifications')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body: unknown = await request.json()

    // Validate request body
    const validation = NotificationInsertSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    // Create notification
    const { metadata, ...notificationData } = validation['data']
    const notificationPayload: Insert<'notifications'> = {
      ...notificationData,
      user_id: user['id'],
      entity_id: notificationData.entity_id ?? null,
      entity_type: notificationData.entity_type ?? null,
      metadata: (metadata ?? null) as Json | null,
      action_url: notificationData.action_url ?? null,
      expires_at: notificationData.expires_at ?? null
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationPayload)
      .select()
      .single()

    if (error) {
      apiLogger.error({ error, userId: user['id'] }, 'Failed to create notification')
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in POST /api/notifications')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Apply security middleware
const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPOST = withSecurity(POST, SecurityPresets.enhanced())

// Export secured handlers
export { securedGET as GET, securedPOST as POST }
