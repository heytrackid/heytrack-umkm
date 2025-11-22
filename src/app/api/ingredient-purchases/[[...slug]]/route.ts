// External libraries
import { z } from 'zod'

// Internal modules
import { createApiRoute, type RouteContext, type RouteHandler } from '@/lib/api/route-factory'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { ListQuerySchema, createListHandler, createCreateHandler, createGetHandler, createDeleteHandler } from '@/lib/api/crud-helpers'
import { withQueryValidation } from '@/lib/api-core'
import { triggerWorkflow } from '@/lib/automation/workflows/index'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'

// Types and schemas
import type { IngredientPurchaseUpdate } from '@/types/database'

// Constants and config
export const runtime = 'nodejs'

const UpdatePurchaseSchema = z.object({
  quantity: z.number().positive().optional(),
  price_per_unit: z.number().positive().optional(),
  total_cost: z.number().positive().optional(),
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

// POST /api/ingredient-purchases - Create purchase
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/ingredient-purchases',
    securityPreset: SecurityPresets.basic(),
  },
  async (context, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (slug && slug.length > 0) {
      return handleAPIError(new Error('Method not allowed'), 'API Route')
    }
    return createCreateHandler({
      table: 'ingredient_purchases',
      selectFields: '*, ingredient:ingredients(id, name, unit)',
    })(context, undefined, body)
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

  // Check if status is being updated to 'received'
  const shouldTriggerWorkflow = body.status === 'received'

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

  // Trigger workflow if status changed to 'received'
  if (shouldTriggerWorkflow) {
    try {
      await triggerWorkflow('purchase.completed', id)
    } catch (workflowError) {
      apiLogger.error({ error: workflowError, purchaseId: id }, 'Failed to trigger purchase completion workflow')
      // Don't fail the main operation
    }
  }

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