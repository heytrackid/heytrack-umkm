export const runtime = 'nodejs'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/notifications/[id]/read - Mark notification as read
async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const { id } = params
    const supabase = await createClient()

    const { data: success, error } = await supabase.rpc('mark_notification_read', {
      p_notification_id: id,
      p_user_id: user.id,
    } as never)

    if (error) throw error

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Notification not found or already read',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
    })
  } catch (error) {
    return handleAPIError(error, 'PATCH /api/notifications/[id]/read')
  }
}

const securedPATCH = withSecurity(PATCH, SecurityPresets.enhanced())

export { securedPATCH as PATCH }
