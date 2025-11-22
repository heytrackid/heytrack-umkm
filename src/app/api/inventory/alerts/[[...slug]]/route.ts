// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
import { handleAPIError } from '@/lib/errors/api-error-handler'
export const runtime = 'nodejs'

import { createSuccessResponse } from '@/lib/api-core/responses'
import { createApiRoute } from '@/lib/api/route-factory'
import { apiLogger } from '@/lib/logger'
import { InventoryAlertService } from '@/services/inventory/InventoryAlertService'

// GET /api/inventory/alerts or /api/inventory/alerts/[id]
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/inventory/alerts',
  },
  async (context) => {
    const slug = context.params?.['slug'] as string[] | undefined

    if (!slug || slug.length === 0) {
      // GET /api/inventory/alerts - Get active inventory alerts
      const { user } = context

      try {
        const alertService = new InventoryAlertService()
        const alerts = await alertService.getActiveAlerts(user.id)

        apiLogger.info({ userId: user.id, alertCount: alerts.length }, 'GET /api/inventory/alerts - Success')
        return createSuccessResponse(alerts)
      } catch (error) {
        apiLogger.error({ error, userId: user.id }, 'Error in GET /api/inventory/alerts')
        return handleAPIError(new Error('Failed to fetch inventory alerts'), 'API Route')
      }
    } else {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
  }
)

// POST /api/inventory/alerts - Manually trigger alert check for all ingredients
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/inventory/alerts',
  },
  async (context) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (slug && slug.length > 0) {
      return handleAPIError(new Error('Method not allowed'), 'API Route')
    }

    const { user } = context

    try {
      const alertService = new InventoryAlertService()
      await alertService.checkLowStockAlerts(user.id)

      apiLogger.info({ userId: user.id }, 'POST /api/inventory/alerts - Success')
      return createSuccessResponse({ message: 'Inventory alerts checked successfully' })
    } catch (error) {
      apiLogger.error({ error, userId: user.id }, 'Error in POST /api/inventory/alerts')
      return handleAPIError(new Error('Failed to check inventory alerts'), 'API Route')
    }
  }
)

// PUT /api/inventory/alerts/[id] - Acknowledge an alert
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/inventory/alerts/[id]',
  },
  async (context) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }

    const id = slug[0]!

    try {
      const alertService = new InventoryAlertService()
      await alertService.acknowledgeAlert(id, context.user.id)

      return createSuccessResponse({ message: 'Alert acknowledged successfully' })
    } catch (error: unknown) {
      apiLogger.error({ error, alertId: id }, 'Error in PUT /api/inventory/alerts/[id]')
      return handleAPIError(new Error('Internal server error'), 'API Route')
    }
  }
)