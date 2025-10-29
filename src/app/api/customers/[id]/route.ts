import 'server-only'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createServiceRoleClient } from '@/utils/supabase/service-role'
import { CustomerUpdateSchema } from '@/lib/validations/database-validations'
import { getErrorMessage } from '@/lib/type-guards'
import { apiLogger } from '@/lib/logger'
import { prepareUpdate } from '@/lib/supabase/insert-helpers'
// GET /api/customers/[id] - Get single customer
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, email, phone, address, customer_type, discount_percentage, notes, is_active, loyalty_points, favorite_items, created_at, updated_at, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }
      apiLogger.error({ error }, 'Error fetching customer:')
      return NextResponse.json(
        { error: 'Failed to fetch customer' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in GET /api/customers/[id]:')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const supabase = createServiceRoleClient()
    const body = await request.json()

    // Validate request body with Zod
    const validation = CustomerUpdateSchema.safeParse(body)
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

    const updatePayload = prepareUpdate('customers', validatedData)

    const { data, error } = await supabase
      .from('customers')
      .update(updatePayload)
      .eq('id', id)
      .select('id, name, email, phone, address, customer_type, discount_percentage, notes, is_active, loyalty_points, updated_at')
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        )
      }
      apiLogger.error({ error }, 'Error updating customer:')
      return NextResponse.json(
        { error: 'Failed to update customer' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in PUT /api/customers/[id]:')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const supabase = createServiceRoleClient()
    
    // Check if customer has orders
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('customer_id', id)
      .limit(1)
    
    if (orders && orders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing orders' },
        { status: 409 }
      )
    }
    
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
    
    if (error) {
      apiLogger.error({ error }, 'Error deleting customer:')
      return NextResponse.json(
        { error: 'Failed to delete customer' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Customer deleted successfully' })
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in DELETE /api/customers/[id]:')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}