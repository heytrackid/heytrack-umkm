// External libraries
// Internal modules
import { createCreateHandler, createDeleteHandler, createGetHandler, createListHandler, createUpdateHandler } from '@/lib/api/crud-helpers'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { parseRouteParams } from '@/lib/api/route-helpers'
import { handleAPIError } from '@/lib/errors/api-error-handler'
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
    } else if (slug.length === 1 && slug[0]) {
      // GET /api/operational-costs/[id] - Get single operational cost
      const contextWithId = {
        ...context,
        params: { ...context.params, id: slug[0] } as Record<string, string | string[]>
      }
      return createGetHandler({
        table: 'operational_costs',
        selectFields: '*',
      })(contextWithId)
    } else {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
  }
)

// POST /api/operational-costs - Create operational cost with HPP trigger
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

    const result = await createCreateHandler(
      {
        table: 'operational_costs',
        selectFields: '*',
      },
      SUCCESS_MESSAGES.OPERATIONAL_COST_CREATED
    )(context, undefined, body)

    // Trigger HPP recalculation for all recipes when operational costs change
    if (result.status === 201) {
      try {
        const { HppTriggerService } = await import('@/services/hpp/HppTriggerService')
        const { user, supabase } = context
        const hppTrigger = new HppTriggerService({ userId: user.id, supabase })
        await hppTrigger.onOperationalCostsChange()
      } catch (hppError) {
        const { apiLogger } = await import('@/lib/logger')
        apiLogger.error({ error: hppError }, 'Failed to trigger HPP recalculation on operational cost create')
      }
    }

    return result
  }
)

// PUT /api/operational-costs/[id] - Update operational cost with HPP trigger
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/operational-costs/[id]',
    bodySchema: OperationalCostUpdateSchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1 || !slug[0]) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
    const contextWithId = {
      ...context,
      params: { ...context.params, id: slug[0] } as Record<string, string | string[]>
    }

    const result = await createUpdateHandler(
      {
        table: 'operational_costs',
        selectFields: '*',
      },
      SUCCESS_MESSAGES.OPERATIONAL_COST_UPDATED
    )(contextWithId, undefined, body)

    // Trigger HPP recalculation when operational costs change
    if (result.status === 200 && body && 'amount' in body) {
      try {
        const { HppTriggerService } = await import('@/services/hpp/HppTriggerService')
        const { user, supabase } = context
        const hppTrigger = new HppTriggerService({ userId: user.id, supabase })
        await hppTrigger.onOperationalCostsChange()
      } catch (hppError) {
        const { apiLogger } = await import('@/lib/logger')
        apiLogger.error({ error: hppError }, 'Failed to trigger HPP recalculation on operational cost update')
      }
    }

    return result
  }
)

// DELETE /api/operational-costs/[id] - Delete operational cost with HPP trigger
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/operational-costs/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  async (context) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1 || !slug[0]) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
    const contextWithId = {
      ...context,
      params: { ...context.params, id: slug[0] } as Record<string, string | string[]>
    }
    const result = await createDeleteHandler(
      {
        table: 'operational_costs',
      },
      SUCCESS_MESSAGES.OPERATIONAL_COST_DELETED
    )(contextWithId)

    // Trigger HPP recalculation when operational costs change
    if (result.status === 200) {
      try {
        const { HppTriggerService } = await import('@/services/hpp/HppTriggerService')
        const { user, supabase } = context
        const hppTrigger = new HppTriggerService({ userId: user.id, supabase })
        await hppTrigger.onOperationalCostsChange()
      } catch (hppError) {
        const { apiLogger } = await import('@/lib/logger')
        apiLogger.error({ error: hppError }, 'Failed to trigger HPP recalculation on operational cost delete')
      }
    }

    return result
  }
)