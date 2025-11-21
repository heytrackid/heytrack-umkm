// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

/**
 * AI Chat Sessions API - Get/Delete specific session
 */

import { NextRequest, NextResponse } from 'next/server'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { ChatSessionService } from '@/lib/services/ChatSessionService'
import { typed } from '@/types/type-utilities'
import { createSecureRouteHandler, SecurityPresets } from '@/utils/security/index'

import { createClient } from '@/utils/supabase/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-core/responses'

interface RouteContext {
  params: Promise<Record<string, string>>
}

async function getHandler(_request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()

    const { id } = await context.params
    if (!id) {
      return createErrorResponse('ID is required', 400)
    }
    const sessionId = id

    // Get session and messages
    const [session, messages] = await Promise.all([
      ChatSessionService.getSession(typed(supabase), sessionId, user.id),
      ChatSessionService.getMessages(typed(supabase), sessionId, user.id),
    ])

    apiLogger.info(
      { userId: user.id, sessionId, messageCount: messages.length },
      'Session loaded'
    )

    return createSuccessResponse({ session, messages })
  } catch (error) {
    return handleAPIError(error)
  }
}

async function deleteHandler(_request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()

    const { id } = await context.params
    if (!id) {
      return createErrorResponse('ID is required', 400)
    }
    const sessionId = id

    // Delete session
    await ChatSessionService.deleteSession(typed(supabase), sessionId, user.id)

    apiLogger.info({ userId: user.id, sessionId }, 'Session deleted')
    return createSuccessResponse(null, 'Session deleted successfully')
  } catch (error) {
    return handleAPIError(error)
  }
}

export const GET = createSecureRouteHandler(getHandler, 'GET /api/ai/sessions/[id]', SecurityPresets.enhanced())
export const DELETE = createSecureRouteHandler(deleteHandler, 'DELETE /api/ai/sessions/[id]', SecurityPresets.enhanced())
