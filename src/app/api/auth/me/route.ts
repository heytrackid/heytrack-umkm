// External libraries
import { NextResponse } from 'next/server'

// Internal modules
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { createSuccessResponse } from '@/lib/api-core'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { SecurityPresets } from '@/utils/security/api-middleware'

export const runtime = 'nodejs'

interface AuthResponse {
  userId: string
  email: string | null
  isAuthenticated: true
}

async function getAuthStatusHandler(context: RouteContext): Promise<NextResponse> {
  try {
    const { user } = context

    const response: AuthResponse = {
      userId: user.id,
      email: user.email ?? null,
      isAuthenticated: true,
    }

    return createSuccessResponse(response)
  } catch (error) {
    return handleAPIError(error, 'GET /api/auth/me')
  }
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/auth/me',
    securityPreset: SecurityPresets.enhanced(),
  },
  getAuthStatusHandler
)
