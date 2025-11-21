// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextRequest, NextResponse } from 'next/server'

import { createSuccessResponse, createErrorResponse } from '@/lib/api-core'
import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger, logError } from '@/lib/logger'
import { createSecureRouteHandler, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'

// PUT handler for marking HPP alert as read
async function markAlertReadHandler(
  _req: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
): Promise<NextResponse> {
  try {
    const resolvedParams = await params
    const alertId = resolvedParams['id']

    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()

    apiLogger.info({ alertId, userId: user.id }, 'Marking HPP alert as read')

    // Update the alert to mark it as read

    const { data, error } = await supabase
      .from('hpp_alerts')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as never)
      .eq('id', alertId)
      .select()
      .single()

    if (error) {
      logError(apiLogger, error, 'PUT /api/hpp/alerts/[id]/read - Database error')
      throw error
    }

    if (!data) {
  return createErrorResponse(
    { error: 'Alert not found' },
    404
  )
    }

    apiLogger.info({ alertId, userId: user.id }, 'Alert marked as read successfully')

    return createSuccessResponse({
      success: true,
      data
    })
  } catch (error) {
    return handleAPIError(error, 'PUT /api/hpp/alerts/[id]/read')
  }
}

// Apply security middleware
export const PUT = createSecureRouteHandler(markAlertReadHandler, 'PUT /api/hpp/alerts/[id]/read', SecurityPresets.enhanced())
