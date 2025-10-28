import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { InventoryAlertService } from '@/services/inventory/InventoryAlertService'
import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase-generated'

type InventoryAlert = Database['public']['Tables']['inventory_alerts']['Row']

/**
 * GET /api/inventory/alerts
 * Get active inventory alerts
 */
export async function GET(__request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
export async function POST(__request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
