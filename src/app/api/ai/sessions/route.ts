// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

/**
 * AI Chat Sessions API - List sessions
 */

import { type NextRequest, NextResponse } from 'next/server'

import { handleAPIError, APIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { ChatSessionService } from '@/lib/services/ChatSessionService'
import { safeNumber } from '@/lib/type-guards'
import { createSecureHandler, SecurityPresets } from '@/utils/security'

import { createClient } from '@/utils/supabase/server'

async function getHandler(request: NextRequest): Promise<NextResponse> {
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

    // Get query params
    const { searchParams } = new URL(request.url)
    const limit = safeNumber(searchParams.get('limit'), 20)

    // List sessions
    const sessions = await ChatSessionService.listSessions(user['id'], limit)

    apiLogger.info({ userId: user['id'], count: sessions.length }, 'Sessions listed')

    return NextResponse.json({ sessions })
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/ai/sessions', SecurityPresets.enhanced())
