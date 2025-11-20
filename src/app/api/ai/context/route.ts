export const runtime = 'nodejs'

import { z } from 'zod'
import { NextResponse } from 'next/server'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { apiLogger } from '@/lib/logger'
import { BusinessContextService } from '@/lib/services/BusinessContextService'
import { InputSanitizer } from '@/utils/security/index'

const ContextQuerySchema = z.object({
  page: z.string().trim().max(200).optional(),
})

/**
 * GET /api/ai/context - Load business context for AI chat
 */
async function getContextHandler(
  context: RouteContext,
  query?: z.infer<typeof ContextQuerySchema>
): Promise<NextResponse> {
  const { user } = context

  try {
    const sanitizedPage = query?.page
      ? InputSanitizer.sanitizeHtml(query.page).slice(0, 200).trim() || undefined
      : undefined

    const businessContext = await BusinessContextService.loadContext(user.id, sanitizedPage)

    apiLogger.info({ userId: user.id, page: sanitizedPage }, 'GET /api/ai/context - Success')

    return NextResponse.json({
      context: businessContext,
      cached: false,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    })
  } catch (error) {
    apiLogger.error({ error, userId: user.id }, 'GET /api/ai/context - Error')
    return NextResponse.json(
      { error: 'Failed to load context' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/ai/context - Invalidate context cache
 */
async function deleteContextHandler(context: RouteContext): Promise<NextResponse> {
  const { user } = context

  try {
    await BusinessContextService.invalidateCache(user.id)

    apiLogger.info({ userId: user.id }, 'DELETE /api/ai/context - Success')

    return NextResponse.json({ success: true })
  } catch (error) {
    apiLogger.error({ error, userId: user.id }, 'DELETE /api/ai/context - Error')
    return NextResponse.json(
      { error: 'Failed to invalidate context' },
      { status: 500 }
    )
  }
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/ai/context',
    querySchema: ContextQuerySchema,
    requireAuth: true,
  },
  getContextHandler
)

export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/ai/context',
    requireAuth: true,
  },
  deleteContextHandler
)
