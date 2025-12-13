// External libraries
import { NextResponse } from 'next/server'
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
      return handleAPIError(new Error('Invalid path'), 'GET /api/operational-costs')
    }
  }
)

// Default templates for quick setup
const QUICK_SETUP_TEMPLATES = [
  { category: 'utilities', description: 'Listrik', amount: 0, frequency: 'monthly', recurring: true },
  { category: 'utilities', description: 'Air', amount: 0, frequency: 'monthly', recurring: true },
  { category: 'rent', description: 'Sewa Tempat', amount: 0, frequency: 'monthly', recurring: true },
  { category: 'staff', description: 'Gaji Karyawan', amount: 0, frequency: 'monthly', recurring: true },
  { category: 'transport', description: 'BBM & Transport', amount: 0, frequency: 'monthly', recurring: false },
  { category: 'communication', description: 'Internet & Telepon', amount: 0, frequency: 'monthly', recurring: true },
  { category: 'maintenance', description: 'Perawatan Peralatan', amount: 0, frequency: 'monthly', recurring: false },
  { category: 'other', description: 'Biaya Lainnya', amount: 0, frequency: 'monthly', recurring: false },
]

// POST /api/operational-costs or /api/operational-costs/quick-setup
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/operational-costs',
    bodySchema: OperationalCostInsertSchema.optional(),
  },
  async (context, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    
    // Handle quick-setup endpoint
    if (slug && slug.length === 1 && slug[0] === 'quick-setup') {
      const { supabase, user } = context
      
      // Get existing categories to avoid duplicates
      const { data: existingCosts } = await supabase
        .from('operational_costs')
        .select('category, description')
        .eq('user_id', user.id)
      
      const existingKeys = new Set(
        (existingCosts || []).map(c => `${c.category}-${c.description}`)
      )
      
      // Filter out templates that already exist
      const templatesToAdd = QUICK_SETUP_TEMPLATES.filter(
        t => !existingKeys.has(`${t.category}-${t.description}`)
      )
      
      if (templatesToAdd.length === 0) {
        return NextResponse.json(
          { success: true, count: 0, message: 'Semua template sudah ada' },
          { status: 200 }
        )
      }
      
      // Add user_id and date to each template
      const today = new Date().toISOString().split('T')[0] ?? null
      const templatesWithUser = templatesToAdd.map(t => ({
        ...t,
        user_id: user.id,
        date: today,
      }))
      
      const { error } = await supabase
        .from('operational_costs')
        .insert(templatesWithUser)
      
      if (error) {
        return handleAPIError(error, 'POST /api/operational-costs/quick-setup')
      }
      
      // Trigger HPP recalculation
      void (async () => {
        try {
          const { HppTriggerService } = await import('@/services/hpp/HppTriggerService')
          const hppTrigger = new HppTriggerService({ userId: user.id, supabase })
          await hppTrigger.onOperationalCostsChange()
        } catch (hppError) {
          const { apiLogger } = await import('@/lib/logger')
          apiLogger.error({ error: hppError }, 'Failed to trigger HPP recalculation on quick setup')
        }
      })()
      
      return NextResponse.json(
        { success: true, count: templatesToAdd.length },
        { status: 201 }
      )
    }
    
    // Regular create - reject if slug is present (except quick-setup handled above)
    if (slug && slug.length > 0) {
      return handleAPIError(new Error('Method not allowed'), 'POST /api/operational-costs')
    }

    const result = await createCreateHandler(
      {
        table: 'operational_costs',
        selectFields: '*',
      },
      SUCCESS_MESSAGES.OPERATIONAL_COST_CREATED
    )(context, undefined, body)

    // Trigger HPP recalculation asynchronously (non-blocking) for better UX
    if (result.status === 201) {
      // Fire and forget - don't await
      void (async () => {
        try {
          const { HppTriggerService } = await import('@/services/hpp/HppTriggerService')
          const { user, supabase } = context
          const hppTrigger = new HppTriggerService({ userId: user.id, supabase })
          await hppTrigger.onOperationalCostsChange()
        } catch (hppError) {
          const { apiLogger } = await import('@/lib/logger')
          apiLogger.error({ error: hppError }, 'Failed to trigger HPP recalculation on operational cost create')
        }
      })()
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
      return handleAPIError(new Error('Invalid path'), 'PUT /api/operational-costs/[id]')
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

    // Trigger HPP recalculation asynchronously (non-blocking) for better UX
    if (result.status === 200 && body && 'amount' in body) {
      void (async () => {
        try {
          const { HppTriggerService } = await import('@/services/hpp/HppTriggerService')
          const { user, supabase } = context
          const hppTrigger = new HppTriggerService({ userId: user.id, supabase })
          await hppTrigger.onOperationalCostsChange()
        } catch (hppError) {
          const { apiLogger } = await import('@/lib/logger')
          apiLogger.error({ error: hppError }, 'Failed to trigger HPP recalculation on operational cost update')
        }
      })()
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
      return handleAPIError(new Error('Invalid path'), 'DELETE /api/operational-costs/[id]')
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

    // Trigger HPP recalculation asynchronously (non-blocking) for better UX
    if (result.status === 200) {
      void (async () => {
        try {
          const { HppTriggerService } = await import('@/services/hpp/HppTriggerService')
          const { user, supabase } = context
          const hppTrigger = new HppTriggerService({ userId: user.id, supabase })
          await hppTrigger.onOperationalCostsChange()
        } catch (hppError) {
          const { apiLogger } = await import('@/lib/logger')
          apiLogger.error({ error: hppError }, 'Failed to trigger HPP recalculation on operational cost delete')
        }
      })()
    }

    return result
  }
)