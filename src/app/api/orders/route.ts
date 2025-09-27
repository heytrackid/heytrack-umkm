import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdmin } from '@/lib/supabase'

// GET /api/orders - Get all orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const status = searchParams.get('status')
    
    const supabase = createServerSupabaseAdmin()
    let query = (supabase as any)
      .from('orders')
      .select(`
        *,
        order_items (
          id,
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
      query = query.limit(parseInt(limit))
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create new order
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
    
    // Start transaction - create order first
    const { data: orderData, error: orderError } = await (supabase as any)
      .from('orders')
      .insert({
        order_no: body.order_no,
        customer_id: body.customer_id,
        customer_name: body.customer_name,
        status: body.status || 'PENDING',
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
        special_instructions: body.special_instructions
      })
      .select()
      .single()
    
    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // If order items provided, create them
    if (body.order_items && body.order_items.length > 0) {
      const orderItems = body.order_items.map((item: any) => ({
        ...item,
        order_id: orderData.id
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

    return NextResponse.json(orderData, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}