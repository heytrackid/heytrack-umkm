export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { cacheInvalidation, cacheKeys, withCache } from '@/lib/cache'
import { ORDER_FIELDS } from '@/lib/database/query-fields'
import { apiLogger } from '@/lib/logger'
import { createPaginationMeta } from '@/lib/validations/pagination'
import type { Database, FinancialRecordInsert, FinancialRecordUpdate, OrderInsert, OrderStatus } from '@/types/database'
import { NextResponse } from 'next/server'
import { OrderInsertSchema } from '@/lib/validations/domains/order'
import type { SupabaseClient } from '@supabase/supabase-js'

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
  const cacheKey = `${cacheKeys.orders.list}:${user_id}:${page}:${limit}:${search ?? ''}:${sort_by ?? ''}:${sort_order ?? ''}:${status ?? ''}:${params.from ?? ''}:${params.to ?? ''}`

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

// GET /api/orders - List orders with caching
async function getOrdersHandler(
  context: RouteContext,
  query?: z.infer<typeof OrderListQuerySchema>
): Promise<NextResponse> {
  const { user, supabase } = context
  const { page = 1, limit = 999999, search, sort_by, sort_order, status, from, to } = query || {}

  const params: FetchOrdersParams = { page, limit, status: status || null, user_id: user.id }
  if (search) params.search = search
  if (sort_by) params.sort_by = sort_by
  if (sort_order) params.sort_order = sort_order
  if (from) params.from = from
  if (to) params.to = to

  const { data: orders, count } = await fetchOrdersWithCache(supabase as SupabaseClient<Database>, params)

  apiLogger.info({ userId: user.id, count: orders?.length, totalCount: count, cached: true }, 'GET /api/orders - Success')

  return NextResponse.json({
    data: orders,
    meta: createPaginationMeta(page, limit, count ?? 0)
  })
}

export const GET = createApiRoute(
  { method: 'GET', path: '/api/orders', querySchema: OrderListQuerySchema },
  getOrdersHandler
)

// POST /api/orders - Create order with financial record
async function createOrderHandler(
  context: RouteContext,
  _query?: never,
  body?: z.infer<typeof OrderInsertSchema>
): Promise<NextResponse> {
  const { user, supabase } = context

  if (!body) {
    return NextResponse.json({ error: 'Request body is required' }, { status: 400 })
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

    const { data: incomeRecord, error: incomeError } = await supabase
      .from('financial_records' as never)
      .insert(incomeData as never)
      .select('id')
      .single()

    if (incomeError) {
      apiLogger.error({ error: incomeError }, 'Failed to create income record')
      return NextResponse.json({ error: 'Failed to create income record' }, { status: 500 })
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

  const { data: orderData, error: orderError } = await supabase
    .from('orders' as never)
    .insert(orderInsertData as never)
    .select('id, order_no, customer_name, status, total_amount, created_at')
    .single()

  if (orderError) {
    apiLogger.error({ error: orderError }, 'Failed to create order')
    if (incomeRecordId) {
      await supabase.from('financial_records' as never).delete().eq('id', incomeRecordId).eq('user_id', user.id)
    }
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  const createdOrder = orderData as { id: string; order_no: string; customer_name: string | null }

  // Update income record reference
  if (incomeRecordId) {
    const updateData: FinancialRecordUpdate = { reference: `Order ${createdOrder.id} - ${body.customer_name || 'Customer'}` }
    await supabase.from('financial_records' as never).update(updateData as never).eq('id', incomeRecordId).eq('user_id', user.id)
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

    const { error: itemsError } = await supabase.from('order_items' as never).insert(orderItems as never)

    if (itemsError) {
      apiLogger.error({ error: itemsError }, 'Failed to create order items')
      await supabase.from('orders' as never).delete().eq('id', createdOrder.id).eq('user_id', user.id)
      if (incomeRecordId) {
        await supabase.from('financial_records' as never).delete().eq('id', incomeRecordId).eq('user_id', user.id)
      }
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 })
    }
  }

  cacheInvalidation.orders()
  apiLogger.info({ userId: user.id, orderId: createdOrder.id, incomeRecorded: Boolean(incomeRecordId) }, 'POST /api/orders - Success')

  return NextResponse.json({ ...createdOrder, income_recorded: Boolean(incomeRecordId) }, { status: 201 })
}

export const POST = createApiRoute(
  { method: 'POST', path: '/api/orders', bodySchema: OrderInsertSchema },
  createOrderHandler
)
