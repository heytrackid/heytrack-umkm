// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
import { handleAPIError } from '@/lib/errors/api-error-handler'
export const runtime = 'nodejs'

import { createSuccessResponse } from '@/lib/api-core'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'
import { apiLogger } from '@/lib/logger'
import type { NextResponse } from 'next/server'

async function postHandler(context: RouteContext): Promise<NextResponse> {
  const { user, supabase } = context

  try {
    apiLogger.info({ userId: user.id }, 'Marking all HPP alerts as read')

    // Update all unread alerts for the current user
    const { data, error } = await supabase
      .from('hpp_alerts')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as never)
      .eq('is_read', false)
      .eq('user_id', user.id)
      .select()

    if (error) {
      apiLogger.error({ error }, 'Failed to mark all alerts as read')
      throw error
    }

    const updatedCount = data?.length || 0

    apiLogger.info({ updatedCount }, 'All alerts marked as read successfully')

    return createSuccessResponse({ updatedCount }, SUCCESS_MESSAGES.HPP_ALERTS_READ)
  } catch (error) {
    return handleAPIError(error, 'POST /api/hpp/alerts/bulk-read')
  }
}

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/hpp/alerts/bulk-read',
    securityPreset: SecurityPresets.basic(),
  },
  postHandler
)
