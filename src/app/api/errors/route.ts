// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

// External libraries
import type { SupabaseClient } from '@supabase/supabase-js'

// Internal modules - Core
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { createSuccessResponse } from '@/lib/api-core'
import { handleAPIError } from '@/lib/errors/api-error-handler'

// Internal modules - Utils
import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { createClient } from '@/utils/supabase/server'

// Types and schemas
import type { Database } from '@/types/database'
import { ErrorReportSchema, ErrorQuerySchema, type ErrorReport } from '@/lib/validations/domains/common'

// Constants and config
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'

async function getOptionalUserId(): Promise<string | null> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return null // Anonymous error report
    }
    return authResult.id
  } catch (error: unknown) {
    apiLogger.debug({ error: getErrorMessage(error) }, 'Anonymous error report')
    return null
  }
}

function sanitizeErrorBody(body: ErrorReport) {
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
  sanitized: ReturnType<typeof sanitizeErrorBody>,
  original: ErrorReport
): Promise<void> {
  try {
    const supabase = await createClient() as SupabaseClient<Database>
    const payload = {
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

    const { error } = await supabase.from('error_logs').insert(payload)
    if (error) {
      throw error
    }
  } catch (error) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Database error when logging error')
  }
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/errors',
    querySchema: ErrorQuerySchema,
    securityPreset: SecurityPresets.enhanced(),
  },
  async (context: RouteContext, query) => {
    const { user } = context
    const { limit, offset } = query!

    const supabase = await createClient() as SupabaseClient<Database>

    // Admin authorization: check against configured admin emails with a fallback.
    const adminEmailsRaw = process.env['ADMIN_EMAILS'] ?? ''
    const adminEmails = adminEmailsRaw
      .split(',')
      .map(e => e.trim())
      .filter(Boolean)

    const isConfigured = adminEmails.length > 0
    const isAdmin = isConfigured
      ? adminEmails.includes(user.email ?? '')
      : Boolean(user.email?.includes('admin'))

    if (!isAdmin) {
      apiLogger.warn({
        userId: user.id,
        email: user.email
      }, 'Unauthorized access attempt to error logs')

      return handleAPIError(new Error('Forbidden - Admin access required'), 'GET /api/errors')
    }

    // Fetch recent errors from database
    const { data: errors, error: queryError } = await supabase
      .from('error_logs')
      .select('id, user_id, message, stack, timestamp, url, user_agent, ip_address, metadata')
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (queryError) {
      apiLogger.error({ error: queryError }, 'Failed to fetch error logs')
      return handleAPIError(new Error('Failed to fetch error logs'), 'GET /api/errors')
    }

    return createSuccessResponse({ errors })
  }
)

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/errors',
    bodySchema: ErrorReportSchema,
    requireAuth: false, // Allow anonymous error reports
    securityPreset: {
      sanitizeInputs: true,
      sanitizeQueryParams: true,
      validateContentType: true,
      allowedContentTypes: ['application/json', 'text/plain'],
      enableCSRFProtection: false,
      rateLimit: { maxRequests: 200, windowMs: 15 * 60 * 1000 },
      checkForSQLInjection: false,
      checkForXSS: false,
    },
  },
  async (_context: RouteContext, _query, body) => {
    const errorBody = body!

    const userId = await getOptionalUserId()
    const sanitized = sanitizeErrorBody(errorBody)

    if (userId) {
      await logErrorToDatabase(userId, sanitized, errorBody)
    }

    if (process.env.NODE_ENV === 'development') {
      apiLogger.info({ ...sanitized, userId }, 'Client-side error reported')
    }

    return createSuccessResponse(null, SUCCESS_MESSAGES.ERROR_REPORTED)
  }
)