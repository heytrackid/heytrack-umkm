// External libraries
import type { SupabaseClient } from '@supabase/supabase-js'

// Internal modules
import { createPaginationMeta, createSuccessResponse } from '@/lib/api-core'
import { createGetHandler, createUpdateHandler } from '@/lib/api/crud-helpers'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { parseRouteParams } from '@/lib/api/route-helpers'
import { cacheInvalidation, withCache } from '@/lib/cache'
import { generateCacheKey } from '@/lib/cache/cache-manager'
import { ORDER_FIELDS } from '@/lib/database/query-fields'
import { createValidationError, handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { SecurityPresets } from '@/utils/security/api-middleware'

// Types and schemas
import { OrderInsertSchema, OrderListQuerySchema, type OrderListQuery } from '@/lib/validations/domains/order'
import type { Database, FinancialRecordInsert, FinancialRecordUpdate, OrderInsert, OrderStatus } from '@/types/database'

// Services

// Constants and config
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'

export const runtime = 'nodejs'

type TypedSupabaseClient = SupabaseClient<Database>

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
  async (context: RouteContext, validatedQuery?: OrderListQuery) => {
    const { params } = context
    const { slug, hasId } = parseRouteParams(params)

    if (!slug || slug.length === 0) {
      // GET /api/orders - List orders
      const { user, supabase } = context
      const { page = 1, limit = 100, search, sort_by, sort_order, status, from, to } = validatedQuery!

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
    } else if (hasId && slug[0]) {
      // GET /api/orders/[id] - Get single order
      const contextWithId = {
        ...context,
        params: { ...context.params, id: slug[0] } as Record<string, string | string[]>
      }
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
      })(contextWithId)
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

    // FIXED: Atomic stock reservation to prevent race conditions
    if (body.items && body.items.length > 0) {
      try {
        // Reserve stock atomically - this checks availability AND reserves in one transaction
        const { data: stockReserved, error: reservationError } = await typedSupabase
          .rpc('reserve_stock_for_order', {
            p_user_id: user.id,
            p_order_items: JSON.stringify(body.items.map(item => ({
              recipe_id: item.recipe_id,
              quantity: item.quantity
            })))
          })

        if (reservationError) {
          apiLogger.error({ error: reservationError }, 'Stock reservation failed')
          return handleAPIError(reservationError, 'POST /api/orders')
        }

        if (!stockReserved) {
          return createValidationError('Insufficient inventory for order', undefined, 'POST /api/orders')
        }

        apiLogger.info({
          orderItems: body.items.length,
          userId: user.id
        }, 'Stock reserved successfully for order')

      } catch (reservationError) {
        apiLogger.error({ error: reservationError }, 'Stock reservation error')
        return handleAPIError(reservationError as Error, 'POST /api/orders')
      }
    }

    const orderStatus = body.status || 'PENDING'
    let incomeRecordId: string | null = null

    // Create income record if READY/IN_PROGRESS (produksi) or DELIVERED
    // Many users mark orders as READY directly, so we also record income at READY.
    const shouldCreateIncome = (orderStatus === 'READY' || orderStatus === 'IN_PROGRESS' || orderStatus === 'DELIVERED') && body.total_amount && body.total_amount > 0
    if (shouldCreateIncome) {
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
    // FIXED: Wrap entire order creation in try-catch with stock rollback
    let createdOrder: { id: string; order_no: string; customer_name: string | null } | null = null
    
    try {
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
        throw orderError
      }

      createdOrder = orderData as { id: string; order_no: string; customer_name: string | null }

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
          order_id: createdOrder!.id,
          user_id: user.id
        }))

        const { error: itemsError } = await typedSupabase.from('order_items').insert(orderItems)

        if (itemsError) {
          apiLogger.error({ error: itemsError }, 'Failed to create order items')
          throw itemsError
        }
      }

      apiLogger.info({ 
        orderId: createdOrder.id, 
        orderNo: createdOrder.order_no,
        userId: user.id 
      }, 'Order created successfully with stock reservation')

      return createSuccessResponse({
        ...createdOrder,
        items: body.items || []
      }, 'Order created successfully')

    } catch (creationError: unknown) {
      // CRITICAL: Release reserved stock if order creation fails
      apiLogger.error({ error: creationError, userId: user.id }, 'Order creation failed, releasing reserved stock')
      
      if (body.items && body.items.length > 0) {
        try {
          const { error: releaseError } = await typedSupabase
            .rpc('release_reserved_stock', {
              p_user_id: user.id,
              p_order_items: JSON.stringify(body.items.map(item => ({
                recipe_id: item.recipe_id,
                quantity: item.quantity
              })))
            })

          if (releaseError) {
            apiLogger.error({ error: releaseError }, 'CRITICAL: Failed to release reserved stock after order creation failure')
          } else {
            apiLogger.warn({ userId: user.id, itemsCount: body.items.length }, 'Reserved stock released due to order creation failure')
          }
        } catch (rollbackError) {
          apiLogger.error({ error: rollbackError }, 'CRITICAL: Stock rollback failed - manual intervention may be needed')
        }
      }

      // Clean up financial record if it was created
      if (incomeRecordId) {
        await typedSupabase.from('financial_records').delete().eq('id', incomeRecordId).eq('user_id', user.id)
      }

      // Clean up order if it was partially created
      if (createdOrder) {
        await typedSupabase.from('orders').delete().eq('id', createdOrder.id).eq('user_id', user.id)
      }

      return handleAPIError(creationError, 'POST /api/orders')
    }
  }
)

// PUT /api/orders/[id] - Update order with financial sync
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/orders/[id]',
    bodySchema: OrderInsertSchema, // Using insert schema for updates (partial)
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1 || !slug[0]) {
      return handleAPIError(new Error('Invalid path'), 'PUT /api/orders')
    }

    const { user, supabase } = context
    const orderId = slug[0]
    const typedSupabase = supabase as TypedSupabaseClient

    // Get current order state
    const { data: currentOrder } = await typedSupabase
      .from('orders')
      .select('status, total_amount, order_no, customer_name, customer_id, delivery_date, order_date, financial_record_id, notes')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (!currentOrder) {
      return handleAPIError(new Error('Order not found'), 'PUT /api/orders')
    }

    const newStatus = body?.status as OrderStatus | undefined
    const statusChanged = newStatus && newStatus !== currentOrder.status

    // Validate status transition if status is changing
    if (statusChanged && currentOrder.status) {
      const { VALID_ORDER_STATUS_TRANSITIONS } = await import('@/lib/shared/constants')
      const validTransitions = VALID_ORDER_STATUS_TRANSITIONS[currentOrder.status] || []
      if (!validTransitions.includes(newStatus)) {
        return handleAPIError(
          new Error(`Invalid status transition from ${currentOrder.status} to ${newStatus}. Allowed transitions: ${validTransitions.join(', ') || 'none'}`),
          'PUT /api/orders'
        )
      }
    }

    // Handle financial record sync based on status change
    if (statusChanged) {
      // Import FinancialSyncService dynamically to avoid circular deps
      const { FinancialSyncService } = await import('@/services/financial/FinancialSyncService')
      const financialService = new FinancialSyncService({ userId: user.id, supabase: typedSupabase })

      // If changing TO READY/IN_PROGRESS - create income record (so sales are readable)
      if ((newStatus === 'IN_PROGRESS' || newStatus === 'READY') && !currentOrder.financial_record_id) {
        try {
          await financialService.createIncomeFromOrder(
            orderId,
            currentOrder.order_no,
            body?.total_amount ?? currentOrder.total_amount ?? 0,
            body?.customer_name ?? currentOrder.customer_name ?? undefined,
            body?.delivery_date ?? currentOrder.delivery_date ?? currentOrder.order_date ?? undefined
          )
          apiLogger.info({ orderId, newStatus }, 'Income record created on status change')
        } catch (err) {
          apiLogger.error({ error: err, orderId }, 'Failed to create income record on status change')
          // Mark order as needing financial sync retry
          await typedSupabase
            .from('orders')
            .update({ notes: `[SYNC_NEEDED] ${body?.notes ?? currentOrder.notes ?? ''}`.trim() })
            .eq('id', orderId)
            .eq('user_id', user.id)
        }
      }

      // If changing TO CANCELLED - reverse income record and release reserved stock
      if (newStatus === 'CANCELLED' && currentOrder.status !== 'CANCELLED') {
        try {
          // Reverse income record if exists
          if (currentOrder.financial_record_id) {
            await financialService.reverseOrderIncome(orderId)
            apiLogger.info({ orderId }, 'Income record reversed on order cancellation')
          }

          // FIXED: Release reserved stock back to available inventory
          const { data: orderItems } = await typedSupabase
            .from('order_items')
            .select('recipe_id, quantity')
            .eq('order_id', orderId)
          
          if (orderItems && orderItems.length > 0) {
            const { error: releaseError } = await typedSupabase
              .rpc('release_reserved_stock', {
                p_user_id: user.id,
                p_order_items: JSON.stringify(orderItems.map(item => ({
                  recipe_id: item.recipe_id,
                  quantity: item.quantity
                })))
              })

            if (releaseError) {
              apiLogger.error({ error: releaseError, orderId }, 'Failed to release reserved stock on cancellation')
            } else {
              apiLogger.info({ orderId, itemsCount: orderItems.length }, 'Reserved stock released on order cancellation')
            }
          }
        } catch (err) {
          apiLogger.error({ error: err, orderId }, 'Failed to handle order cancellation')
        }
      }

      // Deduct inventory if changing TO IN_PROGRESS (produksi)
      // Stock berkurang saat mulai produksi, bukan saat delivered
      if (newStatus === 'IN_PROGRESS' && currentOrder.status !== 'IN_PROGRESS') {
        try {
          // FIXED: Use atomic stock deduction from reservations
          const { data: orderItems } = await typedSupabase
            .from('order_items')
            .select('recipe_id, quantity')
            .eq('order_id', orderId)
          
          if (orderItems && orderItems.length > 0) {
            const { error: deductionError } = await typedSupabase
              .rpc('deduct_stock_from_reservations', {
                p_user_id: user.id,
                p_order_items: JSON.stringify(orderItems.map(item => ({
                  recipe_id: item.recipe_id,
                  quantity: item.quantity
                })))
              })

            if (deductionError) {
              apiLogger.error({ error: deductionError, orderId }, 'Failed to deduct stock from reservations')
            } else {
              apiLogger.info({ orderId, itemsCount: orderItems.length }, 'Stock deducted from reservations on production start')
            }
          }
        } catch (inventoryError) {
          apiLogger.error({ error: inventoryError, orderId }, 'Failed to deduct inventory on IN_PROGRESS')
        }
      }

      // Restore inventory if changing FROM IN_PROGRESS/READY/DELIVERED to CANCELLED
      const stockAlreadyDeducted = ['IN_PROGRESS', 'READY', 'DELIVERED'].includes(currentOrder.status ?? '')
      if (newStatus === 'CANCELLED' && stockAlreadyDeducted) {
        try {
          const { InventorySyncService } = await import('@/services/inventory/InventorySyncService')
          const inventoryService = new InventorySyncService({ userId: user.id, supabase: typedSupabase })
          
          // Get order items to restore
          const { data: orderItems } = await typedSupabase
            .from('order_items')
            .select('recipe_id, quantity')
            .eq('order_id', orderId)
          
          if (orderItems && orderItems.length > 0) {
            for (const item of orderItems) {
              await inventoryService.restoreStockForCancelledOrder(
                item.recipe_id,
                orderId,
                item.quantity
              )
            }
            apiLogger.info({ orderId, itemsCount: orderItems.length }, 'Inventory restored on cancellation')
          }
        } catch (inventoryError) {
          apiLogger.error({ error: inventoryError, orderId }, 'Failed to restore inventory on cancellation')
        }
      }

      // Update customer stats based on status change
      const customerId = body?.customer_id ?? currentOrder.customer_id
      const orderAmount = body?.total_amount ?? currentOrder.total_amount ?? 0
      
      if (customerId && orderAmount > 0) {
        try {
          const { CustomerStatsService } = await import('@/services/stats/CustomerStatsService')
          const statsService = new CustomerStatsService({ userId: user.id, supabase: typedSupabase })
          
          // If changing TO DELIVERED - increment customer stats
          if (newStatus === 'DELIVERED' && currentOrder.status !== 'DELIVERED') {
            await statsService.updateStatsFromOrder(customerId, orderAmount)
            apiLogger.info({ orderId, customerId }, 'Customer stats updated on DELIVERED')
          }
          
          // If changing FROM DELIVERED to CANCELLED - reverse customer stats
          if (newStatus === 'CANCELLED' && currentOrder.status === 'DELIVERED') {
            await statsService.reverseStatsFromOrder(customerId, orderAmount)
            apiLogger.info({ orderId, customerId }, 'Customer stats reversed on CANCELLED')
          }
        } catch (statsError) {
          apiLogger.warn({ error: statsError, customerId }, 'Failed to update customer stats on status change')
        }
      }
    }

    // Proceed with standard update
    const contextWithId = {
      ...context,
      params: { ...context.params, id: slug[0] } as Record<string, string | string[]>
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
    }, SUCCESS_MESSAGES.ORDER_UPDATED)(contextWithId, undefined, body)
  }
)

// DELETE /api/orders/[id] - Delete order with proper cleanup
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/orders/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1 || !slug[0]) {
      return handleAPIError(new Error('Invalid path'), 'DELETE /api/orders')
    }

    const { user, supabase } = context
    const orderId = slug[0]
    const typedSupabase = supabase as TypedSupabaseClient

    // Get order data before deletion for cleanup
    const { data: orderToDelete, error: fetchError } = await typedSupabase
      .from('orders')
      .select('id, status, total_amount, customer_id, financial_record_id')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !orderToDelete) {
      return handleAPIError(new Error('Order not found'), 'DELETE /api/orders')
    }

    // 1. Cleanup: Delete linked financial record if exists
    if (orderToDelete.financial_record_id) {
      const { error: finError } = await typedSupabase
        .from('financial_records')
        .delete()
        .eq('id', orderToDelete.financial_record_id)
        .eq('user_id', user.id)

      if (finError) {
        apiLogger.warn({ error: finError, orderId, recordId: orderToDelete.financial_record_id }, 'Failed to delete linked financial record')
      } else {
        apiLogger.info({ orderId, recordId: orderToDelete.financial_record_id }, 'Linked financial record deleted')
      }
    }

    // 2. Cleanup: Reverse customer stats if order was DELIVERED
    if (orderToDelete.status === 'DELIVERED' && orderToDelete.customer_id && orderToDelete.total_amount) {
      try {
        const { CustomerStatsService } = await import('@/services/stats/CustomerStatsService')
        const statsService = new CustomerStatsService({ userId: user.id, supabase: typedSupabase })
        await statsService.reverseStatsFromOrder(orderToDelete.customer_id, orderToDelete.total_amount)
        apiLogger.info({ orderId, customerId: orderToDelete.customer_id }, 'Customer stats reversed on order deletion')
      } catch (statsError) {
        apiLogger.warn({ error: statsError, customerId: orderToDelete.customer_id }, 'Failed to reverse customer stats on deletion')
      }
    }

    // 3. Delete the order (CASCADE will handle order_items, payments, stock_reservations)
    const { error: deleteError } = await typedSupabase
      .from('orders')
      .delete()
      .eq('id', orderId)
      .eq('user_id', user.id)

    if (deleteError) {
      return handleAPIError(deleteError, 'DELETE /api/orders')
    }

    cacheInvalidation.orders()
    cacheInvalidation.all() // Invalidate financial records cache too

    apiLogger.info({ userId: user.id, orderId }, 'DELETE /api/orders - Success with cleanup')

    return createSuccessResponse({ id: orderId }, SUCCESS_MESSAGES.ORDER_DELETED)
  }
)