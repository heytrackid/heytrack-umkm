import { createSuccessResponse } from '@/lib/api-core'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { handleAPIError } from '@/lib/errors/api-error-handler'

export const runtime = 'nodejs'

// GET - Get purchase history for specific ingredient
async function getPurchaseHistoryHandler(context: RouteContext) {
  const { user, supabase, params } = context

  try {
    const ingredientId = params?.['id'] as string

    const { data, error } = await supabase
      .from('ingredient_purchases')
      .select(`
        *,
        ingredient:ingredients(id, name, unit)
      `)
      .eq('ingredient_id', ingredientId)
      .eq('user_id', user.id)
      .order('purchase_date', { ascending: false })

    if (error) {
      throw new Error(`Gagal memuat riwayat pembelian: ${error.message}`)
    }

    return createSuccessResponse({ data })
  } catch (error) {
    return handleAPIError(error, 'GET /api/ingredients/:id/purchase-history')
  }
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/ingredients/:id/purchase-history',
    requireAuth: true,
  },
  getPurchaseHistoryHandler
)
