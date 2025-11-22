export const runtime = 'nodejs'
import { handleAPIError } from '@/lib/errors/api-error-handler'

import { createSuccessResponse } from '@/lib/api-core/responses'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import type { NextResponse } from 'next/server'

async function getHandler(context: RouteContext): Promise<NextResponse> {
  const { user, supabase } = context

  try {
    const { data: ingredients, error } = await supabase
      .from('ingredients')
      .select('name, category, unit, price_per_unit, current_stock, reorder_point, supplier')
      .eq('user_id', user.id)
      .order('name')

    if (error) throw error

    // Return as JSON for client-side CSV conversion
    return createSuccessResponse({
      data: ingredients || [],
      meta: {
        total: (ingredients || []).length,
        exportedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    return handleAPIError(error, 'GET /api/export/ingredients')
  }
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/export/ingredients',
  },
  getHandler
)
