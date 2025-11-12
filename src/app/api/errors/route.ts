// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextRequest, NextResponse } from 'next/server'

import { checkAdminPrivileges } from '@/lib/admin-check'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
import type { Insert } from '@/types/database'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'

interface ErrorBody {
  message?: string
  msg?: string
  stack?: string
  url?: string
  userAgent?: string
  componentStack?: string
  timestamp?: number | string
  errorType?: string
  browser?: string
  os?: string
  device?: string
}

interface SanitizedError {
  message: string
  stack: string | null
  url: string | null
  userAgent: string | null
  timestamp: string
  componentStack: string | null
}

async function getOptionalUserId(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id ?? null
  } catch (error: unknown) {
    apiLogger.debug({ error: getErrorMessage(error) }, 'Anonymous error report')
    return null
  }
}

async function parseErrorBody(request: NextRequest): Promise<ErrorBody> {
  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return request.json() as Promise<ErrorBody>
  }

  if (contentType.includes('text/plain')) {
    const text = await request.text()
    return JSON.parse(text) as ErrorBody
  }

  return request.json() as Promise<ErrorBody>
}

function sanitizeErrorBody(body: ErrorBody): SanitizedError {
  const timestamp = body.timestamp ? String(body.timestamp) : new Date().toISOString()

  return {
    message: String(body.message ?? body.msg ?? 'Unknown error').slice(0, 1000),
    stack: body.stack ? String(body.stack).slice(0, 5000) : null,
    url: body.url ? String(body.url).slice(0, 500) : null,
    userAgent: body.userAgent ? String(body.userAgent).slice(0, 500) : null,
    componentStack: body.componentStack ? String(body.componentStack).slice(0, 2000) : null,
    timestamp
  }
}

async function logErrorToDatabase(
  userId: string,
  sanitized: SanitizedError,
  original: ErrorBody
): Promise<void> {
  try {
    const supabase = await createClient()
    const payload: Insert<'error_logs'> = {
      user_id: userId,
      endpoint: sanitized.url ?? 'unknown',
      error_message: sanitized.message,
      error_type: String(original.errorType ?? 'ClientError'),
      stack_trace: sanitized.stack,
      timestamp: sanitized.timestamp,
      metadata: {
        url: sanitized.url,
        userAgent: sanitized.userAgent,
        componentStack: sanitized.componentStack,
        browser: original.browser ? String(original.browser) : undefined,
        os: original.os ? String(original.os) : undefined,
        device: original.device ? String(original.device) : undefined,
      }
    }

    const { error } = await supabase.from('error_logs').insert(payload as Insert<'error_logs'>)
    if (error) {
      throw error
    }
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Database error when logging error')
  }
}

async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getOptionalUserId()

    let errorBody: ErrorBody
    try {
      errorBody = await parseErrorBody(request)
    } catch (error: unknown) {
      apiLogger.error({ error: getErrorMessage(error) }, 'Failed to parse error report body')
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (!errorBody.message && !errorBody.msg) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const sanitized = sanitizeErrorBody(errorBody)

    if (userId) {
      await logErrorToDatabase(userId, sanitized, errorBody)
    }

    if (process['env'].NODE_ENV === 'development') {
      apiLogger.info({ ...sanitized, userId }, 'Client-side error reported')
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in POST /api/errors')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/errors - Get recent errors (admin only)
async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Check if user is authenticated and has admin privileges
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has admin privileges
    const adminCheck = await checkAdminPrivileges(user)
    if (!adminCheck.hasPermission) {
      apiLogger.warn({ 
        userId: user['id'], 
        email: user.email 
      }, 'Unauthorized access attempt to error logs')
      
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') ?? '50', 10)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)

    // Fetch recent errors from database
    const { data: errors, error: queryError } = await supabase
      .from('error_logs')
      .select('id, user_id, message, stack, timestamp, url, user_agent, ip_address, metadata')
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (queryError) {
      apiLogger.error({ error: queryError }, 'Failed to fetch error logs')
      return NextResponse.json(
        { error: 'Failed to fetch error logs' },
        { status: 500 }
      )
    }

    return NextResponse.json({ errors })
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in GET /api/errors')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

const securedGET = withSecurity(GET, SecurityPresets.enhanced())

// Custom config for error reporting - selective validation to prevent false positives
const securedPOST = withSecurity(POST, {
  sanitizeInputs: true,
  sanitizeQueryParams: true,
  validateContentType: true,
  allowedContentTypes: ['application/json', 'text/plain'], // Allow both JSON and text/plain for sendBeacon
  enableCSRFProtection: false, // Allow error reports from various sources
  rateLimit: { maxRequests: 200, windowMs: 15 * 60 * 1000 }, // Higher limit for error reporting
  checkForSQLInjection: false, // Disable SQL injection checks for error messages
  checkForXSS: false, // Use custom validation instead
})

export { securedGET as GET, securedPOST as POST }
