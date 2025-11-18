export const runtime = 'nodejs'

import type { NextResponse } from 'next/server'

import { CustomerUpdateSchema } from '@/lib/validations/domains/customer'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { createGetHandler, createUpdateHandler } from '@/lib/api/crud-helpers'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-core'
import { apiLogger } from '@/lib/logger'

// GET /api/customers/[id] - Get single customer
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/customers/[id]',
  },
  createGetHandler({
    table: 'customers',
    selectFields: 'id, user_id, name, email, phone, address, customer_type, discount_percentage, notes, is_active, loyalty_points, created_at, updated_at',
  })
)

// PUT /api/customers/[id] - Update customer
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/customers/[id]',
    bodySchema: CustomerUpdateSchema,
  },
  createUpdateHandler(
    {
      table: 'customers',
      selectFields: 'id, name, email, phone, address, customer_type, discount_percentage, notes, is_active, loyalty_points, updated_at',
    },
    'Customer updated successfully'
  )
)

// DELETE /api/customers/[id] - Delete customer with order validation
async function deleteCustomerHandler(context: RouteContext): Promise<NextResponse> {
  const { user, supabase, params } = context
  const id = params?.['id']

  if (!id) {
    return createErrorResponse('Customer ID is required', 400)
  }

  // Check if customer has any orders
  const { data: orders } = await supabase
    .from('orders' as never)
    .select('id')
    .eq('customer_id', id)
    .eq('user_id', user.id)
    .limit(1)

  if (orders && orders.length > 0) {
    return createErrorResponse('Cannot delete customer with existing orders. Please delete orders first.', 409)
  }

  // Delete customer
  const { error } = await supabase
    .from('customers' as never)
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    apiLogger.error({ error, id }, 'Failed to delete customer')
    
    if (error.code === 'PGRST116') {
      return createErrorResponse('Customer not found', 404)
    }
    
    return createErrorResponse('Failed to delete customer', 500)
  }

  return createSuccessResponse({ id }, 'Customer deleted successfully')
}

export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/customers/[id]',
  },
  deleteCustomerHandler
)

