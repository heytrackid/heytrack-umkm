export const runtime = 'nodejs'

import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/admin/auth'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/admin/cache/clear',
    requireAuth: true
  },
  async (_context: RouteContext) => {
    await requireAdmin()

    // Clear all common paths
    const paths = [
      '/',
      '/orders',
      '/recipes',
      '/ingredients',
      '/customers',
      '/suppliers',
      '/production',
      '/cash-flow',
      '/reports',
      '/hpp/calculator'
    ]

    paths.forEach(path => {
      revalidatePath(path)
    })

    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
      clearedPaths: paths
    })
  }
)
