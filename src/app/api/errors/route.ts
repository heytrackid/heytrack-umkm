import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage, isValidUUID } from '@/lib/type-guards'

// POST /api/errors - Log errors to database
export async function POST(request: NextRequest) {
  try {
    // Authenticate user (optional - errors can be logged without auth)
    let userId: string | null = null
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        userId = user.id
      }
    } catch (authError) {
      apiLogger.debug({ error: getErrorMessage(authError) }, 'Authentication failed for error logging')
      // Continue without user ID
    }

    const errorData = await request.json()
    
    // Validate error data structure
    if (!errorData || typeof errorData !== 'object') {
      return NextResponse.json(
        { error: 'Invalid error data format' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!errorData.message || typeof errorData.message !== 'string') {
      return NextResponse.json(
        { error: 'Error message is required' },
        { status: 400 }
      )
    }

    // Sanitize error data to prevent injection
    const sanitizedErrorData = {
      message: String(errorData.message).substring(0, 1000), // Limit length
      stack: errorData.stack ? String(errorData.stack).substring(0, 5000) : null,
      name: errorData.name ? String(errorData.name).substring(0, 100) : null,
      timestamp: errorData.timestamp || new Date().toISOString(),
      context: typeof errorData.context === 'object' ? errorData.context : {},
      url: errorData.url ? String(errorData.url).substring(0, 500) : null,
      userAgent: errorData.userAgent ? String(errorData.userAgent).substring(0, 500) : null,
      componentStack: errorData.componentStack ? String(errorData.componentStack).substring(0, 2000) : null,
      level: errorData.level || 'error',
      tags: typeof errorData.tags === 'object' ? errorData.tags : {},
    }

    // Store error in database if Supabase is available
    try {
      const supabase = await createClient()
      
      const errorRecord = {
        user_id: userId,
        message: sanitizedErrorData.message,
        stack: sanitizedErrorData.stack,
        error_type: sanitizedErrorData.name,
        error_level: sanitizedErrorData.level,
        context: sanitizedErrorData.context,
        url: sanitizedErrorData.url,
        user_agent: sanitizedErrorData.userAgent,
        component_stack: sanitizedErrorData.componentStack,
        tags: sanitizedErrorData.tags,
        occurred_at: new Date().toISOString(),
      }

      const { error: insertError } = await supabase
        .from('error_logs')
        .insert(errorRecord)

      if (insertError) {
        apiLogger.error({ error: insertError }, 'Failed to insert error log into database')
        // Don't fail the request if database insert fails, just log it
      } else {
        apiLogger.info({ 
          errorId: errorRecord.occurred_at,
          userId: userId 
        }, 'Error logged to database')
      }
    } catch (dbError) {
      apiLogger.error({ error: getErrorMessage(dbError) }, 'Database error when logging error')
      // Continue to return success even if DB logging fails
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
export async function GET(request: NextRequest) {
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

    // For now, just fetch the most recent errors for the user
    // In a real implementation, you might have role-based access controls
    const { data: errors, error: queryError } = await supabase
      .from('error_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('occurred_at', { ascending: false })
      .limit(50)

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