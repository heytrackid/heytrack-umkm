/**
 * AI Chat Sessions API - Get/Delete specific session
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ChatSessionService } from '@/lib/services/ChatSessionService'
import { handleAPIError, APIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'

export const runtime = 'nodejs'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    const sessionId = params.id

    // Get session and messages
    const [session, messages] = await Promise.all([
      ChatSessionService.getSession(sessionId, user.id),
      ChatSessionService.getMessages(sessionId, user.id),
    ])

    apiLogger.info(
      { userId: user.id, sessionId, messageCount: messages.length },
      'Session loaded'
    )

    return NextResponse.json({ session, messages })
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    const sessionId = params.id

    // Delete session
    await ChatSessionService.deleteSession(sessionId, user.id)

    apiLogger.info({ userId: user.id, sessionId }, 'Session deleted')

    return NextResponse.json({ message: 'Session deleted successfully' })
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}
