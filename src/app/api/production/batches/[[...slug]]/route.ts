// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
import { handleAPIError } from '@/lib/errors/api-error-handler'
export const runtime = 'nodejs'

import { createSuccessResponse } from '@/lib/api-core'
import { createApiRoute } from '@/lib/api/route-factory'
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'
import { ProductionService, type ProductionBatchCreateData, type ProductionBatchUpdateData } from '@/services/production/ProductionService'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { NextResponse } from 'next/server'

// GET /api/production/batches or /api/production/batches/[id]
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/production/batches',
    securityPreset: SecurityPresets.basic(),
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
        const productionService = new ProductionService({
          userId: user.id,
          supabase: context.supabase,
          audit: true
        })
        const params = { limit, ...(status && { status }) }
        const result = await productionService.getProductionBatches(params)

        return createSuccessResponse(result)
      } catch (error) {
        return handleAPIError(error, 'GET /api/production/batches')
      }
    } else if (slug.length === 1 && slug[0]) {
      // GET /api/production/batches/[id] - Get single batch
      const id = slug[0]
      const { user } = context

      try {
        const productionService = new ProductionService({
          userId: user.id,
          supabase: context.supabase,
          audit: true
        })
        const batch = await productionService.getProductionBatch(id)

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
    securityPreset: SecurityPresets.basic(),
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
      const productionService = new ProductionService({
        userId: user.id,
        supabase: context.supabase,
        audit: true
      })
      const createData = body as ProductionBatchCreateData
      if (createData.notes === undefined) delete createData.notes

      const batch = await productionService.createProductionBatch(createData)

      return createSuccessResponse(batch, SUCCESS_MESSAGES.PRODUCTION_BATCH_CREATED, undefined, 201)
    } catch (error) {
      return handleAPIError(error, 'POST /api/production/batches')
    }
  }
)

// PUT /api/production/batches/[id] - Update batch with inventory sync
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/production/batches/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  async (context, _query, body): Promise<NextResponse> => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1 || !slug[0]) {
      return handleAPIError(new Error('Invalid path'), 'PUT /api/production/batches/[id]')
    }

    const id = slug[0]
    const { user, supabase } = context

    if (!body) {
      return handleAPIError(new Error('Request body is required'), 'API Route')
    }

    try {
      // Get current batch state before update
      const { data: currentBatch } = await supabase
        .from('production_batches')
        .select('status, recipe_id, quantity')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      const productionService = new ProductionService({
        userId: user.id,
        supabase: context.supabase,
        audit: true
      })
      const updateData = body as ProductionBatchUpdateData
      if (updateData.notes === undefined) delete updateData.notes

      const updatedBatch = await productionService.updateProductionBatch(id, updateData)

      // If status changed to COMPLETED, deduct inventory
      if (updateData.status === 'COMPLETED' && currentBatch?.status !== 'COMPLETED') {
        try {
          const { InventorySyncService } = await import('@/services/inventory/InventorySyncService')
          const inventoryService = new InventorySyncService({ userId: user.id, supabase })
          
          // Deduct stock for all recipe ingredients
          const multiplier = Number(currentBatch?.quantity ?? 1)
          await inventoryService.deductStockForRecipeProduction(
            currentBatch!.recipe_id,
            id,
            multiplier
          )
          
          // Log success
          const { apiLogger } = await import('@/lib/logger')
          apiLogger.info({ batchId: id, recipeId: currentBatch?.recipe_id, multiplier }, 'Inventory deducted for completed production')
        } catch (inventoryError) {
          // Log but don't fail the update
          const { apiLogger } = await import('@/lib/logger')
          apiLogger.error({ error: inventoryError, batchId: id }, 'Failed to deduct inventory for production (batch still updated)')
        }
      }

      // If status changed FROM COMPLETED to CANCELLED, restore inventory and cleanup financial records
      if (updateData.status === 'CANCELLED' && currentBatch?.status === 'COMPLETED') {
        const { apiLogger } = await import('@/lib/logger')
        
        // Restore inventory
        try {
          const { InventorySyncService } = await import('@/services/inventory/InventorySyncService')
          const inventoryService = new InventorySyncService({ userId: user.id, supabase })
          
          // Restore stock for all recipe ingredients (add back)
          const multiplier = Number(currentBatch?.quantity ?? 1)
          await inventoryService.restoreStockForCancelledProduction(
            currentBatch!.recipe_id,
            id,
            multiplier
          )
          
          apiLogger.info({ batchId: id, recipeId: currentBatch?.recipe_id, multiplier }, 'Inventory restored for cancelled production')
        } catch (inventoryError) {
          apiLogger.error({ error: inventoryError, batchId: id }, 'Failed to restore inventory for cancelled production')
        }

        // Cleanup production financial records
        try {
          const batchReference = `PRODUCTION-${id.slice(-8)}`
          const { error: deleteFinError } = await supabase
            .from('financial_records')
            .delete()
            .eq('user_id', user.id)
            .like('reference', `${batchReference}%`)

          if (deleteFinError) {
            apiLogger.warn({ error: deleteFinError, batchId: id }, 'Failed to delete production financial records')
          } else {
            apiLogger.info({ batchId: id, reference: batchReference }, 'Production financial records deleted on cancellation')
          }
        } catch (finError) {
          apiLogger.error({ error: finError, batchId: id }, 'Error cleaning up production financial records')
        }
      }

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
    securityPreset: SecurityPresets.basic(),
  },
  async (context): Promise<NextResponse> => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1 || !slug[0]) {
      return handleAPIError(new Error('Invalid path'), 'DELETE /api/production/batches/[id]')
    }

    const id = slug[0]
    const { user } = context

    try {
      const productionService = new ProductionService({
        userId: user.id,
        supabase: context.supabase,
        audit: true
      })
      await productionService.deleteProductionBatch(id)

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