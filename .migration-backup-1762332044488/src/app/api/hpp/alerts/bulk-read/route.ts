import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'

export const runtime = 'nodejs'

async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()

    apiLogger.info('Marking all HPP alerts as read')

    // Get current user for filtering alerts
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update all unread alerts for the current user
    const { data, error } = await supabase
      .from('hpp_alerts')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('is_read', false)
      .eq('user_id', user.id)
      .select()

    if (error) {
      apiLogger.error({ error }, 'Failed to mark all alerts as read')
      throw error
    }

    const updatedCount = data?.length || 0

    apiLogger.info({ updatedCount }, 'All alerts marked as read successfully')

    return NextResponse.json({
      success: true,
      data: {
        updatedCount,
        alerts: data
      }
    })

  } catch (error) {
    return handleAPIError(error, 'POST /api/hpp/alerts/bulk-read')
  }
}

export { POST as securedPOST }