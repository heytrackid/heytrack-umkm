import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { OrderInsertSchema } from '@/lib/validations/domains/order'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'
import { PaginationQuerySchema } from '@/lib/validations/domains/common'
import { createPaginationMeta } from '@/lib/validations/pagination'
import type { OrderStatus, FinancialRecordsInsert, FinancialRecordsUpdate, OrdersInsert, OrdersTable } from '@/types/database'
import { ORDER_FIELDS } from '@/lib/database/query-fields'
import { apiLogger, logError } from '@/lib/logger'
import { withSecurity, SecurityPresets } from '@/utils/security'
import { handleAPIError } from '@/lib/errors/api-error-handler'
type FinancialRecordInsert = FinancialRecordsInsert
type FinancialRecordUpdate = FinancialRecordsUpdate
type OrderInsert = OrdersInsert

const normalizeDateValue = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : undefined
}

// GET /api/orders - Get all orders
async function GET(request: NextRequest) {
  try {
    apiLogger.info({ url: request.url }, 'GET /api/orders - Request received')
    
    // Create authenticated Supabase client
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logError(apiLogger, authError, 'GET /api/orders - Unauthorized', {
        userId: user?.id,
        url: request.url,
      })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    apiLogger.info({ userId: user.id }, 'GET /api/orders - User authenticated')

    const { searchParams } = new URL(request.url)

    // Validate query parameters
    const queryValidation = PaginationQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      sort_by: searchParams.get('sort_by'),
      sort_order: searchParams.get('sort_order'),
    })

    if (!queryValidation.success) {
      logError(apiLogger, new Error('Invalid query parameters'), 'GET /api/orders - Validation failed', {
        userId: user.id,
        url: request.url
      })
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.issues },
        { status: 400 }
      )
    }

    const { page, limit, search, sort_by, sort_order } = queryValidation.data
    const status = searchParams.get('status') // Status filter is separate from pagination

    // Get total count
    let countQuery = supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (search) {
      countQuery = countQuery.or(`order_no.ilike.%${search}%,customer_name.ilike.%${search}%`)
    }

    if (status) {
      countQuery = countQuery.eq('status', status as OrderStatus)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      logError(apiLogger, countError, 'GET /api/orders - Failed to count orders', {
        userId: user.id,
        url: request.url
      })
      return NextResponse.json(
        { error: 'Failed to count orders' },
        { status: 500 }
      )
    }

    // ✅ OPTIMIZED: Use specific fields instead of SELECT *
    let query = supabase
      .from('orders')
      .select(ORDER_FIELDS.DETAIL) // Specific fields for better performance
      .eq('user_id', user.id)

    // Add search filter
    if (search) {
      query = query.or(`order_no.ilike.%${search}%,customer_name.ilike.%${search}%`)
    }

    // Add status filter
    if (status) {
      // Type assertion for status - validated by database enum
      query = query.eq('status', status as OrderStatus)
    }

    // Add sorting
    const sortField = sort_by ?? 'created_at'
    const sortDirection = sort_order === 'asc'
    query = query.order(sortField, { ascending: sortDirection })

    // Add pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      logError(apiLogger, error, 'GET /api/orders - Failed to fetch orders', {
        userId: user.id,
        url: request.url
      })
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    // Map data to match our interface (order_items -> items)
    // The query returns order_items with nested recipe data
    interface OrderItemWithRecipe {
      id: string
      quantity: number
      unit_price: number
      total_price: number
      product_name: string | null
      special_requests: string | null
      recipe_id: string
      recipe: {
        id: string
        name: string
        image_url: string | null
      }
    }
    
    type OrderWithItems = OrdersTable & { 
      order_items?: OrderItemWithRecipe[]
    }
    
    const mappedData = data?.map((order) => ({
      ...order,
      items: (order as OrderWithItems).order_items ?? []
    }))

    apiLogger.info({ 
      userId: user.id,
      count: mappedData?.length || 0,
      totalCount: count ?? 0,
      page,
      limit
    }, 'GET /api/orders - Success')

    return NextResponse.json({
      data: mappedData,
      meta: createPaginationMeta(page, limit, count ?? 0)
    })
  } catch (error: unknown) {
    logError(apiLogger, error, 'GET /api/orders - Unexpected error', {
      url: request.url,
    })
    return handleAPIError(error, 'GET /api/orders');
  }
}

// POST /api/orders - Create new order with income tracking
async function POST(request: NextRequest) {
  try {
    apiLogger.info({ url: request.url }, 'POST /api/orders - Request received')
    
    // Create authenticated Supabase client
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logError(apiLogger, authError, 'POST /api/orders - Unauthorized', {
        userId: user?.id,
        url: request.url,
      })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    apiLogger.info({ userId: user.id }, 'POST /api/orders - User authenticated')

    // The request body is already sanitized by the security middleware
    const body = await request.json()

    // Validate request body
    const validation = OrderInsertSchema.safeParse(body)
    if (!validation.success) {
      logError(apiLogger, new Error('Invalid request data'), 'POST /api/orders - Validation failed', {
        userId: user.id,
        url: request.url
      })
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    apiLogger.info({ 
      userId: user.id,
      orderNo: validation.data.order_no,
      itemsCount: validation.data.items?.length ?? 0
    }, 'POST /api/orders - Validation passed')

    const validatedData = validation.data
    const orderStatus = validatedData.status || 'PENDING'
    let incomeRecordId = null

    // If order is DELIVERED, create income record first
    if (orderStatus === 'DELIVERED' && validatedData.total_amount && validatedData.total_amount > 0) {
      const incomeDate = normalizeDateValue(validatedData.delivery_date)
 ?? normalizeDateValue(validatedData.order_date)
 ?? new Date().toISOString().split('T')[0]

      const incomeData: FinancialRecordInsert = {
        user_id: user.id,
        type: 'INCOME',
        category: 'Revenue',
        amount: validatedData.total_amount,
        date: incomeDate,
        reference: `Order #${validatedData.order_no}${validatedData.customer_name ? ` - ${  validatedData.customer_name}` : ''}`,
        description: `Income from order ${validatedData.order_no}`
      }
    
    const { data: incomeRecord, error: incomeError } = await supabase
        .from('financial_records')
        .insert(incomeData)
        .select('id')
        .single()

      if (incomeError) {
        logError(apiLogger, incomeError, 'POST /api/orders - Failed to create income record', {
          userId: user.id,
          url: request.url
        })
        return NextResponse.json(
          { error: 'Failed to create income record' },
          { status: 500 }
        )
      }

      incomeRecordId = incomeRecord.id
    }

    // Create order with financial_record_id if income was created
    const orderInsertData: OrderInsert = {
        user_id: user.id,
        order_no: validatedData.order_no,
        customer_id: validatedData.customer_id,
        customer_name: validatedData.customer_name,
        customer_phone: validatedData.customer_phone,
        status: orderStatus,
        order_date: validatedData.order_date ?? new Date().toISOString().split('T')[0],
        delivery_date: validatedData.delivery_date,
        delivery_time: validatedData.delivery_time,
        total_amount: validatedData.total_amount,
        tax_amount: validatedData.tax_amount || 0,
        payment_status: validatedData.payment_status || 'UNPAID',
        payment_method: validatedData.payment_method,
        notes: validatedData.notes,
        special_instructions: validatedData.special_instructions,
        financial_record_id: incomeRecordId
      }
    
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsertData)
      .select('id, order_no, customer_name, status, total_amount, created_at')
      .single()

    if (orderError) {
      logError(apiLogger, orderError, 'POST /api/orders - Failed to create order', {
        userId: user.id,
        url: request.url
      })
      // Rollback income record if order creation fails
      if (incomeRecordId) {
        await supabase
          .from('financial_records')
          .delete()
          .eq('id', incomeRecordId)
          .eq('user_id', user.id)
      }
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    const createdOrder = orderData

    // Update income record with order reference
    if (incomeRecordId) {
      const updateData: FinancialRecordUpdate = { 
          reference: `Order ${createdOrder.id} - ${validatedData.customer_name || 'Customer'}` 
        }
      await supabase
        .from('financial_records')
        .update(updateData)
        .eq('id', incomeRecordId)
        .eq('user_id', user.id)
    }

    // If order items provided, create them
    if (validatedData.items && validatedData.items.length > 0) {
      const orderItems = validatedData.items.map((item) => ({
        recipe_id: item.recipe_id,
        product_name: item.product_name ?? null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price || (item.quantity * item.unit_price),
        special_requests: item.special_requests ?? null,
        order_id: createdOrder.id,
        user_id: user.id
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        logError(apiLogger, itemsError, 'POST /api/orders - Failed to create order items', {
          userId: user.id,
          url: request.url
        })
        
        // Complete rollback: delete order AND financial record
        await supabase
          .from('orders')
          .delete()
          .eq('id', createdOrder.id)
          .eq('user_id', user.id)
        
        // Also rollback financial record if it was created
        if (incomeRecordId) {
          await supabase
            .from('financial_records')
            .delete()
            .eq('id', incomeRecordId)
            .eq('user_id', user.id)
        }

        return NextResponse.json(
          { error: 'Failed to create order items' },
          { status: 500 }
        )
      }
    }

    // Return order data with income tracking info
    apiLogger.info({ 
      userId: user.id,
      orderId: createdOrder.id,
      orderNo: createdOrder.order_no,
      incomeRecorded: !!incomeRecordId
    }, 'POST /api/orders - Success')
    
    return NextResponse.json({
      ...createdOrder,
      income_recorded: !!incomeRecordId
    }, { status: 201 })
  } catch (error: unknown) {
    logError(apiLogger, error, 'POST /api/orders - Unexpected error', {
      url: request.url,
    })
    return handleAPIError(error, 'POST /api/orders');
  }
}

// Apply security middleware with enhanced security configuration
const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPOST = withSecurity(POST, SecurityPresets.enhanced())

// Export secured handlers
export { securedGET as GET, securedPOST as POST }
