import { checkAdminPrivileges } from '@/lib/admin-check'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
import type { ErrorLogsInsert } from '@/types/database'
import { SecurityPresets, withSecurity } from '@/utils/security'
import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

// POST /api/errors - Log errors to database
async function POST(request: NextRequest) {
  try {
    // Authenticate user (optional - errors can be logged without auth)
    let userId: string | null = null
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        userId = user.id
      }
    } catch (authError: unknown) {
      // Ignore auth errors - client-side errors can be anonymous
      apiLogger.debug({ error: getErrorMessage(authError) }, 'Anonymous error report')
    }

    // Parse body - handle both JSON and text/plain
    let body: Record<string, unknown>
    const contentType = request.headers.get('content-type') ?? ''
    
    try {
      if (contentType.includes('application/json')) {
        body = await request.json()
      } else if (contentType.includes('text/plain')) {
        // Try to parse text as JSON (sendBeacon might send JSON as text/plain)
        const text = await request.text()
        body = JSON.parse(text)
      } else {
        body = await request.json() // Default to JSON
      }
    } catch (parseError: unknown) {
      apiLogger.error({ error: getErrorMessage(parseError), contentType }, 'Failed to parse error report body')
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
    
    // Validate required fields
    if (!body.message && !body.msg) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Sanitize error data with proper type casting
    const message = String(body.message ?? body.msg ?? 'Unknown error')
    const stack = body.stack ? String(body.stack) : null
    const url = body.url ? String(body.url) : null
    const userAgent = body.userAgent ? String(body.userAgent) : null
    const componentStack = body.componentStack ? String(body.componentStack) : null
    const timestamp = body.timestamp ? String(body.timestamp) : new Date().toISOString()
    
    const sanitizedErrorData = {
      message: message.substring(0, 1000), // Limit message length
      stack: stack ? stack.substring(0, 5000) : null, // Limit stack trace
      url: url ? url.substring(0, 500) : null,
      userAgent: userAgent ? userAgent.substring(0, 500) : null,
      timestamp,
      componentStack: componentStack ? componentStack.substring(0, 2000) : null,
      // Add any additional fields you want to log
    }

    // Log to database if authenticated
    if (userId) {
      try {
        const supabase = await createClient()
        const errorLogData: ErrorLogsInsert = {
          user_id: userId,
          endpoint: sanitizedErrorData.url ?? 'unknown',
          error_message: sanitizedErrorData.message,
          error_type: String(body.errorType ?? 'ClientError'),
          stack_trace: sanitizedErrorData.stack,
          timestamp: sanitizedErrorData.timestamp,
          metadata: {
            url: sanitizedErrorData.url,
            userAgent: sanitizedErrorData.userAgent,
            componentStack: sanitizedErrorData.componentStack,
            browser: body.browser ? String(body.browser) : undefined,
            os: body.os ? String(body.os) : undefined,
            device: body.device ? String(body.device) : undefined,
          }
        }
        
        const { error: dbError } = await supabase
          .from('error_logs')
          .insert(errorLogData)

        if (dbError) {
          apiLogger.error({ error: getErrorMessage(dbError) }, 'Database error when logging error')
          // Continue to return success even if DB logging fails
        }
      } catch (dbError: unknown) {
        apiLogger.error({ error: getErrorMessage(dbError) }, 'Database error when logging error')
        // Continue to return success even if DB logging fails
      }
    }

    // In development, log as well
    if (process.env.NODE_ENV === 'development') {
      apiLogger.info({
        ...sanitizedErrorData,
        userId
      }, 'Client-side error reported')
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in POST /api/errors')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/errors - Get recent errors (admin only)
async function GET(request: NextRequest) {
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
        userId: user.id, 
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
      .select('*')
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

// Custom config for error reporting - more permissive to accept error logs from various sources
const securedPOST = withSecurity(POST, {
  sanitizeInputs: true,
  sanitizeQueryParams: true,
  validateContentType: true,
  allowedContentTypes: ['application/json', 'text/plain'], // Allow both JSON and text/plain for sendBeacon
  rateLimit: { maxRequests: 200, windowMs: 15 * 60 * 1000 }, // Higher limit for error reporting
  checkForSQLInjection: false, // Error messages might contain SQL-like text
  checkForXSS: false, // Error messages might contain HTML-like text
})

export { securedGET as GET, securedPOST as POST }
