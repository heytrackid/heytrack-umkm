export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute, type RouteHandler } from '@/lib/api/route-factory'
import { createGetHandler, createUpdateHandler, createDeleteHandler } from '@/lib/api/crud-helpers'
import { triggerWorkflow } from '@/lib/automation/workflows/index'
import { apiLogger } from '@/lib/logger'
import type { RouteContext } from '@/lib/api/route-factory'
import type { IngredientPurchaseUpdate } from '@/types/database'

const UpdatePurchaseSchema = z.object({
  quantity: z.number().positive().optional(),
  price_per_unit: z.number().positive().optional(),
  total_cost: z.number().positive().optional(),
  supplier: z.string().min(1).optional(),
  purchase_date: z.string().optional(),
  status: z.enum(['pending', 'ordered', 'received', 'cancelled']).optional(),
  notes: z.string().optional(),
})

// GET /api/ingredient-purchases/[id] - Get single purchase
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/ingredient-purchases/[id]',
  },
  createGetHandler({
    table: 'ingredient_purchases',
    selectFields: '*, ingredient:ingredients(id, name, unit)',
  })
)

// PUT /api/ingredient-purchases/[id] - Update purchase
async function updatePurchaseHandler(
  context: RouteContext,
  _query?: never,
  body?: z.infer<typeof UpdatePurchaseSchema>
): Promise<{ data?: unknown; error?: string; status?: number }> {
  const { user, supabase, params } = context
  const id = params?.['id']

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
    bodySchema: UpdatePurchaseSchema,
  },
  updatePurchaseHandler as RouteHandler<never, z.infer<typeof UpdatePurchaseSchema>>
)

// DELETE /api/ingredient-purchases/[id] - Delete purchase
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/ingredient-purchases/[id]',
  },
  createDeleteHandler(
    {
      table: 'ingredient_purchases',
    },
    'Purchase record deleted successfully'
  )
)
