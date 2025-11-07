// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

/**
 * AI Chat Sessions API - Get/Delete specific session
 */

import { type NextRequest, NextResponse } from 'next/server'

import { handleAPIError, APIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { ChatSessionService } from '@/lib/services/ChatSessionService'
import { createSecureHandler, SecurityPresets } from '@/utils/security'

import { createClient } from '@/utils/supabase/server'

interface RouteParams {
  params: {
    id: string
  }
}

async function getHandler(_request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
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

    const sessionId = params['id']

    // Get session and messages
    const [session, messages] = await Promise.all([
      ChatSessionService.getSession(sessionId, user['id']),
      ChatSessionService.getMessages(sessionId, user['id']),
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

async function deleteHandler(_request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
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

    const sessionId = params['id']

    // Delete session
    await ChatSessionService.deleteSession(sessionId, user['id'])

    apiLogger.info({ userId: user['id'], sessionId }, 'Session deleted')

    return NextResponse.json({ message: 'Session deleted successfully' })
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/ai/sessions/[id]', SecurityPresets.enhanced())
export const DELETE = createSecureHandler(deleteHandler, 'DELETE /api/ai/sessions/[id]', SecurityPresets.enhanced())
