import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { OrderInsertSchema } from '@/lib/validations/domains/order'
import { PaginationQuerySchema } from '@/lib/validations/domains/common'
import type { Database } from '@/types/supabase-generated'
import { ORDER_FIELDS } from '@/lib/database/query-fields'
import { apiLogger } from '@/lib/logger'

type OrdersTable = Database['public']['Tables']['orders']
// GET /api/orders - Get all orders
export async function GET(request: NextRequest) {
  try {
    // Create authenticated Supabase client
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error:')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.issues },
        { status: 400 }
      )
    }

    const { page, limit, search, sort_by, sort_order } = queryValidation.data
    const status = searchParams.get('status') // Status filter is separate from pagination

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
      query = query.eq('status', status)
    }

    // Add sorting
    const sortField = sort_by || 'created_at'
    const sortDirection = sort_order === 'asc'
    query = query.order(sortField, { ascending: sortDirection })

    // Add pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      apiLogger.error({ error }, 'Error fetching orders:')
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    // Map data to match our interface (order_items -> items)
    const mappedData = data?.map((order: OrdersTable['Row'] & { order_items?: unknown[] }) => ({
      ...order,
      items: (order as any).order_items || []
    }))

    return NextResponse.json(mappedData)
  } catch (err: unknown) {
    apiLogger.error({ err }, 'Error in GET /api/orders:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create new order with income tracking
export async function POST(request: NextRequest) {
  try {
    // Create authenticated Supabase client
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error:')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate request body
    const validation = OrderInsertSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    const validatedData = validation.data
    const orderStatus = validatedData.status || 'PENDING'
    let incomeRecordId = null

    // If order is DELIVERED, create income record first
    if (orderStatus === 'DELIVERED' && validatedData.total_amount && validatedData.total_amount > 0) {
    const { data: incomeRecord, error: incomeError } = await supabase
        .from('financial_records')
        .insert({
          user_id: user.id,
          type: 'INCOME',
          category: 'Revenue',
          amount: validatedData.total_amount,
          date: validatedData.delivery_date || validatedData.order_date || new Date().toISOString().split('T')[0],
          reference: `Order #${validatedData.order_no}${validatedData.customer_name ? ` - ${  validatedData.customer_name}` : ''}`,
          description: `Income from order ${validatedData.order_no}`
        } as any)
        .select()
        .single()

      if (incomeError) {
        apiLogger.error({ error: incomeError }, 'Error creating income record:')
        return NextResponse.json(
          { error: 'Failed to create income record' },
          { status: 500 }
        )
      }

      incomeRecordId = (incomeRecord as any).id
    }

    // Create order with financial_record_id if income was created
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_no: validatedData.order_no,
        customer_id: validatedData.customer_id,
        customer_name: validatedData.customer_name,
        customer_phone: validatedData.customer_phone,
        status: orderStatus,
        order_date: validatedData.order_date || new Date().toISOString().split('T')[0],
        delivery_date: validatedData.delivery_date,
        delivery_time: validatedData.delivery_time,
        total_amount: validatedData.total_amount,
        tax_amount: validatedData.tax_amount || 0,
        payment_status: validatedData.payment_status || 'UNPAID',
        payment_method: validatedData.payment_method,
        notes: validatedData.notes,
        special_instructions: validatedData.special_instructions,
        financial_record_id: incomeRecordId
      } as any)
      .select('id, order_no, customer_name, status, total_amount, created_at')
      .single()

    if (orderError) {
      apiLogger.error({ error: orderError }, 'Error creating order:')
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

    const createdOrder = orderData as any

    // Update income record with order reference
    if (incomeRecordId) {
      await supabase
        .from('financial_records')
        .update({ reference: `Order ${createdOrder.id} - ${validatedData.customer_name || 'Customer'}` } as any)
        .eq('id', incomeRecordId)
        .eq('user_id', user.id)
    }

    // If order items provided, create them
    if (validatedData.items && validatedData.items.length > 0) {
      const orderItems = validatedData.items.map((item) => ({
        order_id: createdOrder.id,
        recipe_id: (item as any).recipe_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price || (item.quantity * item.unit_price),
        special_requests: item.special_requests
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems as any)

      if (itemsError) {
        apiLogger.error({ error: itemsError }, 'Error creating order items:')
        // Rollback order creation if items fail
        await supabase
          .from('orders')
          .delete()
          .eq('id', createdOrder.id)
          .eq('user_id', user.id)

        return NextResponse.json(
          { error: 'Failed to create order items' },
          { status: 500 }
        )
      }
    }

    // Return order data with income tracking info
    return NextResponse.json({
      ...createdOrder,
      income_recorded: !!incomeRecordId
    }, { status: 201 })
  } catch (err: unknown) {
    apiLogger.error({ err }, 'Error in POST /api/orders:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
