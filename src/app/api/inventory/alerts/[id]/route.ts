import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { InventoryAlertService } from '@/services/inventory/InventoryAlertService'
import { apiLogger } from '@/lib/logger'

/**
 * PATCH /api/inventory/alerts/[id]
 * Acknowledge an alert
 */
export async function PATCH(
  __request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alertService = new InventoryAlertService()
    await alertService.acknowledgeAlert(id, user.id)

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
