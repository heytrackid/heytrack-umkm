// External libraries
// Internal modules
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { parseRouteParams } from '@/lib/api/route-helpers'
import { ListQuerySchema, createCreateHandler, createListHandler } from '@/lib/api/crud-helpers'
import { createSuccessResponse } from '@/lib/api-core'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { isValidUUID } from '@/lib/type-guards'

// Types and schemas
import { OperationalCostInsertSchema, OperationalCostUpdateSchema } from '@/lib/validations/domains/finance'
import type { Update } from '@/types/database'

// Constants and config
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'

export const runtime = 'nodejs'

// GET /api/operational-costs or /api/operational-costs/[id]
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/operational-costs',
    querySchema: ListQuerySchema,
  },
  async (context: RouteContext, validatedQuery) => {
    const { params } = context
    const { slug } = parseRouteParams(params)

    if (!slug || slug.length === 0) {
      // GET /api/operational-costs - List operational costs
      return createListHandler({
        table: 'operational_costs',
        selectFields: '*',
        defaultSort: 'date',
        defaultOrder: 'desc',
        searchFields: ['description', 'category'],
      })(context, validatedQuery)
    } else if (slug.length === 1) {
      // GET /api/operational-costs/[id] - Get single operational cost
      const id = slug[0]
      if (!isValidUUID(id)) {
        return handleAPIError(new Error('Invalid operational cost ID format'), 'API Route')
      }

      const { data, error } = await context.supabase
        .from('operational_costs')
        .select('id, user_id, name, amount, frequency, category, created_at, updated_at')
        .eq('id', id)
        .single()

      if (error) {
        if (error['code'] === 'PGRST116') {
          return handleAPIError(new Error('Operational cost not found'), 'API Route')
        }
        apiLogger.error({ error }, 'Error fetching operational cost')
        return handleAPIError(new Error('Failed to fetch operational cost'), 'API Route')
      }

      return createSuccessResponse(data)
    } else {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
  }
)

// POST /api/operational-costs - Create operational cost
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/operational-costs',
    bodySchema: OperationalCostInsertSchema,
  },
  async (context, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (slug && slug.length > 0) {
      return handleAPIError(new Error('Method not allowed'), 'API Route')
    }
    return createCreateHandler(
      {
        table: 'operational_costs',
        selectFields: '*',
      },
      SUCCESS_MESSAGES.OPERATIONAL_COST_CREATED
    )(context, undefined, body)
  }
)

// PUT /api/operational-costs/[id] - Update operational cost
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/operational-costs/[id]',
    bodySchema: OperationalCostUpdateSchema,
  },
  async (context, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }

    const id = slug[0]
    if (!isValidUUID(id)) {
      return handleAPIError(new Error('Invalid operational cost ID format'), 'API Route')
    }

    if (!body) {
      return handleAPIError(new Error('Request body is required'), 'API Route')
    }

    const validatedData = body

    const updatePayload: Update<'operational_costs'> = {
      ...(validatedData.category !== undefined && { category: validatedData.category }),
      ...(validatedData.amount !== undefined && { amount: validatedData.amount }),
      ...(validatedData.description !== undefined && { description: validatedData.description }),
      ...(validatedData.date !== undefined && { date: validatedData.date }),
      ...(validatedData.recurring !== undefined && { recurring: validatedData.recurring }),
      ...(validatedData.frequency !== undefined && { frequency: validatedData.frequency }),
      ...(validatedData.supplier !== undefined && { supplier: validatedData.supplier }),
      ...(validatedData.reference !== undefined && { reference: validatedData.reference }),
      ...(validatedData.payment_method !== undefined && { payment_method: validatedData.payment_method }),
      ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
      ...(validatedData.is_active !== undefined && { is_active: validatedData.is_active }),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await context.supabase
      .from('operational_costs')
      .update(updatePayload as never)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error['code'] === 'PGRST116') {
        return handleAPIError(new Error('Operational cost not found'), 'API Route')
      }
      apiLogger.error({ error }, 'Error updating operational cost')
      return handleAPIError(new Error('Failed to update operational cost'), 'API Route')
    }

    return createSuccessResponse(data, SUCCESS_MESSAGES.OPERATIONAL_COST_UPDATED)
  }
)

// DELETE /api/operational-costs/[id] - Delete operational cost
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/operational-costs/[id]',
  },
  async (context) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }

    const id = slug[0]
    if (!isValidUUID(id)) {
      return handleAPIError(new Error('Invalid operational cost ID format'), 'API Route')
    }

    const { error } = await context.supabase
      .from('operational_costs')
      .delete()
      .eq('id', id)

    if (error) {
      if (error['code'] === 'PGRST116') {
        return handleAPIError(new Error('Operational cost not found'), 'API Route')
      }
      apiLogger.error({ error }, 'Error deleting operational cost')
      return handleAPIError(new Error('Failed to delete operational cost'), 'API Route')
    }

    return createSuccessResponse(null, SUCCESS_MESSAGES.OPERATIONAL_COST_DELETED)
  }
)