export const runtime = 'nodejs'

import { z } from 'zod'
import { NextResponse } from 'next/server'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { apiLogger } from '@/lib/logger'
import { typed } from '@/types/type-utilities'

const SessionListQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
})

const DeleteSessionQuerySchema = z.object({
  session_id: z.string().min(1),
})

/**
 * GET /api/ai/sessions - List user chat sessions
 */
async function getSessionsHandler(
  context: RouteContext,
  query?: z.infer<typeof SessionListQuerySchema>
): Promise<NextResponse> {
  const { user, supabase } = context
  const { limit = 20, offset = 0 } = query || {}

  try {
    const { data: sessions, error, count } = await supabase
      .from('chat_sessions' as never)
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    apiLogger.info(
      { userId: user.id, count: sessions?.length, total: count },
      'GET /api/ai/sessions - Success'
    )

    return NextResponse.json({
      data: sessions ?? [],
      meta: {
        total: count ?? 0,
        limit,
        offset,
      },
    })
  } catch (error) {
    apiLogger.error({ error, userId: user.id }, 'GET /api/ai/sessions - Error')
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/ai/sessions - Delete a chat session
 */
async function deleteSessionHandler(
  context: RouteContext,
  query?: z.infer<typeof DeleteSessionQuerySchema>
): Promise<NextResponse> {
  const { user, supabase } = context

  if (!query?.session_id) {
    return NextResponse.json(
      { error: 'session_id is required' },
      { status: 400 }
    )
  }

  try {
    // Delete messages first
    await typed(supabase)
      .from('chat_messages')
      .delete()
      .eq('session_id', query.session_id)
      .eq('user_id', user.id)

    // Delete session
    const { error } = await typed(supabase)
      .from('chat_sessions')
      .delete()
      .eq('id', query.session_id)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    apiLogger.info(
      { userId: user.id, sessionId: query.session_id },
      'DELETE /api/ai/sessions - Success'
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    apiLogger.error({ error, userId: user.id }, 'DELETE /api/ai/sessions - Error')
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/ai/sessions',
    querySchema: SessionListQuerySchema,
    requireAuth: true,
  },
  getSessionsHandler
)

export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/ai/sessions',
    querySchema: DeleteSessionQuerySchema,
    requireAuth: true,
  },
  deleteSessionHandler
)
