// External libraries
// Internal modules
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { parseRouteParams } from '@/lib/api/route-helpers'
import { ListQuerySchema, createCreateHandler, createListHandler, createGetHandler, createUpdateHandler } from '@/lib/api/crud-helpers'
import { createSuccessResponse } from '@/lib/api-core/responses'
import { cacheInvalidation } from '@/lib/cache'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { SecurityPresets } from '@/utils/security/api-middleware'

// Types and schemas
import { SupplierInsertSchema, SupplierUpdateSchema } from '@/lib/validations/domains/supplier'

// Constants and config
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'

export const runtime = 'nodejs'

// GET /api/suppliers or /api/suppliers/[id]
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/suppliers',
    querySchema: ListQuerySchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, validatedQuery) => {
    const { params } = context
    const { slug } = parseRouteParams(params)

    if (!slug || slug.length === 0) {
      // GET /api/suppliers - List all suppliers
      return createListHandler({
        table: 'suppliers',
        selectFields: 'id, name, contact_person, email, phone, address, notes, is_active, created_at, updated_at',
        defaultSort: 'name',
        defaultOrder: 'asc',
        searchFields: ['name', 'contact_person', 'email'],
      })(context, validatedQuery)
    } else if (slug && slug.length === 1) {
      // GET /api/suppliers/[id] - Get single supplier
      return createGetHandler({
        table: 'suppliers',
        selectFields: 'id, name, contact_person, email, phone, address, notes, is_active, created_at, updated_at',
      })(context)
    } else {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
  }
)

// POST /api/suppliers - Create new supplier
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/suppliers',
    bodySchema: SupplierInsertSchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (slug && slug.length > 0) {
      return handleAPIError(new Error('Method not allowed'), 'API Route')
    }
    return createCreateHandler(
      {
        table: 'suppliers',
        selectFields: 'id, name, contact_person, email, phone, address, notes, is_active, created_at, updated_at',
      },
      SUCCESS_MESSAGES.SUPPLIER_CREATED
    )(context, undefined, body)
  }
)

// PUT /api/suppliers/[id] - Update supplier
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/suppliers/[id]',
    bodySchema: SupplierUpdateSchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
    return createUpdateHandler(
      {
        table: 'suppliers',
        selectFields: 'id, name, contact_person, email, phone, address, notes, is_active, updated_at',
      },
      SUCCESS_MESSAGES.SUPPLIER_UPDATED
    )(context, undefined, body)
  }
)

// DELETE /api/suppliers/[id] - Delete supplier with validation
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/suppliers/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext) => {
    const { user, supabase } = context
    const slug = context.params?.['slug'] as string[] | undefined
    const id = slug && slug.length === 1 ? slug[0] : null

    if (!id) {
      return handleAPIError(new Error('Supplier ID is required'), 'API Route')
    }

    // Check if supplier is used in ingredients
    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('id')
      .eq('supplier_id', id)
      .eq('user_id', user.id)
      .limit(1)

    if (ingredients && ingredients.length > 0) {
      return handleAPIError(new Error('Cannot delete supplier with existing ingredients'), 'API Route')
    }

    // Delete supplier
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      apiLogger.error({ error, id }, 'Failed to delete supplier')
      return handleAPIError(new Error('Failed to delete supplier'), 'API Route')
    }

    cacheInvalidation.suppliers()
    return createSuccessResponse({ id }, SUCCESS_MESSAGES.SUPPLIER_DELETED)
  }
)