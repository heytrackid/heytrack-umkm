// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextRequest, NextResponse } from 'next/server'

import { apiLogger } from '@/lib/logger'
import { requireAuth, isErrorResponse } from '@/lib/api-auth'
import { InventoryAlertService } from '@/services/inventory/InventoryAlertService'
import { typed } from '@/types/type-utilities'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'


/**
 * GET /api/inventory/alerts
 * Get active inventory alerts
 */
async function getHandler(__request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const _supabase = typed(await createClient())
    const alertService = new InventoryAlertService()
    const alerts = await alertService.getActiveAlerts(user.id)

    return NextResponse.json(alerts)

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in GET /api/inventory/alerts')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/alerts
 * Manually trigger alert check for all ingredients
 */
async function postHandler(__request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const _supabase = await createClient()
    const alertService = new InventoryAlertService()
    await alertService.checkLowStockAlerts(user.id)

    return NextResponse.json({
      message: 'Inventory alerts checked successfully'
    })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in POST /api/inventory/alerts')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Apply security middleware
export const GET = createSecureHandler(getHandler, 'GET /api/inventory/alerts', SecurityPresets.enhanced())
export const POST = createSecureHandler(postHandler, 'POST /api/inventory/alerts', SecurityPresets.enhanced())
