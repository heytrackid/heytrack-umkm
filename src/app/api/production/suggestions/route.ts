// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { z } from 'zod'

import { ERROR_MESSAGES } from '@/lib/constants/messages'
import { APIError, handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger, logError } from '@/lib/logger'
import { ProductionBatchService } from '@/services/production/ProductionBatchService'
import { createSuccessResponse } from '@/lib/api-core/responses'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import type { NextResponse } from 'next/server'

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
async function getHandler(context: RouteContext): Promise<NextResponse> {
  const { user, request } = context

  try {
    apiLogger.info({ url: request.url }, 'GET /api/production/suggestions - Request received')

    const suggestions = await ProductionBatchService.getSuggestedBatches(user.id)

    apiLogger.info({
      userId: user.id,
      suggestionsCount: suggestions.length
    }, 'GET /api/production/suggestions - Success')

    return createSuccessResponse({
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
async function postHandler(context: RouteContext, _query?: never, body?: z.infer<typeof CreateBatchSchema>): Promise<NextResponse> {
  const { user, request } = context

  try {
    apiLogger.info({ url: request.url }, 'POST /api/production/suggestions - Request received')

    if (!body) {
      return handleAPIError(new Error('Request body is required'), 'API Route')
    }

    const { order_ids, planned_date } = body

    const result = await ProductionBatchService.createBatchFromOrders(
      order_ids,
      user.id,
      planned_date
    )

    if (!result.success) {
      throw new APIError(result.message ?? ERROR_MESSAGES.PRODUCTION_BATCH_CREATE_FAILED, {
        status: 400,
        code: 'BATCH_CREATION_FAILED'
      })
    }

    apiLogger.info({
      userId: user.id,
      batchId: result.batch_id,
      orderCount: order_ids.length
    }, 'POST /api/production/suggestions - Batch created')

    return createSuccessResponse({
      batch_id: result.batch_id,
      message: result.message
    }, 'Batch created successfully', undefined, 201)
  } catch (error) {
    logError(apiLogger, error, 'POST /api/production/suggestions - Unexpected error', {
      url: request.url,
    })
    return handleAPIError(error, 'POST /api/production/suggestions')
  }
}

export const GET = createApiRoute(
  { method: 'GET', path: '/api/production/suggestions' },
  getHandler
)

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/production/suggestions',
    bodySchema: CreateBatchSchema
  },
  postHandler
)
