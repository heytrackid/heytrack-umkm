export const runtime = 'nodejs'

import { createErrorResponse, createSuccessResponse } from '@/lib/api-core'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { SecurityPresets } from '@/utils/security/api-middleware'

// GET /api/recipes/history - List user's generated recipes
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/recipes/history',
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext) => {
    const url = new URL(context.request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    const { data, error, count } = await context.supabase
      .from('generated_recipes')
      .select('*', { count: 'exact' })
      .eq('user_id', context.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return createErrorResponse(error.message, 500)
    }

    return createSuccessResponse({
      items: data || [],
      total: count || 0,
      limit,
      offset,
    })
  }
)

// DELETE /api/recipes/history - Delete a generated recipe
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/recipes/history',
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext) => {
    const url = new URL(context.request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return createErrorResponse('ID is required', 400)
    }

    const { error } = await context.supabase
      .from('generated_recipes')
      .delete()
      .eq('id', id)
      .eq('user_id', context.user.id)

    if (error) {
      return createErrorResponse(error.message, 500)
    }

    return createSuccessResponse({
      message: 'Recipe history deleted successfully'
    })
  }
)
