import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'
import { cacheInvalidation } from '@/lib/cache'

// POST /api/hpp/alerts/bulk-read - Mark all alerts as read
export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update all unread alerts
    const { data, error } = await supabase
      .from('hpp_alerts')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .select('id')

    if (error) {
      throw new Error(`Failed to mark alerts as read: ${error.message}`)
    }

    // Invalidate cache
    await cacheInvalidation.hpp()

    apiLogger.info({
      userId: user.id,
      count: data?.length || 0
    }, 'All alerts marked as read successfully')

    return NextResponse.json({
      success: true,
      count: data?.length || 0
    })

  } catch (err: unknown) {
    apiLogger.error({ error: err }, 'Error marking all alerts as read')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
