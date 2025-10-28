import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'
import { cacheInvalidation } from '@/lib/cache'
import type { Database } from '@/types/supabase-generated'

type HppAlert = Database['public']['Tables']['hpp_alerts']['Row']

// PATCH /api/hpp/alerts/[id]/read - Mark alert as read
export async function PATCH(
  { params }: { params: { id: string } }
) {
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

    const alertId = params.id
    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    // Mark alert as read
    const { error } = await supabase
      .from('hpp_alerts')
      .update({ is_read: true } as any)
      .eq('id', alertId)
      .eq('user_id', user.id)

    if (error) {
      throw new Error(`Failed to mark alert as read: ${error.message}`)
    }

    // Invalidate cache
    await cacheInvalidation.hpp()

    apiLogger.info({
      userId: user.id,
      alertId
    }, 'Alert marked as read successfully')

    return NextResponse.json({ success: true })

  } catch (err: unknown) {
    apiLogger.error({ error: err }, 'Error marking alert as read')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
