// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

// API Route: /api/customers/[id]
// Handles GET, PUT, DELETE operations for individual customer

import { type NextRequest, NextResponse } from 'next/server'

import { apiLogger } from '@/lib/logger'
import { getErrorMessage, isValidUUID } from '@/lib/type-guards'
import { CustomerUpdateSchema, type CustomerUpdateInput } from '@/lib/validations/domains/customer'
import { withSecurity, SecurityPresets } from '@/utils/security'
import { createClient } from '@/utils/supabase/server'

import type { Update } from '@/types/database'


interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/customers/[id] - Get single customer
async function getHandler(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context['params']
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid customer ID format' }, { status: 400 })
    }
    
    const supabase = await createClient()

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch customer with RLS
    const { data, error } = await supabase
      .from('customers')
      .select('id, user_id, name, email, phone, address, created_at, updated_at')
      .eq('id', id)
      .eq('user_id', user['id'])
      .single()

    if (error) {
      if (error['code'] === 'PGRST116') {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
      apiLogger.error({ error }, 'Error fetching customer')
      return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in GET /api/customers/[id]')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

// PUT /api/customers/[id] - Update customer
async function putHandler(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context['params']
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid customer ID format' }, { status: 400 })
    }
    
    const supabase = await createClient()

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const _body = await request.json() as Omit<CustomerUpdateInput, 'user_id'>

    // Validate request body
    const validation = CustomerUpdateSchema.safeParse({
      ..._body,
      user_id: user['id']
    })

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: Update<'customers'> = {
      ...(validation['data'].name !== undefined && { name: validation['data'].name }),
      ...(validation['data'].phone !== undefined && { phone: validation['data'].phone ?? null }),
      ...(validation['data'].email !== undefined && { email: validation['data'].email ?? null }),
      ...(validation['data'].address !== undefined && { address: validation['data'].address ?? null }),
      ...(validation['data'].customer_type !== undefined && { customer_type: validation['data'].customer_type ?? null }),
      ...(validation['data'].discount_percentage !== undefined && { discount_percentage: validation['data'].discount_percentage ?? null }),
      ...(validation['data'].notes !== undefined && { notes: validation['data'].notes ?? null }),
      ...(validation['data'].is_active !== undefined && { is_active: validation['data'].is_active ?? null }),
      updated_at: new Date().toISOString(),
    }

    // Update with RLS enforcement
    const { data, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user['id'])
      .select()
      .single()

    if (error) {
      if (error['code'] === 'PGRST116') {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
      if (error['code'] === '23505') {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
      }
      apiLogger.error({ error }, 'Error updating customer')
      return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in PUT /api/customers/[id]')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id] - Delete customer
async function deleteHandler(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context['params']
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid customer ID format' }, { status: 400 })
    }
    
    const supabase = await createClient()

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if customer has orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('customer_id', id)
      .eq('user_id', user['id'])
      .limit(1)

    if (ordersError) {
      apiLogger.error({ error: ordersError }, 'Error checking customer orders')
      return NextResponse.json({ error: 'Failed to check customer orders' }, { status: 500 })
    }

    if (orders && orders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing orders. Please delete orders first.' },
        { status: 409 }
      )
    }

    // Delete with RLS enforcement
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('user_id', user['id'])

    if (error) {
      if (error['code'] === 'PGRST116') {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
      apiLogger.error({ error }, 'Error deleting customer')
      return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Customer deleted successfully' })
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in DELETE /api/customers/[id]')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

// Apply security middleware
const securedGET = withSecurity(getHandler, SecurityPresets.enhanced())
const securedPUT = withSecurity(putHandler, SecurityPresets.enhanced())
const securedDELETE = withSecurity(deleteHandler, SecurityPresets.enhanced())

export { securedGET as GET, securedPUT as PUT, securedDELETE as DELETE }
