// External libraries
import { z } from 'zod'

// Internal modules
import { createSuccessResponse, withQueryValidation } from '@/lib/api-core'
import { ListQuerySchema, createGetHandler, createListHandler } from '@/lib/api/crud-helpers'
import { createApiRoute, type RouteContext, type RouteHandler } from '@/lib/api/route-factory'
import { cacheInvalidation } from '@/lib/cache'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { DateStringSchema, NonNegativeNumberSchema, PositiveNumberSchema, UUIDSchema } from '@/lib/validations/common'
import { FinancialSyncService } from '@/services/financial/FinancialSyncService'
import { HppTriggerService } from '@/services/hpp/HppTriggerService'
import { InventorySyncService } from '@/services/inventory/InventorySyncService'
import { SecurityPresets } from '@/utils/security/api-middleware'

// Types and schemas
import type { IngredientPurchaseInsert, IngredientPurchaseUpdate } from '@/types/database'

// Constants and config
export const runtime = 'nodejs'

// Use centralized validation schemas
const CreatePurchaseSchema = z.object({
  ingredient_id: UUIDSchema.describe('ID bahan baku tidak valid'),
  quantity: PositiveNumberSchema.describe('Jumlah harus lebih dari 0'),
  unit_price: NonNegativeNumberSchema.describe('Harga tidak boleh negatif'),
  total_price: NonNegativeNumberSchema.describe('Total tidak boleh negatif'),
  supplier: z.string().nullable().optional(),
  purchase_date: DateStringSchema.optional(),
  notes: z.string().nullable().optional(),
})

const UpdatePurchaseSchema = z.object({
  quantity: PositiveNumberSchema.optional(),
  unit_price: PositiveNumberSchema.optional(),
  total_price: PositiveNumberSchema.optional(),
  supplier: z.string().min(1).optional(),
  purchase_date: DateStringSchema.optional(),
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
      // Pass the ID from slug to context.params for createGetHandler
      const contextWithId = {
        ...context,
        params: { ...context.params, id: slug[0] } as Record<string, string | string[]>
      }
      return createGetHandler({
        table: 'ingredient_purchases',
        selectFields: '*, ingredient:ingredients(id, name, unit)',
      })(contextWithId)
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

// PUT /api/ingredient-purchases/[id] - Update purchase with stock adjustment
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
    .select('ingredient_id, quantity, unit_price, total_price')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!currentPurchase) {
    return { error: 'Purchase not found', status: 404 }
  }

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

  // If quantity changed, adjust stock accordingly
  const quantityChanged = body.quantity !== undefined && body.quantity !== currentPurchase.quantity
  if (quantityChanged) {
    try {
      const quantityDiff = (body.quantity ?? 0) - (currentPurchase.quantity ?? 0)
      const inventoryService = new InventorySyncService({ userId: user.id, supabase })
      
      if (quantityDiff > 0) {
        // Quantity increased - add more stock
        await inventoryService.updateStockFromPurchase(
          currentPurchase.ingredient_id,
          quantityDiff,
          body.unit_price ?? currentPurchase.unit_price ?? 0,
          `${id}-adjustment`
        )
        apiLogger.info({ purchaseId: id, quantityAdded: quantityDiff }, 'Stock increased from purchase update')
      } else if (quantityDiff < 0) {
        // Quantity decreased - reverse the difference
        await inventoryService.reverseStockFromPurchase(
          currentPurchase.ingredient_id,
          Math.abs(quantityDiff),
          currentPurchase.unit_price ?? 0,
          `${id}-adjustment`
        )
        apiLogger.info({ purchaseId: id, quantityRemoved: Math.abs(quantityDiff) }, 'Stock decreased from purchase update')
      }
    } catch (stockError) {
      apiLogger.error({ error: stockError, purchaseId: id }, 'Failed to adjust stock on purchase update')
    }
  }

  // If quantity or price changed, trigger HPP recalculation
  if (body.quantity || body.unit_price) {
    try {
      const hppTrigger = new HppTriggerService({ userId: user.id, supabase })
      await hppTrigger.onIngredientPriceChange(currentPurchase.ingredient_id)
    } catch (hppError) {
      apiLogger.error({ error: hppError, purchaseId: id }, 'Failed to trigger HPP recalculation on update')
    }
  }

  cacheInvalidation.ingredients(currentPurchase.ingredient_id)

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

// DELETE /api/ingredient-purchases/[id] - Delete purchase with proper cleanup
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/ingredient-purchases/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  async (context) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1 || !slug[0]) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }

    const { user, supabase } = context
    const purchaseId = slug[0]

    // Get purchase data before deletion for cleanup
    const { data: purchaseToDelete, error: fetchError } = await supabase
      .from('ingredient_purchases')
      .select('id, ingredient_id, quantity, unit_price, total_price, expense_id, supplier')
      .eq('id', purchaseId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !purchaseToDelete) {
      return handleAPIError(new Error('Purchase not found'), 'DELETE /api/ingredient-purchases')
    }

    // 1. Cleanup: Reverse stock adjustment
    try {
      const inventoryService = new InventorySyncService({ userId: user.id, supabase })
      await inventoryService.reverseStockFromPurchase(
        purchaseToDelete.ingredient_id,
        purchaseToDelete.quantity,
        purchaseToDelete.unit_price ?? 0,
        purchaseId
      )
      apiLogger.info({ purchaseId, ingredientId: purchaseToDelete.ingredient_id, quantity: purchaseToDelete.quantity }, 'Stock reversed from purchase deletion')
    } catch (stockError) {
      apiLogger.warn({ error: stockError, purchaseId }, 'Failed to reverse stock on purchase deletion')
    }

    // 2. Cleanup: Delete linked expense record if exists
    if (purchaseToDelete.expense_id) {
      const { error: expenseError } = await supabase
        .from('financial_records')
        .delete()
        .eq('id', purchaseToDelete.expense_id)
        .eq('user_id', user.id)

      if (expenseError) {
        apiLogger.warn({ error: expenseError, purchaseId, expenseId: purchaseToDelete.expense_id }, 'Failed to delete linked expense record')
      } else {
        apiLogger.info({ purchaseId, expenseId: purchaseToDelete.expense_id }, 'Linked expense record deleted')
      }
    }

    // 3. Cleanup: Reverse supplier stats if supplier was tracked
    if (purchaseToDelete.supplier && purchaseToDelete.total_price) {
      try {
        const { SupplierStatsService } = await import('@/services/stats/SupplierStatsService')
        const supplierService = new SupplierStatsService({ userId: user.id, supabase })
        await supplierService.reverseStatsFromPurchase(purchaseToDelete.supplier, purchaseToDelete.total_price)
        apiLogger.info({ purchaseId, supplier: purchaseToDelete.supplier }, 'Supplier stats reversed on purchase deletion')
      } catch (supplierError) {
        apiLogger.warn({ error: supplierError, supplier: purchaseToDelete.supplier }, 'Failed to reverse supplier stats on deletion')
      }
    }

    // 4. Delete the purchase record
    const { error: deleteError } = await supabase
      .from('ingredient_purchases')
      .delete()
      .eq('id', purchaseId)
      .eq('user_id', user.id)

    if (deleteError) {
      return handleAPIError(deleteError, 'DELETE /api/ingredient-purchases')
    }

    // 5. Trigger HPP recalculation for affected recipes
    try {
      const hppTrigger = new HppTriggerService({ userId: user.id, supabase })
      await hppTrigger.onIngredientPriceChange(purchaseToDelete.ingredient_id)
      apiLogger.info({ ingredientId: purchaseToDelete.ingredient_id }, 'HPP recalculation triggered after purchase deletion')
    } catch (hppError) {
      apiLogger.warn({ error: hppError, ingredientId: purchaseToDelete.ingredient_id }, 'Failed to trigger HPP recalculation')
    }

    cacheInvalidation.ingredients(purchaseToDelete.ingredient_id)

    apiLogger.info({ userId: user.id, purchaseId }, 'DELETE /api/ingredient-purchases - Success with cleanup')

    return createSuccessResponse({ id: purchaseId }, 'Purchase record deleted and stock reversed successfully')
  }
)