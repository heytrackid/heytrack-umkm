// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
import { handleAPIError } from '@/lib/errors/api-error-handler'
export const runtime = 'nodejs'

import { createSuccessResponse } from '@/lib/api-core/responses'
import { createApiRoute } from '@/lib/api/route-factory'
import { ProductionBatchCreateSchema, ProductionBatchUpdateSchema } from '@/lib/validations/domains/production'
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'
import { ProductionService } from '@/services/production/ProductionService'
import type { NextResponse } from 'next/server'

// GET /api/production/batches or /api/production/batches/[id]
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/production/batches',
  },
  async (context): Promise<NextResponse> => {
    const { params } = context
    const slug = params?.['slug'] as string[] | undefined

    if (!slug || slug.length === 0) {
      // GET /api/production/batches - List production batches
      const { user, request } = context
      const url = new URL(request.url)
      const status = url.searchParams.get('status') || undefined
      const limit = parseInt(url.searchParams.get('limit') || '50')

      try {
        const productionService = new ProductionService(context.supabase)
        const params: any = { limit }
        if (status) params.status = status
        const result = await productionService.getProductionBatches(user.id, params)

        return createSuccessResponse(result)
      } catch (error) {
        return handleAPIError(error, 'GET /api/production/batches')
      }
    } else if (slug.length === 1) {
      // GET /api/production/batches/[id] - Get single batch
      const id = slug[0]!!!
      const { user } = context

      try {
        const productionService = new ProductionService(context.supabase)
        const batch = await productionService.getProductionBatch(user.id, id)

        return createSuccessResponse(batch)
      } catch (error) {
        return handleAPIError(error, 'GET /api/production/batches/[id]')
      }
    } else {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
  }
)

// POST /api/production/batches - Create production batch
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/production/batches',
    bodySchema: ProductionBatchCreateSchema,
  },
  async (context, _query, body): Promise<NextResponse> => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (slug && slug.length > 0) {
      return handleAPIError(new Error('Method not allowed'), 'API Route')
    }

    const { user } = context

    if (!body) {
      return handleAPIError(new Error('Request body is required'), 'API Route')
    }

    try {
      const productionService = new ProductionService(context.supabase)
      const createData = { ...body }
      if (createData.notes === undefined) delete createData.notes

      const batch = await productionService.createProductionBatch(user.id, createData as any)

      return createSuccessResponse(batch, SUCCESS_MESSAGES.PRODUCTION_BATCH_CREATED, undefined, 201)
    } catch (error) {
      return handleAPIError(error, 'POST /api/production/batches')
    }
  }
)

// PUT /api/production/batches/[id] - Update batch
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/production/batches/[id]',
    bodySchema: ProductionBatchUpdateSchema,
  },
  async (context, _query, body): Promise<NextResponse> => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }

    const id = slug[0]!
    const { user } = context

    if (!body) {
      return handleAPIError(new Error('Request body is required'), 'API Route')
    }

    try {
      const productionService = new ProductionService(context.supabase)
      const updateData = { ...body }
      if (updateData.notes === undefined) delete updateData.notes

      const updatedBatch = await productionService.updateProductionBatch(user.id, id, updateData as any)

      return createSuccessResponse(updatedBatch, SUCCESS_MESSAGES.PRODUCTION_BATCH_UPDATED)
    } catch (error) {
      return handleAPIError(error, 'PUT /api/production/batches/[id]')
    }
  }
)

// DELETE /api/production/batches/[id] - Delete batch
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/production/batches/[id]',
  },
  async (context): Promise<NextResponse> => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }

    const id = slug[0]!
    const { user } = context

    try {
      const productionService = new ProductionService(context.supabase)
      await productionService.deleteProductionBatch(user.id, id)

      return createSuccessResponse(null, SUCCESS_MESSAGES.PRODUCTION_BATCH_DELETED)
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return handleAPIError(new Error('Production batch not found'), 'API Route')
      }
      if (error instanceof Error && error.message.includes('cannot be deleted')) {
        return handleAPIError(new Error(error.message), 'API Route')
      }
      return handleAPIError(error, 'DELETE /api/production/batches/[id]')
    }
  }
)