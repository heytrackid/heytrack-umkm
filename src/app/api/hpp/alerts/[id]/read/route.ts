// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextRequest, NextResponse } from 'next/server'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger, logError } from '@/lib/logger'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'


// Apply security middleware
export const PUT = withSecurity(async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    apiLogger.info({ alertId, userId: user.id }, 'Alert marked as read successfully')

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    return handleAPIError(error, 'PUT /api/hpp/alerts/[id]/read')
  }
}, SecurityPresets.enhanced())
