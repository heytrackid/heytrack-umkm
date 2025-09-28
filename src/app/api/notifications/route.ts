import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import { smartNotificationSystem, addBusinessAlert } from '@/lib/smart-notifications'
import { automationEngine } from '@/lib/automation-engine'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const unreadOnly = searchParams.get('unread_only') === 'true'
  const category = searchParams.get('category')
  const source = searchParams.get('source') || 'database' // 'smart' | 'database' | 'all'

  try {
    let notifications = []
    let unreadCount = 0
    let smartSummary = null

    // Get smart notifications (in-memory business intelligence)
    if (source === 'smart' || source === 'all') {
      const smartNotifications = smartNotificationSystem.getNotifications()
      
      let filteredSmartNotifications = smartNotifications
      
      if (category) {
        filteredSmartNotifications = smartNotificationSystem.getNotificationsByCategory(category as any)
      }
      
      if (unreadOnly) {
        filteredSmartNotifications = filteredSmartNotifications.filter(n => !n.isRead)
      }
      
      // Convert smart notifications to API format
      const convertedSmartNotifications = filteredSmartNotifications.slice(0, limit).map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        category: notification.category,
        priority: notification.priority,
        action_url: notification.actionUrl,
        action_label: notification.actionLabel,
        is_read: notification.isRead,
        is_dismissed: false,
        data: notification.data,
        created_at: notification.timestamp,
        updated_at: notification.timestamp,
        source: 'smart' // Identifier untuk smart notifications
      }))
      
      notifications = [...notifications, ...convertedSmartNotifications]
      smartSummary = smartNotificationSystem.getSummary()
    }

    // Get database notifications
    if (source === 'database' || source === 'all') {
      const supabase = createSupabaseClient()
      
      let query = (supabase as any)
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (unreadOnly) {
        query = query.eq('is_read', false)
      }

      if (category) {
        query = query.eq('category', category)
      }

      const { data: dbNotifications, error } = await query

      if (error) throw error

      // Add source identifier to database notifications
      const convertedDbNotifications = (dbNotifications || []).map(notification => ({
        ...notification,
        source: 'database'
      }))

      notifications = [...notifications, ...convertedDbNotifications]

      // Get database unread count
      const { count: dbUnreadCount } = await (supabase as any)
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)

      unreadCount += dbUnreadCount || 0
    }

    // Add smart notifications unread count
    if (source === 'smart' || source === 'all') {
      unreadCount += smartNotificationSystem.getUnreadCount()
    }

    // Sort all notifications by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Limit final results
    notifications = notifications.slice(0, limit)

    return NextResponse.json({
      data: notifications,
      unreadCount,
      summary: smartSummary,
      automation: {
        enabled: true,
        processed_events: 'Available in logs',
        smart_notifications: source === 'smart' || source === 'all'
      },
      lastUpdated: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const body = await request.json()

    const { data: notification, error } = await (supabase as any)
      .from('notifications')
      .insert([{
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(notification, { status: 201 })

  } catch (error: any) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const body = await request.json()

    if (action === 'mark_read') {
      const { ids } = body
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ 
          is_read: true, 
          updated_at: new Date().toISOString() 
        })
        .in('id', ids)

      if (error) throw error
      return NextResponse.json({ success: true, message: 'Notifications marked as read' })
    }

    if (action === 'mark_all_read') {
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ 
          is_read: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('is_read', false)

      if (error) throw error
      return NextResponse.json({ success: true, message: 'All notifications marked as read' })
    }

    if (action === 'dismiss') {
      const { ids } = body
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ 
          is_dismissed: true, 
          updated_at: new Date().toISOString() 
        })
        .in('id', ids)

      if (error) throw error
      return NextResponse.json({ success: true, message: 'Notifications dismissed' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Error updating notifications:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}