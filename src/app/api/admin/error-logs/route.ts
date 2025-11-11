// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

/**
 * GET /api/admin/error-logs
 * Get recent error logs
 */

import { NextRequest, NextResponse } from 'next/server'

import { isAdmin } from '@/lib/auth/admin-check'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage, safeNumber } from '@/lib/type-guards'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'

import { createClient } from '@/utils/supabase/server'

async function getHandler(request: NextRequest): Promise<NextResponse> {
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
    const limit = safeNumber(searchParams.get('limit'), 20)

    // 4. Query real error logs
    const { data: logs, error: logsError } = await supabase
      .from('error_logs')
      .select('id, error_type, error_message, endpoint, timestamp, user_id, stack_trace')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (logsError) {
      apiLogger.error({ error: getErrorMessage(logsError), userId: user['id'] }, 'Error fetching error logs')
      return NextResponse.json({ error: 'Failed to fetch error logs' }, { status: 500 })
    }

    apiLogger.info({ userId: user['id'], count: logs?.length || 0 }, 'Error logs fetched')
    return NextResponse.json(logs ?? [])

  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in GET /api/admin/error-logs')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/admin/error-logs', SecurityPresets.maximum())
