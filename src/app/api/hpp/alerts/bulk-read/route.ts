import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'
import { cacheInvalidation } from '@/lib/cache'
import type { Database } from '@/types/supabase-generated'

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
    // Mark all unread alerts as read with proper typing
    const updateData: Database['public']['Tables']['hpp_alerts']['Update'] = {
      is_read: true,
      read_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('hpp_alerts')
      .update(updateData)
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
