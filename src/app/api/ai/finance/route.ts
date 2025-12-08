/**
 * FinanceWise AI API Routes
 * Cash Flow Intelligence Agent endpoints
 */

export const runtime = 'nodejs'

import { createSuccessResponse } from '@/lib/api-core'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { FinanceWiseService } from '@/services/ai'
import { SecurityPresets } from '@/utils/security/api-middleware'
import type { NextResponse } from 'next/server'
import { z } from 'zod'

// Query schemas
const SummaryQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

// Request body schema for POST
interface AnalyzeRequestBody {
  type: 'summary' | 'health' | 'forecast' | 'profit'
  start_date?: string
  end_date?: string
  months?: number
}

// GET /api/ai/finance - Get complete financial analysis
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/ai/finance',
    querySchema: SummaryQuerySchema,
    securityPreset: SecurityPresets.enhanced(),
  },
  async (context: RouteContext) => {
    const { user, supabase } = context

    try {
      const financeService = new FinanceWiseService({ userId: user.id, supabase })
      const analysis = await financeService.getCompleteAnalysis()

      return createSuccessResponse(analysis)
    } catch (error) {
      return handleAPIError(error, 'GET /api/ai/finance')
    }
  }
)

// POST /api/ai/finance - Custom analysis query
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/ai/finance',
    securityPreset: SecurityPresets.enhanced(),
  },
  async (context: RouteContext, _query, body): Promise<NextResponse> => {
    const { user, supabase } = context
    const requestBody = body as AnalyzeRequestBody

    try {
      const financeService = new FinanceWiseService({ userId: user.id, supabase })

      let result: unknown

      switch (requestBody.type) {
        case 'summary': {
          const endDate = requestBody.end_date || new Date().toISOString().split('T')[0]
          const startDate = requestBody.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          result = await financeService.getFinancialSummary(startDate!, endDate!)
          break
        }
        case 'health':
          result = await financeService.analyzeFinancialHealth()
          break
        case 'forecast':
          result = await financeService.generateForecast(requestBody.months || 3)
          break
        case 'profit': {
          const endDate = requestBody.end_date || new Date().toISOString().split('T')[0]
          const startDate = requestBody.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          result = await financeService.analyzeProfitByProduct(startDate!, endDate!)
          break
        }
        default:
          return handleAPIError(new Error('Invalid analysis type'), 'POST /api/ai/finance/analyze')
      }

      return createSuccessResponse(result)
    } catch (error) {
      return handleAPIError(error, 'POST /api/ai/finance/analyze')
    }
  }
)
