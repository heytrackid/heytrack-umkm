export const runtime = 'nodejs'
import { handleAPIError } from '@/lib/errors/api-error-handler'

import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { apiLogger } from '@/lib/logger'

import { typed } from '@/types/type-utilities'
import { createSuccessResponse } from '@/lib/api-core/responses'
import { ChatSessionService } from '@/lib/services/ChatSessionService'

// GET /api/ai/sessions or /api/ai/sessions/[id]
async function getHandler(context: RouteContext) {
  const { request, params } = context
  const slug = params?.['slug']

  if (!slug || slug.length === 0) {
    // GET /api/ai/sessions - List user chat sessions
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    try {
      const { user, supabase } = context

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
        { userId: user.id, count: sessions?.length, totalCount: count },
        'GET /api/ai/sessions - Success'
      )

      return createSuccessResponse({
        data: sessions ?? [],
        meta: {
          total: count ?? 0,
          limit,
          offset,
        },
      })
    } catch (error) {
      apiLogger.error({ error }, 'GET /api/ai/sessions - Error')
      return handleAPIError(new Error('Failed to fetch sessions'), 'API Route')
    }
  } else if (slug.length === 1) {
    // GET /api/ai/sessions/[id] - Get single session with messages
    const id = slug[0]

    try {
      const { user, supabase } = context

      // Get session and messages
      const [session, messages] = await Promise.all([
        ChatSessionService.getSession(typed(supabase), id!, user.id),
        ChatSessionService.getMessages(typed(supabase), id!, user.id),
      ])

      apiLogger.info(
        { userId: user.id, sessionId: id, messageCount: messages.length },
        'Session loaded'
      )

      return createSuccessResponse({ session, messages })
    } catch (error) {
      return handleAPIError(new Error('Failed to fetch session'), 'API Route')
    }
  } else {
    return handleAPIError(new Error('Invalid path'), 'API Route')
  }
}

// DELETE /api/ai/sessions or /api/ai/sessions/[id]
async function deleteHandler(context: RouteContext) {
  const { params } = context
  const slug = params?.['slug']

  if (!slug || slug.length === 0) {
    // DELETE /api/ai/sessions - Delete all user sessions
    try {
      const { user, supabase } = context

      // Get all session IDs for the user
      const { data: sessions } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('user_id', user.id)

      if (!sessions || sessions.length === 0) {
        return createSuccessResponse({ success: true, message: 'No sessions to delete' })
      }

      const sessionIds = sessions.map(s => s.id)

      // Delete messages first
      await Promise.all(
        sessionIds.map(sessionId =>
          supabase
            .from('chat_messages')
            .delete()
            .eq('session_id', sessionId)
            .eq('user_id', user.id)
        )
      )

      // Delete sessions
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      apiLogger.info(
        { userId: user.id, deletedCount: sessionIds.length },
        'DELETE /api/ai/sessions - Success'
      )

      return createSuccessResponse({ success: true })
    } catch (error) {
      apiLogger.error({ error }, 'DELETE /api/ai/sessions - Error')
      return handleAPIError(new Error('Failed to delete sessions'), 'API Route')
    }
  } else if (slug.length === 1) {
    // DELETE /api/ai/sessions/[id] - Delete single session
    const id = slug[0]

    try {
      const { user, supabase } = context

      // Delete session
      await ChatSessionService.deleteSession(typed(supabase), id!, user.id)

      apiLogger.info({ userId: user.id, sessionId: id }, 'Session deleted')
      return createSuccessResponse(null, 'Session deleted successfully')
    } catch (error) {
      return handleAPIError(new Error('Failed to delete session'), 'API Route')
    }
  } else {
    return handleAPIError(new Error('Invalid path'), 'API Route')
  }
}

// GET /api/ai/sessions or /api/ai/sessions/[id]
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/ai/sessions',
    securityPreset: SecurityPresets.enhanced(),
  },
  getHandler
)

// DELETE /api/ai/sessions or /api/ai/sessions/[id]
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/ai/sessions',
    securityPreset: SecurityPresets.enhanced(),
  },
  deleteHandler
)