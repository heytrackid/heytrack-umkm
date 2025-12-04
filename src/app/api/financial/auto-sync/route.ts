/**
 * Financial Auto-Sync API
 * Automatically syncs orders and purchases to financial records
 */

import { createSuccessResponse } from '@/lib/api-core'
import { createApiRoute } from '@/lib/api/route-factory'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { FinancialSyncService } from '@/services/financial/FinancialSyncService'
import { SecurityPresets } from '@/utils/security/api-middleware'

export const runtime = 'nodejs'

// POST /api/financial/auto-sync - Trigger auto-sync
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/financial/auto-sync',
    securityPreset: SecurityPresets.basic(),
  },
  async (context) => {
    const { user, supabase } = context

    try {
      const syncService = new FinancialSyncService({
        userId: user.id,
        supabase,
        audit: true
      })

      const result = await syncService.autoSyncAll()
      const total = result.orders + result.expenses + result.purchases

      apiLogger.info({ userId: user.id, result }, 'Financial auto-sync completed')

      return createSuccessResponse({
        success: true,
        synced: result,
        total,
        message: total > 0 
          ? `${total} transaksi berhasil disinkronkan`
          : 'Semua transaksi sudah tersinkronisasi'
      })
    } catch (error) {
      apiLogger.error({ error, userId: user.id }, 'Financial auto-sync failed')
      return handleAPIError(error, 'POST /api/financial/auto-sync')
    }
  }
)

// GET /api/financial/auto-sync - Get sync status
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/financial/auto-sync',
    securityPreset: SecurityPresets.basic(),
  },
  async (context) => {
    const { user, supabase } = context

    try {
      // Count unsynced orders
      const { count: unsyncedOrders } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'DELIVERED')
        .is('financial_record_id', null)
        .gt('total_amount', 0)

      // Count unsynced purchases
      const { count: unsyncedPurchases } = await supabase
        .from('ingredient_purchases')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('expense_id', null)
        .gt('total_price', 0)

      const totalUnsynced = (unsyncedOrders ?? 0) + (unsyncedPurchases ?? 0)

      return createSuccessResponse({
        unsynced: {
          orders: unsyncedOrders ?? 0,
          purchases: unsyncedPurchases ?? 0
        },
        total: totalUnsynced,
        needsSync: totalUnsynced > 0
      })
    } catch (error) {
      return handleAPIError(error, 'GET /api/financial/auto-sync')
    }
  }
)
