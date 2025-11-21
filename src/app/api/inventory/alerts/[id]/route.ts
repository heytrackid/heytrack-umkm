// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

import { createSuccessResponse, createErrorResponse } from '@/lib/api-core'
import { apiLogger } from '@/lib/logger'
import { requireAuth, isErrorResponse } from '@/lib/api-auth'
import { InventoryAlertService } from '@/services/inventory/InventoryAlertService'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'

import { createClient } from '@/utils/supabase/server'

/**
 * PATCH /api/inventory/alerts/[id]
 * Acknowledge an alert
 */
async function putHandler(
  __request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const _user = authResult

    const _supabase = await createClient()
    const alertService = new InventoryAlertService()
    await alertService.acknowledgeAlert(id, _user.id)

    return createSuccessResponse({
      message: 'Alert acknowledged successfully' 
    })

  } catch (error: unknown) {
    apiLogger.error({ error, alertId: id }, 'Error in PATCH /api/inventory/alerts/[id]')
    return createErrorResponse(
      { error: 'Internal server error' },
      500
    )
  }
}

export const PUT = createSecureHandler(putHandler, 'PUT /api/inventory/alerts/[id]', SecurityPresets.enhanced())
