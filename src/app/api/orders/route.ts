// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextRequest, NextResponse } from 'next/server'


import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { cacheInvalidation, cacheKeys, withCache } from '@/lib/cache'
import { ORDER_FIELDS } from '@/lib/database/query-fields'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger, logError } from '@/lib/logger'
import { PaginationQuerySchema } from '@/lib/validations/domains/common'
import { OrderInsertSchema } from '@/lib/validations/domains/order'
import { createPaginationMeta } from '@/lib/validations/pagination'
import type { Database, FinancialRecordInsert, FinancialRecordUpdate, OrderInsert, OrderStatus } from '@/types/database'
import { typed } from '@/types/type-utilities'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'

import type { SupabaseClient } from '@supabase/supabase-js'





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

const normalizeDateValue = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : undefined
}

// ✅ PERFORMANCE: Optimized function with caching
 
const fetchOrdersWithCache = async (supabase: SupabaseClient<Database>, params: FetchOrdersParams) => {
  const { page, limit, search, sort_by, sort_order, status, user_id } = params

  // Create cache key based on query parameters
  const cacheKey = `${cacheKeys.orders.list}:${user_id}:${page}:${limit}:${search ?? ''}:${sort_by ?? ''}:${sort_order ?? ''}:${status ?? ''}:${params.from ?? ''}:${params.to ?? ''}`

  return withCache(async () => {
    // Batch query for count and data in single operation
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

    // Optional date range filter (created_at)
    const fromDate = normalizeDateValue(params.from)
    const toDate = normalizeDateValue(params.to)
    if (fromDate) {
      query = query.gte('created_at', fromDate)
    }
    if (toDate) {
      query = query.lte('created_at', toDate)
    }

    const { data, error, count } = await query
      .order(sort_by ?? 'created_at', { ascending: sort_order === 'asc' })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      throw error
    }

    // Map data to match interface
    const mappedData = data?.map((order: unknown) => {
      const orderData = order as Record<string, unknown>
      return {
        ...orderData,
        items: orderData['order_items'] ?? []
      }
    }) ?? []

    return { data: mappedData, count }
  }, cacheKey, 5 * 60 * 1000) // Cache for 5 minutes
}
 

// GET /api/orders - Get all orders with caching
async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    apiLogger.info({ url: request.url }, 'GET /api/orders - Request received')

    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    apiLogger.info({ userId: user.id }, 'GET /api/orders - User authenticated')

    const supabase = typed(await createClient())

    const { searchParams } = new URL(request.url)
    
    // If no limit is specified, return all data (no pagination)
    const hasLimit = searchParams.has('limit')
    
    const queryValidation = PaginationQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: hasLimit ? searchParams.get('limit') : '999999', // Very high limit = all data
      search: searchParams.get('search'),
      sort_by: searchParams.get('sort_by'),
      sort_order: searchParams.get('sort_order'),
    })

    const from = searchParams.get('from') ?? undefined
    const to = searchParams.get('to') ?? undefined

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.issues },
        { status: 400 }
      )
    }

    const { page, limit, search, sort_by, sort_order } = queryValidation['data']
    const status = searchParams.get('status')

    // ✅ PERFORMANCE: Use cached batch query
    const params: FetchOrdersParams = {
      page, limit, status, user_id: user.id
    }
    if (search !== undefined) {
      params.search = search
    }
    if (sort_by !== undefined) {
      params.sort_by = sort_by
    }
    if (sort_order !== undefined) {
      params.sort_order = sort_order
    }

    // Attach date range filters if provided
    if (from) params.from = from
    if (to) params.to = to

    const { data: orders, count } = await fetchOrdersWithCache(supabase, params)

    apiLogger.info({
      userId: user.id,
      count: orders?.length ?? 0,
      totalCount: count ?? 0,
      cached: true // Indicates caching is working
    }, 'GET /api/orders - Success (cached)')

    return NextResponse.json({
      data: orders,
      meta: createPaginationMeta(page, limit, count ?? 0)
    })
  } catch (error) {
    logError(apiLogger, error, 'GET /api/orders - Unexpected error')
    return handleAPIError(error, 'GET /api/orders')
  }
}

// POST /api/orders - Create new order with cache invalidation
async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    apiLogger.info({ url: request.url }, 'POST /api/orders - Request received')

    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = typed(await createClient())
    const body: unknown = await request.json()
    const validation = OrderInsertSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const validatedData = validation['data']
    const orderStatus = validatedData['status'] || 'PENDING'
    let incomeRecordId: string | null = null

    // Create income record if needed
    if (orderStatus === 'DELIVERED' && validatedData.total_amount && validatedData.total_amount > 0) {
      const incomeDate = normalizeDateValue(validatedData.delivery_date)
        ?? normalizeDateValue(validatedData.order_date)
        ?? new Date().toISOString().split('T')[0]

      const incomeData: FinancialRecordInsert = {
        user_id: user.id,
        type: 'INCOME',
        category: 'Revenue',
        amount: validatedData.total_amount,
        date: incomeDate ?? null,
        reference: `Order #${validatedData['order_no']}${validatedData['customer_name'] ? ` - ${validatedData['customer_name']}` : ''}`,
        description: `Income from order ${validatedData['order_no']}`
      }
    
      const { data: incomeRecord, error: incomeError } = await supabase
        .from('financial_records')
        .insert(incomeData)
        .select('id')
        .single()

      if (incomeError) {
        logError(apiLogger, incomeError, 'POST /api/orders - Failed to create income record')
        return NextResponse.json({ error: 'Failed to create income record' }, { status: 500 })
      }

      incomeRecordId = incomeRecord['id']
    }

    // Create order
    const orderInsertData: OrderInsert = {
      ...Object.fromEntries(
        Object.entries(validatedData).map(([key, value]) => [key, value ?? null])
      ),
      user_id: user.id,
      status: orderStatus,
      order_date: validatedData.order_date ?? new Date().toISOString().split('T')[0],
      tax_amount: validatedData.tax_amount ?? 0,
      payment_status: validatedData.payment_status ?? 'UNPAID',
      financial_record_id: incomeRecordId
    } as OrderInsert
    
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsertData)
      .select('id, order_no, customer_name, status, total_amount, created_at')
      .single()

    if (orderError) {
      logError(apiLogger, orderError, 'POST /api/orders - Failed to create order')
      if (incomeRecordId) {
        await supabase.from('financial_records').delete().eq('id', incomeRecordId).eq('user_id', user.id)
      }
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    const createdOrder = orderData

    // Update income record with order reference
    if (incomeRecordId) {
      const updateData: FinancialRecordUpdate = { 
        reference: `Order ${createdOrder['id']} - ${validatedData['customer_name'] || 'Customer'}` 
      }
      await supabase.from('financial_records').update(updateData).eq('id', incomeRecordId).eq('user_id', user.id)
    }

    // Create order items
    if (validatedData.items && validatedData.items.length > 0) {
      const orderItems = validatedData.items.map((item) => ({
        recipe_id: item.recipe_id,
        product_name: item.product_name ?? null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price || (item.quantity * item.unit_price),
        special_requests: item.special_requests ?? null,
        order_id: createdOrder['id'],
        user_id: user.id
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

      if (itemsError) {
        logError(apiLogger, itemsError, 'POST /api/orders - Failed to create order items')
        // Rollback order and income record
        await supabase.from('orders').delete().eq('id', createdOrder['id']).eq('user_id', user.id)
        if (incomeRecordId) {
          await supabase.from('financial_records').delete().eq('id', incomeRecordId).eq('user_id', user.id)
        }
        return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 })
      }
    }

    // ✅ PERFORMANCE: Invalidate cache after successful creation
    cacheInvalidation.orders()
    
    apiLogger.info({ 
      userId: user.id,
      orderId: createdOrder['id'],
      orderNo: createdOrder['order_no'],
      incomeRecorded: Boolean(incomeRecordId)
    }, 'POST /api/orders - Success (cache invalidated)')
    
    return NextResponse.json({
      ...createdOrder,
      income_recorded: Boolean(incomeRecordId)
    }, { status: 201 })
  } catch (error) {
    logError(apiLogger, error, 'POST /api/orders - Unexpected error')
    return handleAPIError(error, 'POST /api/orders')
  }
}

// Apply security middleware with enhanced security configuration
const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPOST = withSecurity(POST, SecurityPresets.enhanced())

// Export secured handlers
export { securedGET as GET, securedPOST as POST }
