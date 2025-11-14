// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { APIError, handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger, logError } from '@/lib/logger'
import { requireAuth, isErrorResponse } from '@/lib/api-auth'
import { ProductionBatchService } from '@/services/production/ProductionBatchService'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'

import { createClient } from '@/utils/supabase/server'

const parseISODate = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {return undefined}
  const trimmed = value.trim()
  if (!trimmed) {return undefined}
  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
}

const CreateBatchSchema = z.object({
  order_ids: z.array(z.string().uuid()).min(1).transform(ids => Array.from(new Set(ids))),
  planned_date: z.union([z.string(), z.null(), z.undefined()]).transform(parseISODate)
}).strict()

// GET /api/production/suggestions - Get suggested production batches
async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    apiLogger.info({ url: request.url }, 'GET /api/production/suggestions - Request received')
    
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const _user = authResult

    const _client = await createClient()

    const suggestions = await ProductionBatchService.getSuggestedBatches(_user.id)

    apiLogger.info({
      userId: _user.id,
      suggestionsCount: suggestions.length
    }, 'GET /api/production/suggestions - Success')

    return NextResponse.json({
      data: suggestions,
      meta: {
        total: suggestions.length,
        high_priority: suggestions.filter(s => s.priority === 'HIGH').length,
        medium_priority: suggestions.filter(s => s.priority === 'MEDIUM').length,
        low_priority: suggestions.filter(s => s.priority === 'LOW').length
      }
    })
  } catch (error) {
    logError(apiLogger, error, 'GET /api/production/suggestions - Unexpected error', {
      url: request.url,
    })
    return handleAPIError(error, 'GET /api/production/suggestions')
  }
}

// POST /api/production/suggestions - Create batch from suggestion
async function postHandler(request: NextRequest): Promise<NextResponse> {
  try {
    apiLogger.info({ url: request.url }, 'POST /api/production/suggestions - Request received')
    
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const _user = authResult

    const _client = await createClient()

    const { order_ids, planned_date } = CreateBatchSchema.parse(await request.json())

    const result = await ProductionBatchService.createBatchFromOrders(
      order_ids,
      _user.id,
      planned_date
    )

    if (!result.success) {
      throw new APIError(result.message ?? 'Gagal membuat batch produksi', {
        status: 400,
        code: 'BATCH_CREATION_FAILED'
      })
    }

    apiLogger.info({ 
      userId: _user['id'],
      batchId: result.batch_id,
      orderCount: order_ids.length
    }, 'POST /api/production/suggestions - Batch created')

    return NextResponse.json({
      success: true,
      batch_id: result.batch_id,
      message: result.message
    }, { status: 201 })
  } catch (error) {
    logError(apiLogger, error, 'POST /api/production/suggestions - Unexpected error', {
      url: request.url,
    })
    return handleAPIError(error, 'POST /api/production/suggestions')
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/production/suggestions', SecurityPresets.enhanced())
export const POST = createSecureHandler(postHandler, 'POST /api/production/suggestions', SecurityPresets.enhanced())
