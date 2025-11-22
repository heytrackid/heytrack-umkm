// External libraries
import { createClient } from '@supabase/supabase-js'
// Internal modules
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { createSuccessResponse } from '@/lib/api-core'
import { handleAPIError } from '@/lib/errors/api-error-handler'

// Types and schemas
// Constants and config
// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

// GET /api/health - Health check endpoint
async function getHealthCheckHandler(context: RouteContext) {
  const { user } = context

  try {
    // Check environment variables
    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env['NEXT_PUBLIC_SUPABASE_URL']),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']),
      NEXT_PUBLIC_APP_DOMAIN: Boolean(process.env['NEXT_PUBLIC_APP_DOMAIN']),
      NODE_ENV: process.env['NODE_ENV'],
      VERCEL_ENV: process.env['VERCEL_ENV'],
    }

    // Check if Supabase is accessible (basic connectivity test)
    let supabaseStatus = 'unknown'
    try {
      if (process.env['NEXT_PUBLIC_SUPABASE_URL'] && process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']) {
        // Try to create a client (this will fail if env vars are invalid)
        createClient(
          process.env['NEXT_PUBLIC_SUPABASE_URL'],
          process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
        )
        supabaseStatus = 'configured'
      } else {
        supabaseStatus = 'missing_env_vars'
      }
    } catch {
      supabaseStatus = 'error'
    }

    return createSuccessResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envStatus,
      services: {
        supabase: supabaseStatus
      },
      version: '1.0.0',
      userId: user?.id || null // Handle case when auth is disabled
    })
  } catch (error) {
    return handleAPIError(error, 'GET /api/health')
  }
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/health',
    requireAuth: false,
  },
  getHealthCheckHandler
)
