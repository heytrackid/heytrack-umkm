// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


/**
 * GET /api/admin/performance-logs
 * Get recent API performance logs
 */

import { type NextRequest, NextResponse } from 'next/server'

import { isAdmin } from '@/lib/auth/admin-check'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage, safeNumber } from '@/lib/type-guards'
import { createClient } from '@/utils/supabase/server'


export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Admin role check
    const hasAdminAccess = await isAdmin(user['id'])
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // 3. Get query params
    const { searchParams } = new URL(request.url)
    const limit = safeNumber(searchParams.get('limit'), 50)

    // 4. Query real performance logs
    const { data: logs, error: logsError } = await supabase
      .from('performance_logs')
      .select('id, endpoint, method, duration_ms, status, timestamp, user_id')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (logsError) {
      apiLogger.error({ error: getErrorMessage(logsError), userId: user['id'] }, 'Error fetching performance logs')
      return NextResponse.json({ error: 'Failed to fetch performance logs' }, { status: 500 })
    }

    apiLogger.info({ userId: user['id'], count: logs?.length || 0 }, 'Performance logs fetched')
    return NextResponse.json(logs || [])

  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in GET /api/admin/performance-logs')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
