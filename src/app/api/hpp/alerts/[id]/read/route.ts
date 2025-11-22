// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
import { handleAPIError } from '@/lib/errors/api-error-handler'
export const runtime = 'nodejs'

import { createSuccessResponse } from '@/lib/api-core/responses'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { apiLogger } from '@/lib/logger'
import type { NextResponse } from 'next/server'

// PUT handler for marking HPP alert as read
async function markAlertReadHandler(context: RouteContext): Promise<NextResponse> {
  const { user, supabase, params } = context
  const alertId = params?.['id'] as string

  if (!alertId) {
    return handleAPIError(new Error('Alert ID is required'), 'API Route')
  }

  try {
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
      apiLogger.error({ error, alertId }, 'PUT /api/hpp/alerts/[id]/read - Database error')
      throw error
    }

    if (!data) {
      return handleAPIError(new Error('Alert not found'), 'API Route')
    }

    apiLogger.info({ alertId, userId: user.id }, 'Alert marked as read successfully')

    return createSuccessResponse(data, 'Alert marked as read')
  } catch (error) {
    return handleAPIError(error, 'PUT /api/hpp/alerts/[id]/read')
  }
}

// Apply API route factory
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/hpp/alerts/[id]/read',
  },
  markAlertReadHandler
)
