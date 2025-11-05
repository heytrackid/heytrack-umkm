import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'

export const runtime = 'nodejs'

async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alertId = params.id
    const supabase = await createClient()

    apiLogger.info({ alertId }, 'Marking HPP alert as read')

    // Update the alert to mark it as read
    const { data, error } = await supabase
      .from('hpp_alerts')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .select()
      .single()

    if (error) {
      apiLogger.error({ error, alertId }, 'Failed to mark alert as read')
      throw error
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    apiLogger.info({ alertId }, 'Alert marked as read successfully')

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    return handleAPIError(error, 'PUT /api/hpp/alerts/[id]/read')
  }
}

export { PUT as securedPUT }