import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { apiLogger } from '@/lib/logger'
import { cacheInvalidation } from '@/lib/cache'
import type { Database } from '@/types/supabase-generated'

type OrderUpdate = Database['public']['Tables']['orders']['Update']
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']
type OrderItemPayload = Omit<OrderItemInsert, 'order_id' | 'user_id'> & { id?: string }

interface OrderUpdateRequest extends Partial<OrderUpdate> {
  order_items?: OrderItemPayload[]
}

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/orders/[id] - Get single order
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      if (error?.code === 'PGRST116' || !data) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      apiLogger.error({ error }, 'Error fetching order')
      return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in GET /api/orders/[id]')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/orders/[id] - Update order
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as OrderUpdateRequest
    
    // Extract order items from body if present
    const { order_items, id: _ignoredId, user_id: _ignoredUserId, ...orderData } = body
    
    // Update main order data
    const updatePayload: OrderUpdate = {
      ...(orderData as OrderUpdate),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, order_no, customer_name, status, total_amount, updated_at')
      .single()
    
    if (error || !data) {
      if (error?.code === 'PGRST116' || !data) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      apiLogger.error({ error }, 'Error updating order')
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    // Update order items if provided
    if (order_items && Array.isArray(order_items)) {
      // Delete existing items first
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        apiLogger.error({ error: deleteError }, 'Error clearing order items')
        return NextResponse.json({ error: 'Failed to update order items' }, { status: 500 })
      }
      
      // Insert new items
      if (order_items.length > 0) {
        const itemsToInsert: OrderItemInsert[] = order_items.map((item) => {
          const { id: _omittedId, ...rest } = item
          return {
            ...rest,
            order_id: id,
            user_id: user.id,
            updated_at: rest.updated_at ?? new Date().toISOString()
          }
        })
        
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsToInsert)
        
        if (itemsError) {
          apiLogger.error({ error: itemsError }, 'Error updating order items')
          return NextResponse.json({ error: 'Failed to update order items' }, { status: 500 })
        }
      }
    }

    cacheInvalidation.orders()
    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in PUT /api/orders/[id]')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/orders/[id] - Delete order
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure order belongs to user before deleting
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingOrder) {
      if (fetchError?.code === 'PGRST116' || !existingOrder) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      apiLogger.error({ error: fetchError }, 'Error verifying order ownership')
      return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
    }
    
    // Delete order items first (cascade should handle this, but being explicit)
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', id)
      .eq('user_id', user.id)

    if (itemsError) {
      apiLogger.error({ error: itemsError }, 'Error deleting order items')
      return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
    }
    
    // Delete main order
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      apiLogger.error({ error }, 'Error deleting order')
      return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
    }

    cacheInvalidation.orders()
    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in DELETE /api/orders/[id]')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
