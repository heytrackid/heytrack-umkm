/**
 * GET /api/admin/export-logs
 * Export logs as JSON file
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { isAdmin } from '@/lib/auth/admin-check'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'

export async function GET(_request: NextRequest) {
  try {
    // 1. Authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Admin role check
    const hasAdminAccess = await isAdmin(user.id)
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // 3. Gather logs data from database
    const { data: perfLogs } = await supabase
      .from('performance_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1000)

    const { data: errLogs } = await supabase
      .from('error_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(500)

    const exportData = {
      exported_at: new Date().toISOString(),
      exported_by: user.id,
      performance_logs: perfLogs || [],
      error_logs: errLogs || [],
      system_metrics: {
        timestamp: new Date().toISOString(),
        total_performance_logs: perfLogs?.length || 0,
        total_error_logs: errLogs?.length || 0
      }
    }

    apiLogger.info({ userId: user.id }, 'Logs exported')

    // 3. Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="logs-${new Date().toISOString().split('T')[0]}.json"`
      }
    })

  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in GET /api/admin/export-logs')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
