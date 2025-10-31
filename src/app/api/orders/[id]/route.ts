import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { OrderUpdateSchema } from '@/lib/validations/domains/order'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'
import type { OrdersUpdate, FinancialRecordsUpdate } from '@/types/database'
import { apiLogger } from '@/lib/logger'
import { withSecurity, SecurityPresets } from '@/utils/security'
import { getErrorMessage, isValidUUID, isRecord } from '@/lib/type-guards'

interface RouteContext {
  params: Promise<{ id: string }>
}

type OrderUpdate = OrdersUpdate
type FinancialRecordUpdate = FinancialRecordsUpdate

// GET /api/orders/[id] - Get single order
async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 })
    }
    
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch order with items
    const { data, error } = await supabase
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
          special_requests,
          recipe:recipes (
            id,
            name,
            image_url
          )
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      apiLogger.error({ error }, 'Error fetching order:')
      return NextResponse.json(
        { error: 'Failed to fetch order' },
        { status: 500 }
      )
    }

    // ✅ V2: Validate order structure
    if (!isRecord(data)) {
      apiLogger.error({ data }, 'Invalid order data structure')
      return NextResponse.json(
        { error: 'Invalid data structure' },
        { status: 500 }
      )
    }

    // ✅ V2: Validate order items array
    if ('order_items' in data && !Array.isArray(data.order_items)) {
      apiLogger.error({ data }, 'Invalid order_items structure')
      return NextResponse.json(
        { error: 'Invalid order items structure' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in GET /api/orders/[id]:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id] - Update order
async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 })
    }
    
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate request body
    const validation = OrderUpdateSchema.safeParse(body)
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

    // Check if order exists and belongs to user
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id, status, financial_record_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order
    const updateData: OrderUpdate = {
      ...validatedData,
      updated_at: new Date().toISOString()
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      apiLogger.error({ error: updateError }, 'Error updating order:')
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    // If status changed to DELIVERED and there's no financial record, create one
    if (
      validatedData.status === 'DELIVERED' && 
      existingOrder.status !== 'DELIVERED' &&
      !existingOrder.financial_record_id &&
      updatedOrder.total_amount && 
      updatedOrder.total_amount > 0
    ) {
      const incomeData = {
        user_id: user.id,
        type: 'INCOME' as const,
        category: 'Revenue',
        amount: updatedOrder.total_amount,
        date: updatedOrder.delivery_date || updatedOrder.order_date || new Date().toISOString().split('T')[0],
        reference: `Order #${updatedOrder.order_no}${updatedOrder.customer_name ? ` - ${updatedOrder.customer_name}` : ''}`,
        description: `Income from order ${updatedOrder.order_no}`
      }

      const { data: incomeRecord, error: incomeError } = await supabase
        .from('financial_records')
        .insert(incomeData)
        .select('id')
        .single()

      if (!incomeError && incomeRecord) {
        // Link financial record to order
        await supabase
          .from('orders')
          .update({ financial_record_id: incomeRecord.id } as OrderUpdate)
          .eq('id', id)
          .eq('user_id', user.id)
      }
    }

    // If status changed from DELIVERED to something else, update financial record
    if (
      existingOrder.status === 'DELIVERED' && 
      validatedData.status && 
      validatedData.status !== 'DELIVERED' &&
      existingOrder.financial_record_id
    ) {
      // Mark financial record as cancelled or update reference
      const updateFinancialData: FinancialRecordUpdate = {
        description: `Order ${updatedOrder.order_no} - Status changed to ${validatedData.status}`
      }
      await supabase
        .from('financial_records')
        .update(updateFinancialData)
        .eq('id', existingOrder.financial_record_id)
        .eq('user_id', user.id)
    }

    return NextResponse.json(updatedOrder)
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in PUT /api/orders/[id]:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[id] - Delete order
async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 })
    }
    
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if order exists and get financial_record_id
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id, financial_record_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Delete order items first (cascade should handle this, but being explicit)
    await supabase
      .from('order_items')
      .delete()
      .eq('order_id', id)
      .eq('user_id', user.id)

    // Delete order
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      apiLogger.error({ error: deleteError }, 'Error deleting order:')
      return NextResponse.json(
        { error: 'Failed to delete order' },
        { status: 500 }
      )
    }

    // Delete associated financial record if exists
    if (existingOrder.financial_record_id) {
      await supabase
        .from('financial_records')
        .delete()
        .eq('id', existingOrder.financial_record_id)
        .eq('user_id', user.id)
    }

    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in DELETE /api/orders/[id]:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Apply security middleware
const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPUT = withSecurity(PUT, SecurityPresets.enhanced())
const securedDELETE = withSecurity(DELETE, SecurityPresets.enhanced())

// Export secured handlers
export { securedGET as GET, securedPUT as PUT, securedDELETE as DELETE }
