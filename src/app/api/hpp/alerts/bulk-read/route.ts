// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'

import { createClient } from '@/utils/supabase/server'
async function postHandler(): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    apiLogger.info('Marking all HPP alerts as read')

    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    // Update all unread alerts for the current user
     
    const { data, error } = await (supabase
      .from('hpp_alerts') as any)
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('is_read', false)
      .eq('user_id', user['id'])
      .select()

    if (error) {
      apiLogger.error({ error }, 'Failed to mark all alerts as read')
      throw error
    }

    const updatedCount = data?.length || 0

    apiLogger.info({ updatedCount }, 'All alerts marked as read successfully')

    return NextResponse.json({
      success: true,
      message: `Marked ${updatedCount} alerts as read`,
      updatedCount
    })
  } catch (error) {
    return handleAPIError(error, 'POST /api/hpp/alerts/bulk-read')
  }
}

export const POST = createSecureHandler(postHandler, 'POST /api/hpp/alerts/bulk-read', SecurityPresets.enhanced())
