import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdmin } from '@/lib/supabase'

import { apiLogger } from '@/lib/logger'
// GET /api/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createServerSupabaseAdmin()
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          quantity,
          unit_price,
          total_price,
          special_requests,
          status,
          recipe_id
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      apiLogger.error({ error: error }, 'Error fetching order:')
      return NextResponse.json(
        { error: 'Failed to fetch order' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error: error }, 'Error in GET /api/orders/[id]:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id] - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createServerSupabaseAdmin()
    const body = await request.json()
    
    // Extract order items from body if present
    const { order_items, ...orderData } = body
    
    // Update main order data
    const { data, error } = await supabase
      .from('orders')
      .update({
        ...orderData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      apiLogger.error({ error: error }, 'Error updating order:')
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    // Update order items if provided
    if (order_items && Array.isArray(order_items)) {
      // Delete existing items first
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id)
      
      // Insert new items
      if (order_items.length > 0) {
        const itemsToInsert = order_items.map(item => ({
          ...item,
          order_id: id
        }))
        
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(data)
        
        if (itemsError) {
          apiLogger.error({ error: itemsError }, 'Error updating order items:')
          return NextResponse.json(
            { error: 'Failed to update order items' },
            { status: 500 }
          )
        }
      }
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error: error }, 'Error in PUT /api/orders/[id]:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[id] - Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createServerSupabaseAdmin()
    
    // Delete order items first (cascade should handle this, but being explicit)
    await supabase
      .from('order_items')
      .delete()
      .eq('order_id', id)
    
    // Delete main order
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
    
    if (error) {
      apiLogger.error({ error: error }, 'Error deleting order:')
      return NextResponse.json(
        { error: 'Failed to delete order' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch (error: unknown) {
    apiLogger.error({ error: error }, 'Error in DELETE /api/orders/[id]:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}