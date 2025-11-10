// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { type NextRequest, NextResponse } from 'next/server'

import { apiLogger } from '@/lib/logger'
import { InventoryAlertService } from '@/services/inventory/InventoryAlertService'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'

import { createClient } from '@/utils/supabase/server'

/**
 * PATCH /api/inventory/alerts/[id]
 * Acknowledge an alert
 */
async function putHandler(
  __request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params
  
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alertService = new InventoryAlertService()
    await alertService.acknowledgeAlert(id, user['id'])

    return NextResponse.json({ 
      message: 'Alert acknowledged successfully' 
    })

  } catch (error: unknown) {
    apiLogger.error({ error, alertId: id }, 'Error in PATCH /api/inventory/alerts/[id]')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const PUT = createSecureHandler(putHandler, 'PUT /api/inventory/alerts/[id]', SecurityPresets.enhanced())
