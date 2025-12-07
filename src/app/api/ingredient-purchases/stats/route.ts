import { createSuccessResponse } from '@/lib/api-core'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { DateRangeQuerySchema } from '@/lib/validations/common'
import type { Row } from '@/types/database'
import { z } from 'zod'

export const runtime = 'nodejs'

// Use centralized DateRangeQuerySchema
const StatsQuerySchema = DateRangeQuerySchema

// GET - Get purchase statistics
async function getStatsHandler(context: RouteContext, query?: z.infer<typeof StatsQuerySchema>) {
  const { user, supabase } = context

  try {
    let queryBuilder = supabase
      .from('ingredient_purchases')
      .select('*')
      .eq('user_id', user.id)

    if (query?.start_date) {
      queryBuilder = queryBuilder.gte('purchase_date', query.start_date)
    }

    if (query?.end_date) {
      queryBuilder = queryBuilder.lte('purchase_date', query.end_date)
    }

    const { data: purchases, error } = await queryBuilder

    if (error) {
      throw new Error(`Gagal memuat statistik: ${error.message}`)
    }

    // Calculate statistics
    const totalPurchases = purchases?.length ?? 0
    const totalAmount = purchases?.reduce((sum: number, p: Row<'ingredient_purchases'>) => sum + (p.total_price || 0), 0) ?? 0
    const averagePrice = totalPurchases > 0 ? totalAmount / totalPurchases : 0

    // Get top suppliers
    const supplierMap = new Map<string, { total_purchases: number; total_amount: number }>()
    
    purchases?.forEach((purchase: Row<'ingredient_purchases'>) => {
      const supplierName = purchase.supplier || 'Unknown'
      const existing = supplierMap.get(supplierName) || { total_purchases: 0, total_amount: 0 }
      supplierMap.set(supplierName, {
        total_purchases: existing.total_purchases + 1,
        total_amount: existing.total_amount + (purchase.total_price || 0),
      })
    })

    const topSuppliers = Array.from(supplierMap.entries())
      .map(([name, stats]) => ({
        supplier_id: name,
        supplier_name: name,
        total_purchases: stats.total_purchases,
        total_amount: stats.total_amount,
      }))
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 5)

    return createSuccessResponse({
      data: {
        total_purchases: totalPurchases,
        total_amount: totalAmount,
        average_price: averagePrice,
        top_suppliers: topSuppliers,
      },
    })
  } catch (error) {
    return handleAPIError(error, 'GET /api/ingredient-purchases/stats')
  }
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/ingredient-purchases/stats',
    querySchema: StatsQuerySchema,
    requireAuth: true,
  },
  getStatsHandler
)
