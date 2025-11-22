// Internal modules
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { parseRouteParams } from '@/lib/api/route-helpers'
import { createCreateHandler, createListHandler, createGetHandler, createUpdateHandler, ListQuerySchema } from '@/lib/api/crud-helpers'
import { createSuccessResponse } from '@/lib/api-core'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { CUSTOMER_FIELDS } from '@/lib/database/query-fields'
import { apiLogger } from '@/lib/logger'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { cacheInvalidation } from '@/lib/cache'

// Types and schemas
import { CustomerInsertSchema, CustomerUpdateSchema } from '@/lib/validations/domains/customer'

// Constants and config
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'

export const runtime = 'nodejs'

// GET /api/customers or /api/customers/[id]
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/customers',
    querySchema: ListQuerySchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, validatedQuery) => {
    const { params } = context
    const { slug, hasId } = parseRouteParams(params)

    if (!slug || slug.length === 0) {
      // GET /api/customers - List all customers
      return createListHandler({
        table: 'customers',
        selectFields: CUSTOMER_FIELDS.LIST,
        defaultSort: 'name',
        defaultOrder: 'asc',
        searchFields: ['name', 'email', 'phone'],
      })(context, validatedQuery)
    } else if (hasId) {
      // GET /api/customers/[id] - Get single customer
      return createGetHandler({
        table: 'customers',
        selectFields: 'id, user_id, name, email, phone, address, customer_type, discount_percentage, notes, is_active, loyalty_points, created_at, updated_at',
      })(context)
    } else {
      return handleAPIError(new Error('Invalid path'), 'GET /api/customers')
    }
  }
)

// POST /api/customers - Create new customer
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/customers',
    bodySchema: CustomerInsertSchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, _query, body) => {
    const { slug } = parseRouteParams(context.params)
    if (slug && slug.length > 0) {
      return handleAPIError(new Error('Method not allowed'), 'POST /api/customers')
    }
    const result = await createCreateHandler(
      {
        table: 'customers',
        selectFields: 'id, name, email, phone, address, customer_type, discount_percentage, notes, is_active, loyalty_points, created_at, updated_at',
      },
      SUCCESS_MESSAGES.CUSTOMER_CREATED
    )(context, undefined, body)

    // Invalidate cache after successful creation
    if (result.status === 201) {
      cacheInvalidation.customers()
    }

    return result
  }
)

// PUT /api/customers/[id] - Update customer
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/customers/[id]',
    bodySchema: CustomerUpdateSchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, _query, body) => {
    const { hasId, id } = parseRouteParams(context.params)
    if (!hasId) {
      return handleAPIError(new Error('Invalid path'), 'PUT /api/customers')
    }
    const result = await createUpdateHandler(
      {
        table: 'customers',
        selectFields: 'id, name, email, phone, address, customer_type, discount_percentage, notes, is_active, loyalty_points, updated_at',
      },
      SUCCESS_MESSAGES.CUSTOMER_UPDATED
    )(context, undefined, body)

    // Invalidate cache after successful update
    if (result.status === 200) {
      cacheInvalidation.customers(id)
    }

    return result
  }
)

// DELETE /api/customers/[id] - Delete customer with order validation
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/customers/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext) => {
    const { user, supabase } = context
    const { id } = parseRouteParams(context.params)

    if (!id) {
      return handleAPIError(new Error('Customer ID is required'), 'DELETE /api/customers')
    }

    // Check if customer has unknown orders
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('customer_id', id)
      .eq('user_id', user.id)
      .limit(1)

    if (orders && orders.length > 0) {
      return handleAPIError(new Error('Cannot delete customer with existing orders. Please delete orders first.'), 'DELETE /api/customers')
    }

    // Delete customer
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      apiLogger.error({ error, id }, 'Failed to delete customer')

      if (error.code === 'PGRST116') {
        return handleAPIError(new Error('Customer not found'), 'DELETE /api/customers')
      }

      return handleAPIError(error, 'DELETE /api/customers')
    }

    cacheInvalidation.customers(id)
    return createSuccessResponse({ id }, SUCCESS_MESSAGES.CUSTOMER_DELETED)
  }
)