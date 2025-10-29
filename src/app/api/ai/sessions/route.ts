/**
 * AI Chat Sessions API - List sessions
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ChatSessionService } from '@/lib/services/ChatSessionService'
import { handleAPIError, APIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
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

    // Get query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    // List sessions
    const sessions = await ChatSessionService.listSessions(user.id, limit)

    apiLogger.info({ userId: user.id, count: sessions.length }, 'Sessions listed')

    return NextResponse.json({ sessions })
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}
