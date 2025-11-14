// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextRequest, NextResponse } from 'next/server'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage, isRecord, isValidUUID } from '@/lib/type-guards'
import { OrderUpdateSchema } from '@/lib/validations/domains/order'
import type { Row, Update } from '@/types/database'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'


interface RouteContext {
  params: Promise<{ id: string }>
}

type OrderUpdate = Update<'orders'>
type OrderRow = Row<'orders'>
type FinancialRecordUpdate = Update<'financial_records'>

const normalizeDateValue = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : undefined
}

// GET /api/orders/[id] - Get single order
async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context['params']
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 })
    }

    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const _user = authResult

    const supabase = await createClient()

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
      .single()

    if (error) {
      if (error['code'] === 'PGRST116') {
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
    if (isRecord(data) && 'order_items' in data && !Array.isArray(data['order_items'])) {
      apiLogger.error({ data }, 'Invalid order_items structure')
      return NextResponse.json(
        { error: 'Invalid order items structure' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
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
    const { id } = await context['params']
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 })
    }

    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const _user = authResult

    const supabase = await createClient()

    const body = await request.json() as unknown

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
      .single()

    if (checkError || !existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Type assertion to fix RLS type inference
    const typedExistingOrder = existingOrder as Pick<OrderRow, 'id' | 'status' | 'financial_record_id'>

    // Update order
    const updateData: OrderUpdate = {
      ...Object.fromEntries(
        Object.entries(validatedData).map(([key, value]) => [key, value ?? null])
      ) as Partial<OrderUpdate>,
      updated_at: new Date().toISOString()
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData as never)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      apiLogger.error({ error: updateError }, 'Error updating order:')
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    // Type assertion to fix RLS type inference issue
    const typedUpdatedOrder = updatedOrder as OrderRow

    // If status changed to DELIVERED and there's no financial record, create one
    if (
      validatedData['status'] === 'DELIVERED' && 
      typedExistingOrder['status'] !== 'DELIVERED' &&
      !typedExistingOrder.financial_record_id &&
      typedUpdatedOrder.total_amount &&
      typedUpdatedOrder.total_amount > 0
    ) {
      const incomeDate = normalizeDateValue(typedUpdatedOrder.delivery_date)
 ?? normalizeDateValue(typedUpdatedOrder.order_date)
 ?? new Date().toISOString().split('T')[0]

      const incomeData = {
        user_id: _user.id,
        type: 'INCOME' as const,
        category: 'Revenue',
        amount: typedUpdatedOrder.total_amount,
        date: incomeDate ?? null,
        reference: `Order #${typedUpdatedOrder['order_no']}${typedUpdatedOrder['customer_name'] ? ` - ${typedUpdatedOrder['customer_name']}` : ''}`,
        description: `Income from order ${typedUpdatedOrder['order_no']}`
      }

      const { data: incomeRecord, error: incomeError } = await supabase
        .from('financial_records')
        .insert(incomeData as never)
        .select('id')
        .single()

      if (!incomeError && incomeRecord) {
        // Link financial record to order
        await supabase
          .from('orders')
          .update({ financial_record_id: incomeRecord['id'] } as never)
          .eq('id', id)
      }
    }

    // If status changed from DELIVERED to something else, update financial record
    if (
      typedExistingOrder['status'] === 'DELIVERED' && 
      validatedData['status'] && 
      validatedData['status'] !== 'DELIVERED' &&
      typedExistingOrder.financial_record_id
    ) {
      // Mark financial record as cancelled or update reference
      const updateFinancialData: FinancialRecordUpdate = {
        description: `Order ${typedUpdatedOrder['order_no']} - Status changed to ${validatedData['status']}`
      }
      await supabase
        .from('financial_records')
        .update(updateFinancialData as never)
        .eq('id', typedExistingOrder.financial_record_id)
    }

    return NextResponse.json(typedUpdatedOrder)
  } catch (error) {
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
    const { id } = await context['params']
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 })
    }
    
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const _user = authResult

    const supabase = await createClient()

    // Check if order exists and get financial_record_id
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id, financial_record_id')
      .eq('id', id)
      .single()

    if (checkError || !existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Type assertion to fix RLS type inference
    const typedExistingOrderForDelete = existingOrder as Pick<OrderRow, 'id' | 'financial_record_id'>

    // Delete order items first (cascade should handle this, but being explicit)
    await supabase
      .from('order_items')
      .delete()
      .eq('order_id', id)

    // Delete order
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (deleteError) {
      apiLogger.error({ error: deleteError }, 'Error deleting order:')
      return NextResponse.json(
        { error: 'Failed to delete order' },
        { status: 500 }
      )
    }

    // Delete associated financial record if exists
    if (typedExistingOrderForDelete.financial_record_id) {
      await supabase
        .from('financial_records')
        .delete()
        .eq('id', typedExistingOrderForDelete.financial_record_id)
    }

    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch (error) {
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
export { securedDELETE as DELETE, securedGET as GET, securedPUT as PUT }

