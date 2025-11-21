export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

import { createSuccessResponse, createErrorResponse } from '@/lib/api-core'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { apiLogger } from '@/lib/logger'
import { SecurityPresets } from '@/utils/security/api-middleware'

interface AuthResponse {
  userId: string
  email: string | null
  isAuthenticated: true
}

async function getAuthStatusHandler(context: RouteContext): Promise<NextResponse> {
  try {
    const { user } = context

    return createSuccessResponse({
      userId: user.id,
      email: user.email ?? null,
      isAuthenticated: true,
    })
  } catch (error) {
    apiLogger.error({ error }, 'Failed to return auth status')
    return createErrorResponse('Failed to fetch auth status', 500)
  }
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/auth/me',
    securityPreset: SecurityPresets.basic(),
  },
  getAuthStatusHandler
)
