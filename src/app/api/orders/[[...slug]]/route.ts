// External libraries
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

// Internal modules
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { parseRouteParams } from '@/lib/api/route-helpers'
import { createDeleteHandler, createGetHandler, createUpdateHandler } from '@/lib/api/crud-helpers'
import { createPaginationMeta, createSuccessResponse } from '@/lib/api-core'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { cacheInvalidation, withCache } from '@/lib/cache'
import { generateCacheKey } from '@/lib/cache/cache-manager'
import { ORDER_FIELDS } from '@/lib/database/query-fields'
import { apiLogger } from '@/lib/logger'

// Types and schemas
import type { Database, FinancialRecordInsert, FinancialRecordUpdate, OrderInsert, OrderStatus } from '@/types/database'
import { OrderInsertSchema } from '@/lib/validations/domains/order'

// Services
import { PricingAssistantService } from '@/services/orders/PricingAssistantService'
import { CustomerPreferencesService } from '@/services/orders/CustomerPreferencesService'

// Constants and config
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'

export const runtime = 'nodejs'

type TypedSupabaseClient = SupabaseClient<Database>

const OrderListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(999999),
  search: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  status: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

const normalizeDateValue = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : undefined
}

interface FetchOrdersParams {
  page: number
  limit: number
  search?: string
  sort_by?: string
  sort_order?: string
  status?: string | null
  user_id: string
  from?: string
  to?: string
}

const fetchOrdersWithCache = async (supabase: SupabaseClient<Database>, params: FetchOrdersParams) => {
  const { page, limit, search, sort_by, sort_order, status, user_id } = params
  const cacheKey = generateCacheKey('ORDERS', [user_id, 'list', page.toString(), limit.toString(), search ?? '', sort_by ?? '', sort_order ?? '', status ?? '', params.from ?? '', params.to ?? ''])

  return withCache(async () => {
    let query = supabase
      .from('orders')
      .select(ORDER_FIELDS.DETAIL, { count: 'exact' })
      .eq('user_id', user_id)

    if (search) {
      query = query.or(`order_no.ilike.%${search}%,customer_name.ilike.%${search}%`)
    }
    if (status) {
      query = query.eq('status', status as OrderStatus)
    }

    const fromDate = normalizeDateValue(params.from)
    const toDate = normalizeDateValue(params.to)
    if (fromDate) query = query.gte('created_at', fromDate)
    if (toDate) query = query.lte('created_at', toDate)

    const { data, error, count } = await query
      .order(sort_by ?? 'created_at', { ascending: sort_order === 'asc' })
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw error

    const mappedData = data?.map((order: unknown) => {
      const orderData = order as Record<string, unknown>
      return { ...orderData, items: orderData['order_items'] ?? [] }
    }) ?? []

    return { data: mappedData, count }
  }, cacheKey, 5 * 60 * 1000)
}

// GET /api/orders or /api/orders/[id]
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/orders',
    querySchema: OrderListQuerySchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, validatedQuery?: z.infer<typeof OrderListQuerySchema>) => {
    const { params } = context
    const { slug, hasId } = parseRouteParams(params)

    if (!slug || slug.length === 0) {
      // GET /api/orders - List orders
      const { user, supabase } = context
      const { page = 1, limit = 999999, search, sort_by, sort_order, status, from, to } = validatedQuery!

      const paramsFetch: FetchOrdersParams = { page, limit, status: status || null, user_id: user.id }
      if (search) paramsFetch.search = search
      if (sort_by) paramsFetch.sort_by = sort_by
      if (sort_order) paramsFetch.sort_order = sort_order
      if (from) paramsFetch.from = from
      if (to) paramsFetch.to = to

      const { data: orders, count } = await fetchOrdersWithCache(supabase as SupabaseClient<Database>, paramsFetch)

      apiLogger.info({ userId: user.id, count: orders?.length, totalCount: count, cached: true }, 'GET /api/orders - Success')

      const pagination = createPaginationMeta(count ?? 0, page, limit)
      return createSuccessResponse(orders, undefined, pagination)
    } else if (hasId) {
      // GET /api/orders/[id] - Get single order
      return createGetHandler({
        table: 'orders',
        selectFields: `
          *,
          order_items (
            id,
            recipe_id,
            product_name,
            quantity,
            unit_price,
            total_price,
            special_requests,
            recipe:recipes (
              id,
              name,
              image_url
            )
          )
        `,
      })(context)
    } else {
      return handleAPIError(new Error('Invalid path'), 'GET /api/orders')
    }
  }
)

// POST /api/orders - Create order
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/orders',
    bodySchema: OrderInsertSchema,
  },
  async (context: RouteContext, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (slug && slug.length > 0) {
      return handleAPIError(new Error('Method not allowed'), 'POST /api/orders')
    }

    const { user, supabase } = context
    const typedSupabase = supabase as TypedSupabaseClient

    if (!body) {
      return handleAPIError(new Error('Request body is required'), 'POST /api/orders')
    }

    // Validate inventory availability for order items
    if (body.items && body.items.length > 0) {
      try {
        const inventoryValidation = await PricingAssistantService.validateOrderInventory(
          body.items.map((item) => ({ recipe_id: item.recipe_id, quantity: item.quantity })),
          user.id
        )

        if (!inventoryValidation.valid) {
          // Return detailed inventory validation error
          return handleAPIError(new Error('Insufficient inventory for order'), 'API Route')
        }

        // Log low stock warnings
        if (inventoryValidation.lowStockWarnings.length > 0) {
          apiLogger.warn({
            orderItems: body.items.length,
            lowStockWarnings: inventoryValidation.lowStockWarnings.length,
            warnings: inventoryValidation.lowStockWarnings
          }, 'Order created with low stock warnings')
        }
      } catch (validationError) {
        apiLogger.error({ error: validationError }, 'Inventory validation failed')
        return handleAPIError(validationError as Error, 'POST /api/orders')
      }
    }

    const orderStatus = body.status || 'PENDING'
    let incomeRecordId: string | null = null

    // Create income record if DELIVERED
    if (orderStatus === 'DELIVERED' && body.total_amount && body.total_amount > 0) {
      const incomeDate = normalizeDateValue(body.delivery_date) ?? normalizeDateValue(body.order_date) ?? new Date().toISOString().split('T')[0]
      const incomeData: FinancialRecordInsert = {
        user_id: user.id,
        type: 'INCOME',
        category: 'Revenue',
        amount: body.total_amount,
        date: incomeDate ?? null,
        reference: `Order #${body.order_no}${body.customer_name ? ` - ${body.customer_name}` : ''}`,
        description: `Income from order ${body.order_no}`
      }

      const { data: incomeRecord, error: incomeError } = await typedSupabase
        .from('financial_records')
        .insert(incomeData)
        .select('id')
        .single()

      if (incomeError) {
        apiLogger.error({ error: incomeError }, 'Failed to create income record')
        return handleAPIError(incomeError, 'POST /api/orders')
      }

      incomeRecordId = (incomeRecord as { id: string }).id
    }

    // Create order
    const orderInsertData: OrderInsert = {
      ...Object.fromEntries(Object.entries(body).map(([key, value]) => [key, value ?? null])),
      user_id: user.id,
      status: orderStatus,
      order_date: body.order_date ?? new Date().toISOString().split('T')[0],
      tax_amount: body.tax_amount ?? 0,
      payment_status: body.payment_status ?? 'UNPAID',
      financial_record_id: incomeRecordId
    } as OrderInsert

    const { data: orderData, error: orderError } = await typedSupabase
      .from('orders')
      .insert(orderInsertData)
      .select('id, order_no, customer_name, status, total_amount, created_at')
      .single()

    if (orderError) {
      apiLogger.error({ error: orderError }, 'Failed to create order')
      if (incomeRecordId) {
          await typedSupabase.from('financial_records').delete().eq('id', incomeRecordId).eq('user_id', user.id)
      }
      return handleAPIError(orderError, 'POST /api/orders')
    }

    const createdOrder = orderData as { id: string; order_no: string; customer_name: string | null }

    // Update income record reference
    if (incomeRecordId) {
      const updateData: FinancialRecordUpdate = { reference: `Order ${createdOrder.id} - ${body.customer_name || 'Customer'}` }
      await typedSupabase.from('financial_records').update(updateData).eq('id', incomeRecordId).eq('user_id', user.id)
    }

    // Create order items
    if (body.items && body.items.length > 0) {
      const orderItems = body.items.map((item) => ({
        recipe_id: item.recipe_id,
        product_name: item.product_name ?? null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price || (item.quantity * item.unit_price),
        special_requests: item.special_requests ?? null,
        order_id: createdOrder.id,
        user_id: user.id
      }))

      const { error: itemsError } = await typedSupabase.from('order_items').insert(orderItems)

      if (itemsError) {
        apiLogger.error({ error: itemsError }, 'Failed to create order items')
        await typedSupabase.from('orders').delete().eq('id', createdOrder.id).eq('user_id', user.id)
        if (incomeRecordId) {
        await typedSupabase.from('financial_records').delete().eq('id', incomeRecordId).eq('user_id', user.id)
        }
        return handleAPIError(itemsError, 'POST /api/orders')
      }
    }

    // Update customer preferences for demand forecasting
    if (body.customer_id && body.items && body.items.length > 0) {
      try {
        await CustomerPreferencesService.updateCustomerPreferences(
          body.customer_id,
          body.items.map((item) => ({ recipe_id: item.recipe_id, quantity: item.quantity })),
          user.id
        )
      } catch (prefError) {
        // Don't fail the order creation for preference update failure
        apiLogger.warn({ error: prefError, customerId: body.customer_id }, 'Failed to update customer preferences')
      }
    }

    cacheInvalidation.orders()
    apiLogger.info({ userId: user.id, orderId: createdOrder.id, incomeRecorded: Boolean(incomeRecordId) }, 'POST /api/orders - Success')

    return createSuccessResponse({ ...createdOrder, income_recorded: Boolean(incomeRecordId) }, SUCCESS_MESSAGES.ORDER_CREATED, undefined, 201)
  }
)

// PUT /api/orders/[id] - Update order
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/orders/[id]',
    bodySchema: OrderInsertSchema, // Using insert schema for updates (partial)
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'PUT /api/orders')
    }
    return createUpdateHandler({
      table: 'orders',
      selectFields: `
        *,
        order_items (
          id,
          recipe_id,
          product_name,
          quantity,
          unit_price,
          total_price
        )
      `,
    }, SUCCESS_MESSAGES.ORDER_UPDATED)(context, undefined, body)
  }
)

// DELETE /api/orders/[id] - Delete order
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/orders/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'DELETE /api/orders')
    }
    return createDeleteHandler(
      {
        table: 'orders',
      },
      SUCCESS_MESSAGES.ORDER_DELETED
    )(context)
  }
)