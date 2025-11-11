// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

/**
 * GET /api/admin/export-logs
 * Export logs as JSON file
 */

import { NextResponse } from 'next/server'

import { isAdmin } from '@/lib/auth/admin-check'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
import type { Database } from '@/types/database'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'

import { createClient } from '@/utils/supabase/server'

import type { SupabaseClient } from '@supabase/supabase-js'

interface AdminContext {
  supabase: SupabaseClient<Database>
  userId: string
}

interface AuthResult {
  context?: AdminContext
  statusCode?: number
}

async function authenticateAdmin(): Promise<AuthResult> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { statusCode: 401 }
  }

  const hasAdminAccess = await isAdmin(user['id'])
  if (!hasAdminAccess) {
    return { statusCode: 403 }
  }

  return { context: { supabase, userId: user['id'] } }
}

interface LogSummary {
  perfLogs: unknown[]
  errLogs: unknown[]
}

async function fetchLogs(supabase: SupabaseClient<Database>): Promise<LogSummary> {
  const { data: perfLogs } = await supabase
    .from('performance_logs')
    .select('id, user_id, action, duration, timestamp, metadata')
    .order('timestamp', { ascending: false })
    .limit(1000)

  const { data: errLogs } = await supabase
    .from('error_logs')
    .select('id, user_id, message, stack, timestamp, url, user_agent, ip_address, metadata')
    .order('timestamp', { ascending: false })
    .limit(500)

  return { perfLogs: perfLogs ?? [], errLogs: errLogs ?? [] }
}

interface ExportPayload {
  exported_at: string
  exported_by: string
  performance_logs: unknown[]
  error_logs: unknown[]
  system_metrics: {
    timestamp: string
    total_performance_logs: number
    total_error_logs: number
  }
}

function buildExportPayload(userId: string, perfLogs: unknown[], errLogs: unknown[]): ExportPayload {
  const exportedAt = new Date().toISOString()
  return {
    exported_at: exportedAt,
    exported_by: userId,
    performance_logs: perfLogs,
    error_logs: errLogs,
    system_metrics: {
      timestamp: exportedAt,
      total_performance_logs: perfLogs.length,
      total_error_logs: errLogs.length
    }
  }
}

async function getHandler(): Promise<NextResponse> {
  try {
    const { context, statusCode } = await authenticateAdmin()

    if (!context) {
      return NextResponse.json({ error: statusCode === 403 ? 'Forbidden - Admin access required' : 'Unauthorized' }, { status: statusCode ?? 401 })
    }

    const { supabase, userId } = context
    const { perfLogs, errLogs } = await fetchLogs(supabase)
    const exportData = buildExportPayload(userId, perfLogs, errLogs)

    apiLogger.info({ userId }, 'Logs exported')

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

export const GET = createSecureHandler(getHandler, 'GET /api/admin/export-logs', SecurityPresets.maximum())
