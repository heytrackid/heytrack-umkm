import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdmin } from '@/lib/supabase'

// GET /api/orders - Get all orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('param')
    const status = searchParams.get('param')
    
    const supabase = createServerSupabaseAdmin()
    let query = (supabase as any)
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
      .order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (limit) {
      query = query.limit(50)
    }
    
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
    const body = await request.json()
    
    // Validate required fields
    if (!body.order_no || !body.total_amount) {
      return NextResponse.json(
        { error: 'Order number and total amount are required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseAdmin()
    const orderStatus = body.status || 'PENDING'
    let incomeRecordId = null
    
    // If order is DELIVERED, create income record first
    if (orderStatus === 'DELIVERED' && body.total_amount > 0) {
      const { data: incomeRecord, error: incomeError } = await (supabase as any)
        .from('expenses')
        .insert({
          category: 'Revenue',
          subcategory: 'Order Income',
          amount: body.total_amount,
          description: `Order #${body.order_no}${body.customer_name ? ' - ' + body.customer_name : ''}`,
          expense_date: body.delivery_date || body.order_date || new Date().toISOString().split('T')[0],
          payment_method: body.payment_method || 'CASH',
          status: body.payment_status === 'PAID' ? 'paid' : 'pending',
          tags: ['order_income', 'revenue', 'sales'],
          metadata: {
            order_no: body.order_no,
            customer_name: body.customer_name,
            customer_phone: body.customer_phone,
            order_date: body.order_date,
            delivery_date: body.delivery_date
          },
          reference_type: 'order',
          reference_id: null // Will be updated after order creation
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
    const { data: orderData, error: orderError } = await (supabase as any)
      .from('orders')
      .insert({
        order_no: body.order_no,
        customer_id: body.customer_id,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        status: orderStatus,
        order_date: body.order_date || new Date().toISOString().split('T')[0],
        delivery_date: body.delivery_date,
        delivery_time: body.delivery_time,
        total_amount: body.total_amount,
        discount: body.discount || 0,
        tax_amount: body.tax_amount || 0,
        paid_amount: body.paid_amount || 0,
        payment_status: body.payment_status || 'UNPAID',
        payment_method: body.payment_method,
        priority: body.priority || 'normal',
        notes: body.notes,
        special_instructions: body.special_instructions,
        financial_record_id: incomeRecordId
      })
      .select('*')
      .single()
    
    if (orderError) {
      console.error('Error creating order:', orderError)
      // Rollback income record if order creation fails
      if (incomeRecordId) {
        await (supabase as any)
          .from('expenses')
          .delete()
          .eq('id', incomeRecordId)
      }
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }
    
    // Update income record with order reference_id
    if (incomeRecordId) {
      await (supabase as any)
        .from('expenses')
        .update({ reference_id: orderData.id })
        .eq('id', incomeRecordId)
    }

    // If order items provided, create them (handle both order_items and items field names)
    const itemsData = body.items || body.order_items
    if (itemsData && itemsData.length > 0) {
      const orderItems = itemsData.map((item: any) => ({
        order_id: orderData.id,
        recipe_id: item.recipe_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price || (item.quantity * item.unit_price),
        special_requests: item.special_requests
      }))
      
      const { error: itemsError } = await (supabase as any)
        .from('order_items')
        .insert(orderItems)
      
      if (itemsError) {
        console.error('Error creating order items:', itemsError)
        // Rollback order creation if items fail
        await (supabase as any)
          .from('orders')
          .delete()
          .eq('id', orderData.id)
        
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
