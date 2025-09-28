import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit') || '20'
  const unreadOnly = searchParams.get('unread_only') === 'true'
  const category = searchParams.get('category')

  try {
    const supabase = createSupabaseClient()
    
    let query = (supabase as any)
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data: notifications, error } = await query

    if (error) throw error

    // Get unread count
    const { count: unreadCount } = await (supabase as any)
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)

    return NextResponse.json({
      data: notifications,
      unreadCount,
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