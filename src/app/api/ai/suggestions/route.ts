// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

/**
 * AI Chat Suggestions API
 */

import { NextRequest, NextResponse } from 'next/server'

import { APIError, handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { requireAuth, isErrorResponse } from '@/lib/api-auth'
import { BusinessContextService } from '@/lib/services/BusinessContextService'
import { SuggestionEngine } from '@/lib/services/SuggestionEngine'
import { createSecureHandler, InputSanitizer, SecurityPresets } from '@/utils/security/index'

async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    apiLogger.info({ url: request.url }, 'GET /api/ai/suggestions - Request received')

    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      throw new APIError('Unauthorized', { status: 401, code: 'AUTH_REQUIRED' })
    }
    const user = authResult

    // Get query params
    const { searchParams } = new URL(request.url)
    const rawPage = searchParams.get('page') ?? undefined
    const sanitizedPage = rawPage ? InputSanitizer.sanitizeHtml(rawPage).slice(0, 200).trim() : undefined
    const currentPage = sanitizedPage && sanitizedPage.length > 0 ? sanitizedPage : undefined

    // Load business context
    const context = await BusinessContextService.loadContext(user['id'], currentPage)

    // Generate suggestions
    const suggestions = SuggestionEngine.generateSuggestions(context)

    return NextResponse.json({ suggestions })
  } catch (error) {
    return handleAPIError(error)
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/ai/suggestions', SecurityPresets.enhanced())
