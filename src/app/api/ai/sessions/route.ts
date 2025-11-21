export const runtime = 'nodejs'

import { z } from 'zod'
import { NextResponse } from 'next/server'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-core/responses'
import { apiLogger } from '@/lib/logger'
import { typed } from '@/types/type-utilities'
import type { Json } from '@/types/database'

const CreateSessionBodySchema = z.object({
  title: z.string().min(1).optional().default('New Conversation'),
  context_snapshot: z.unknown().optional().default({})
})

/**
 * POST /api/ai/sessions - Create new chat session
 */
async function createSessionHandler(
  context: RouteContext,
  body?: z.infer<typeof CreateSessionBodySchema>
): Promise<NextResponse> {
  const { user, supabase } = context
  const { title = 'New Conversation', context_snapshot = {} } = body || {}

  try {
    const { data: newSession, error } = await typed(supabase)
      .from('chat_sessions')
      .insert({
        user_id: user.id,
        title,
        context_snapshot: context_snapshot as Json
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    apiLogger.info(
      { userId: user.id, sessionId: newSession.id },
      'POST /api/ai/sessions - Success'
    )

    return createSuccessResponse(newSession)
  } catch (error) {
    apiLogger.error({ error, userId: user.id }, 'DELETE /api/ai/sessions - Error')
    return createErrorResponse('Failed to delete session', 500)
  }
}

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/ai/sessions',
    bodySchema: CreateSessionBodySchema,
    requireAuth: true,
  },
  createSessionHandler
)