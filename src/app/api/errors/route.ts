import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
import { withSecurity, SecurityPresets } from '@/utils/security'
import type { ErrorLogsInsert } from '@/types/database'

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

    const body = await request.json()
    
    // Validate required fields
    if (!body.message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Sanitize error data
    const sanitizedErrorData = {
      message: body.message.substring(0, 1000), // Limit message length
      stack: body.stack ? body.stack.substring(0, 5000) : null, // Limit stack trace
      url: body.url ? body.url.substring(0, 500) : null,
      userAgent: body.userAgent ? body.userAgent.substring(0, 500) : null,
      timestamp: body.timestamp || new Date().toISOString(),
      componentStack: body.componentStack ? body.componentStack.substring(0, 2000) : null,
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
          error_type: body.errorType ?? 'ClientError',
          stack_trace: sanitizedErrorData.stack,
          timestamp: sanitizedErrorData.timestamp,
          metadata: {
            url: sanitizedErrorData.url,
            userAgent: sanitizedErrorData.userAgent,
            componentStack: sanitizedErrorData.componentStack,
            browser: body.browser,
            os: body.os,
            device: body.device,
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

    // Also log to our logger
    apiLogger.error({
      ...sanitizedErrorData,
      userId
    }, 'Client-side error reported')

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

    // TODO: Add admin check
    // const isAdmin = await isAdminUser(user.id)
    // if (!isAdmin) {
    //   return NextResponse.json(
    //     { error: 'Forbidden' },
    //     { status: 403 }
    //   )
    // }

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
const securedPOST = withSecurity(POST, SecurityPresets.basic()) // Allow anonymous error reporting

export { securedGET as GET, securedPOST as POST }
