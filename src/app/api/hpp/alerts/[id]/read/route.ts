// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { type NextRequest, NextResponse } from 'next/server'

import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger, logError } from '@/lib/logger'
import { withSecurity, SecurityPresets } from '@/utils/security'
import { createClient } from '@/utils/supabase/server'


async function putHandler(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alertId = params['id']
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logError(apiLogger, authError, 'PUT /api/hpp/alerts/[id]/read - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    apiLogger.info({ alertId, userId: user['id'] }, 'Marking HPP alert as read')

    // Update the alert to mark it as read
    const { data, error } = await supabase
      .from('hpp_alerts')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .eq('user_id', user['id'])
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

    apiLogger.info({ alertId, userId: user['id'] }, 'Alert marked as read successfully')

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    return handleAPIError(error, 'PUT /api/hpp/alerts/[id]/read')
  }
}

// Apply security middleware
const securedPUT = withSecurity(putHandler, SecurityPresets.enhanced())

export { securedPUT as PUT }