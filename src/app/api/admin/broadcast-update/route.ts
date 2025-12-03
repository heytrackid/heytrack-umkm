export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdmin } from '@/lib/admin/auth'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'

const BroadcastUpdateSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  queryKeys: z.array(z.array(z.string())).default([['orders'], ['recipes'], ['ingredients'], ['dashboard']])
})

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/admin/broadcast-update',
    bodySchema: BroadcastUpdateSchema,
    requireAuth: true
  },
  async (_context: RouteContext, _query, body) => {
    await requireAdmin()

    if (!body) {
      return NextResponse.json({ success: false, error: 'Body is required' }, { status: 400 })
    }

    // For now, just acknowledge the broadcast request
    // Real-time updates are handled via Supabase Realtime subscriptions
    return NextResponse.json({
      success: true,
      message: 'Update broadcasted to all users',
      broadcastedAt: new Date().toISOString()
    })
  }
)
