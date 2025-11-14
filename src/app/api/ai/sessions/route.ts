// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

/**
 * AI Chat Sessions API - List sessions
 */

import { NextRequest, NextResponse } from 'next/server'

import { APIError, handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { requireAuth, isErrorResponse } from '@/lib/api-auth'
import { ChatSessionService } from '@/lib/services/ChatSessionService'
import { safeNumber } from '@/lib/type-guards'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'
import { typed } from '@/types/type-utilities'

import { createClient } from '@/utils/supabase/server'

async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      throw new APIError('Unauthorized', { status: 401, code: 'AUTH_REQUIRED' })
    }
    const user = authResult

    // Get query params
    const { searchParams } = new URL(request.url)
    const limit = safeNumber(searchParams.get('limit'), 20)

    // List sessions
    const sessions = await ChatSessionService.listSessions(typed(supabase), user['id'], limit)

    apiLogger.info({ userId: user.id, count: sessions.length }, 'Sessions listed')

    return NextResponse.json({ sessions })
  } catch (error) {
    return handleAPIError(error)
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/ai/sessions', SecurityPresets.enhanced())
