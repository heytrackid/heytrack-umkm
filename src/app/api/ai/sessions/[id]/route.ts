// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

/**
 * AI Chat Sessions API - Get/Delete specific session
 */

import { type NextRequest, NextResponse } from 'next/server'

import { handleAPIError, APIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { ChatSessionService } from '@/lib/services/ChatSessionService'
import { createSecureRouteHandler, SecurityPresets } from '@/utils/security'

import { createClient } from '@/utils/supabase/server'

interface RouteContext {
  params: Promise<Record<string, string>>
}

async function getHandler(_request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new APIError('Unauthorized', { status: 401, code: 'AUTH_REQUIRED' })
    }

    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    const sessionId = id

    // Get session and messages
    const [session, messages] = await Promise.all([
      ChatSessionService.getSession(supabase, sessionId, user['id']),
      ChatSessionService.getMessages(supabase, sessionId, user['id']),
    ])

    apiLogger.info(
      { userId: user['id'], sessionId, messageCount: messages.length },
      'Session loaded'
    )

    return NextResponse.json({ session, messages })
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}

async function deleteHandler(_request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new APIError('Unauthorized', { status: 401, code: 'AUTH_REQUIRED' })
    }

    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    const sessionId = id

    // Delete session
    await ChatSessionService.deleteSession(supabase, sessionId, user['id'])

    apiLogger.info({ userId: user['id'], sessionId }, 'Session deleted')

    return NextResponse.json({ message: 'Session deleted successfully' })
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}

export const GET = createSecureRouteHandler(getHandler, 'GET /api/ai/sessions/[id]', SecurityPresets.enhanced())
export const DELETE = createSecureRouteHandler(deleteHandler, 'DELETE /api/ai/sessions/[id]', SecurityPresets.enhanced())
