// External libraries
import { z } from 'zod'

// Internal modules
import { createSuccessResponse, withQueryValidation } from '@/lib/api-core'
import { ListQuerySchema, createDeleteHandler, createGetHandler, createListHandler } from '@/lib/api/crud-helpers'
import { createApiRoute, type RouteContext, type RouteHandler } from '@/lib/api/route-factory'
import { cacheInvalidation } from '@/lib/cache'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { FinancialSyncService } from '@/services/financial/FinancialSyncService'
import { HppTriggerService } from '@/services/hpp/HppTriggerService'
import { InventorySyncService } from '@/services/inventory/InventorySyncService'
import { SecurityPresets } from '@/utils/security/api-middleware'

// Types and schemas
import type { IngredientPurchaseInsert, IngredientPurchaseUpdate } from '@/types/database'

// Constants and config
export const runtime = 'nodejs'

const CreatePurchaseSchema = z.object({
  ingredient_id: z.string().uuid('ID bahan baku tidak valid'),
  quantity: z.number().positive('Jumlah harus lebih dari 0'),
  unit_price: z.number().min(0, 'Harga tidak boleh negatif'),
  total_price: z.number().min(0, 'Total tidak boleh negatif'),
  supplier: z.string().nullable().optional(),
  purchase_date: z.string().optional(),
  notes: z.string().nullable().optional(),
})

const UpdatePurchaseSchema = z.object({
  quantity: z.number().positive().optional(),
  unit_price: z.number().positive().optional(),
  total_price: z.number().positive().optional(),
  supplier: z.string().min(1).optional(),
  purchase_date: z.string().optional(),
  status: z.enum(['pending', 'ordered', 'received', 'cancelled']).optional(),
  notes: z.string().optional(),
})

// GET /api/ingredient-purchases or /api/ingredient-purchases/[id]
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/ingredient-purchases',
    securityPreset: SecurityPresets.basic(),
  },
  async (context) => {
    const { request, params } = context
    const slug = params?.['slug'] as string[] | undefined

    if (!slug || slug.length === 0) {
      // GET /api/ingredient-purchases - List purchases
      const queryValidation = withQueryValidation(ListQuerySchema)(request)
      if (queryValidation instanceof Response) {
        return queryValidation
      }
      const validatedQuery = queryValidation as z.infer<typeof ListQuerySchema>
      return createListHandler({
        table: 'ingredient_purchases',
        selectFields: '*, ingredient:ingredients(id, name, unit, current_stock, price_per_unit)',
        defaultSort: 'purchase_date',
        defaultOrder: 'desc',
        searchFields: ['supplier', 'notes'],
      })(context, validatedQuery)
    } else if (slug.length === 1) {
      // GET /api/ingredient-purchases/[id] - Get single purchase
      return createGetHandler({
        table: 'ingredient_purchases',
        selectFields: '*, ingredient:ingredients(id, name, unit)',
      })(context)
    } else {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
  }
)

// POST /api/ingredient-purchases - Create purchase with auto stock sync
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/ingredient-purchases',
    bodySchema: CreatePurchaseSchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (slug && slug.length > 0) {
      return handleAPIError(new Error('Method not allowed'), 'API Route')
    }

    const { user, supabase } = context

    if (!body) {
      return handleAPIError(new Error('Request body is required'), 'API Route')
    }

    // Create purchase record
    const purchaseData: IngredientPurchaseInsert = {
      user_id: user.id,
      ingredient_id: body.ingredient_id,
      quantity: body.quantity,
      unit_price: body.unit_price,
      total_price: body.total_price,
      cost_per_unit: body.unit_price,
      supplier: body.supplier ?? null,
      purchase_date: body.purchase_date ?? new Date().toISOString().split('T')[0] ?? null,
      notes: body.notes ?? null,
      created_by: user.id
    }

    const { data: purchase, error: purchaseError } = await supabase
      .from('ingredient_purchases')
      .insert(purchaseData)
      .select('*, ingredient:ingredients(id, name, unit)')
      .single()

    if (purchaseError) {
      apiLogger.error({ error: purchaseError }, 'Failed to create purchase')
      return handleAPIError(purchaseError, 'POST /api/ingredient-purchases')
    }

    const createdPurchase = purchase as { id: string; ingredient_id: string; ingredient: { name: string } | null }

    // Auto-sync: Update stock and WAC
    try {
      const inventoryService = new InventorySyncService({ userId: user.id, supabase })
      await inventoryService.updateStockFromPurchase(
        body.ingredient_id,
        body.quantity,
        body.unit_price,
        createdPurchase.id
      )
      apiLogger.info({ purchaseId: createdPurchase.id, ingredientId: body.ingredient_id }, 'Stock auto-synced from purchase')
    } catch (stockError) {
      apiLogger.error({ error: stockError, purchaseId: createdPurchase.id }, 'Failed to auto-sync stock (purchase still created)')
    }

    // Auto-sync: Create expense record
    try {
      const financialService = new FinancialSyncService({ userId: user.id, supabase })
      await financialService.createExpenseFromPurchase(
        createdPurchase.id,
        createdPurchase.ingredient?.name ?? 'Unknown',
        body.total_price,
        body.supplier ?? undefined,
        body.purchase_date ?? undefined
      )
      apiLogger.info({ purchaseId: createdPurchase.id }, 'Expense record auto-created from purchase')
    } catch (expenseError) {
      apiLogger.error({ error: expenseError, purchaseId: createdPurchase.id }, 'Failed to auto-create expense (purchase still created)')
    }

    // Trigger HPP recalculation for affected recipes
    try {
      const hppTrigger = new HppTriggerService({ userId: user.id, supabase })
      await hppTrigger.onIngredientPriceChange(body.ingredient_id)
      apiLogger.info({ ingredientId: body.ingredient_id }, 'HPP recalculation triggered')
    } catch (hppError) {
      apiLogger.error({ error: hppError }, 'Failed to trigger HPP recalculation')
    }

    // Update supplier stats if supplier provided
    if (body.supplier) {
      try {
        const { SupplierStatsService } = await import('@/services/stats/SupplierStatsService')
        const supplierService = new SupplierStatsService({ userId: user.id, supabase })
        await supplierService.updateStatsFromPurchase(body.supplier, body.total_price)
        apiLogger.info({ supplier: body.supplier }, 'Supplier stats updated')
      } catch (supplierError) {
        apiLogger.warn({ error: supplierError, supplier: body.supplier }, 'Failed to update supplier stats')
      }
    }

    cacheInvalidation.ingredients(body.ingredient_id)

    return createSuccessResponse(purchase, 'Pembelian berhasil dicatat dan stok diperbarui', undefined, 201)
  }
)

// PUT /api/ingredient-purchases/[id] - Update purchase
async function updatePurchaseHandler(
  context: RouteContext,
  _query?: never,
  body?: z.infer<typeof UpdatePurchaseSchema>
): Promise<{ data?: unknown; error?: string; status?: number }> {
  const { user, supabase } = context
  const slug = context.params?.['slug'] as string[] | undefined
  const id = slug && slug.length === 1 ? slug[0] : null

  if (!id) {
    return { error: 'Purchase ID is required', status: 400 }
  }

  if (!body) {
    return { error: 'Request body is required', status: 400 }
  }

  // Get current purchase data for comparison
  const { data: currentPurchase } = await supabase
    .from('ingredient_purchases')
    .select('ingredient_id, quantity, unit_price')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  // Update purchase
  const { data, error } = await supabase
    .from('ingredient_purchases')
    .update(body as IngredientPurchaseUpdate)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, ingredient:ingredients(id, name, unit)')
    .single()

  if (error) {
    return { error: 'Failed to update purchase', status: 500 }
  }

  // If quantity or price changed, trigger HPP recalculation
  if (currentPurchase && (body.quantity || body.unit_price)) {
    try {
      const hppTrigger = new HppTriggerService({ userId: user.id, supabase })
      await hppTrigger.onIngredientPriceChange(currentPurchase.ingredient_id)
    } catch (hppError) {
      apiLogger.error({ error: hppError, purchaseId: id }, 'Failed to trigger HPP recalculation on update')
    }
  }

  cacheInvalidation.ingredients()

  return { data }
}

export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/ingredient-purchases/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  updatePurchaseHandler as RouteHandler<never, z.infer<typeof UpdatePurchaseSchema>>
)

// DELETE /api/ingredient-purchases/[id] - Delete purchase
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/ingredient-purchases/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  async (context) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
    return createDeleteHandler(
      {
        table: 'ingredient_purchases',
      },
      'Purchase record deleted successfully'
    )(context)
  }
)