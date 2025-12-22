import { createSuccessResponse } from '@/lib/api-core'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { HppRecalculationService } from '@/services/hpp/HppRecalculationService'
import { SecurityPresets } from '@/utils/security/api-middleware'

export const runtime = 'nodejs'

// GET /api/hpp/recalculation - Get queue status
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/hpp/recalculation',
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext) => {
    try {
      const service = new HppRecalculationService({
        userId: context.user.id,
        supabase: context.supabase
      })

      const status = await service.getQueueStatus()

      apiLogger.info({ userId: context.user.id, status }, 'HPP recalculation queue status retrieved')

      return createSuccessResponse(status)
    } catch (error) {
      return handleAPIError(error, 'GET /api/hpp/recalculation')
    }
  }
)

// POST /api/hpp/recalculation/process - Process pending recalculations
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/hpp/recalculation/process',
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext) => {
    try {
      const service = new HppRecalculationService({
        userId: context.user.id,
        supabase: context.supabase
      })

      const result = await service.processPendingRecalculations(10)

      apiLogger.info({ userId: context.user.id, result }, 'HPP recalculation batch processed')

      return createSuccessResponse(result, 'HPP recalculation batch completed')
    } catch (error) {
      return handleAPIError(error, 'POST /api/hpp/recalculation/process')
    }
  }
)
