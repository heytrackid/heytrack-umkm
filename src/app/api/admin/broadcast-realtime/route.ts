export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdmin } from '@/lib/admin/auth'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { createClient } from '@/utils/supabase/server'

const BroadcastRealtimeSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  queryKeys: z.array(z.array(z.string())).default([['orders'], ['recipes'], ['ingredients'], ['dashboard']])
})

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/admin/broadcast-realtime',
    bodySchema: BroadcastRealtimeSchema,
    requireAuth: true
  },
  async (_context: RouteContext, _query, body) => {
    await requireAdmin()

    if (!body) {
      return NextResponse.json({ success: false, error: 'Body is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Insert broadcast message to notifications table instead
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        type: 'system',
        category: 'system',
        title: 'System Update',
        message: body.message,
        priority: 'high',
        metadata: { queryKeys: body.queryKeys },
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: `Failed to broadcast: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Update broadcasted to all users',
      broadcastedAt: data.created_at,
      id: data.id
    })
  }
)
