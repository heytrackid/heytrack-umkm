/**
 * AI Chat Suggestions API
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { BusinessContextService } from '@/lib/services/BusinessContextService'
import { SuggestionEngine } from '@/lib/services/SuggestionEngine'
import { handleAPIError, APIError } from '@/lib/errors/api-error-handler'

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
      throw new APIError('Unauthorized', { status: 401, code: 'AUTH_REQUIRED' })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const currentPage = searchParams.get('page') ?? undefined

    // Load business context
    const context = await BusinessContextService.loadContext(user.id, currentPage)

    // Generate suggestions
    const suggestions = SuggestionEngine.generateSuggestions(context)

    return NextResponse.json({ suggestions })
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}
