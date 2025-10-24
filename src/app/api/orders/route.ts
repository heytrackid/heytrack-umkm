import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { OrderInsertSchema, PaginationQuerySchema } from '@/lib/validations'

// GET /api/orders - Get all orders
export async function GET(request: NextRequest) {
  try {
    // Create authenticated Supabase client
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
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

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          recipe_id,
          product_name,
          quantity,
          unit_price,
          total_price,
          special_requests
        )
      `)
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
      console.error('Error fetching orders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    // Map data to match our interface (order_items -> items)
    const mappedData = data?.map((order: any) => ({
      ...order,
      items: order.order_items || []
    }))

    return NextResponse.json(mappedData)
  } catch (error: any) {
    console.error('Error in GET /api/orders:', error)
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
      console.error('Auth error:', authError)
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
        .from('financial_transactions')
        .insert({
          user_id: user.id,
          jenis: 'pemasukan',
          kategori: 'Revenue',
          nominal: validatedData.total_amount,
          tanggal: validatedData.delivery_date || validatedData.order_date || new Date().toISOString().split('T')[0],
          referensi: `Order #${validatedData.order_no}${validatedData.customer_name ? ' - ' + validatedData.customer_name : ''}`
        })
        .select()
        .single()

      if (incomeError) {
        console.error('Error creating income record:', incomeError)
        return NextResponse.json(
          { error: 'Failed to create income record' },
          { status: 500 }
        )
      }

      incomeRecordId = incomeRecord.id
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
        discount: validatedData.discount || 0,
        tax_amount: validatedData.tax_amount || 0,
        paid_amount: validatedData.paid_amount || 0,
        payment_status: validatedData.payment_status || 'UNPAID',
        payment_method: validatedData.payment_method,
        priority: validatedData.priority || 'normal',
        notes: validatedData.notes,
        special_instructions: validatedData.special_instructions,
        financial_record_id: incomeRecordId
      })
      .select('*')
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      // Rollback income record if order creation fails
      if (incomeRecordId) {
        await supabase
          .from('financial_transactions')
          .delete()
          .eq('id', incomeRecordId)
          .eq('user_id', user.id)
      }
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Update income record with order reference
    if (incomeRecordId) {
      await supabase
        .from('financial_transactions')
        .update({ referensi: `Order ${orderData.id} - ${validatedData.customer_name || 'Customer'}` })
        .eq('id', incomeRecordId)
        .eq('user_id', user.id)
    }

    // If order items provided, create them
    if (validatedData.items && validatedData.items.length > 0) {
      const orderItems = validatedData.items.map((item) => ({
        order_id: orderData.id,
        recipe_id: item.recipe_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price || (item.quantity * item.unit_price),
        special_requests: item.special_requests
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Error creating order items:', itemsError)
        // Rollback order creation if items fail
        await supabase
          .from('orders')
          .delete()
          .eq('id', orderData.id)
          .eq('user_id', user.id)

        return NextResponse.json(
          { error: 'Failed to create order items' },
          { status: 500 }
        )
      }
    }

    // Return order data with income tracking info
    return NextResponse.json({
      ...orderData,
      income_recorded: !!incomeRecordId
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
