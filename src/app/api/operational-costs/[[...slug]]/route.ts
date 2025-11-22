// External libraries
// Internal modules
import { createSuccessResponse } from '@/lib/api-core'
import { createCreateHandler, createDeleteHandler, createListHandler, createUpdateHandler } from '@/lib/api/crud-helpers'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { parseRouteParams } from '@/lib/api/route-helpers'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { isValidUUID } from '@/lib/type-guards'
import { SecurityPresets } from '@/utils/security/api-middleware'
// Types and schemas
import { OperationalCostInsertSchema, OperationalCostUpdateSchema } from '@/lib/validations/domains/finance'

// Constants and config
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'

export const runtime = 'nodejs'

// GET /api/operational-costs or /api/operational-costs/[id]
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/operational-costs',
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, validatedQuery: unknown) => {
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
      })(context, validatedQuery as { page: number; limit: number; sort?: string; order?: 'asc' | 'desc'; search?: string } | undefined)
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
    securityPreset: SecurityPresets.basic(),
  },
  async (context, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
    return createUpdateHandler(
      {
        table: 'operational_costs',
        selectFields: '*',
      },
      SUCCESS_MESSAGES.OPERATIONAL_COST_UPDATED
    )(context, undefined, body)
  }
)

// DELETE /api/operational-costs/[id] - Delete operational cost
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/operational-costs/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  async (context) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
    return createDeleteHandler(
      {
        table: 'operational_costs',
      },
      SUCCESS_MESSAGES.OPERATIONAL_COST_DELETED
    )(context)
  }
)