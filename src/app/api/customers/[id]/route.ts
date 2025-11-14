// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

// API Route: /api/customers/[id]
// Handles GET, PUT, DELETE operations for individual customer

// External dependencies
import { NextRequest, NextResponse } from 'next/server'

// Internal modules
import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage, isValidUUID } from '@/lib/type-guards'
import { CustomerUpdateSchema } from '@/lib/validations/domains/customer'
import { typed } from '@/types/type-utilities'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'

// Type imports
import type { CustomerUpdateInput } from '@/lib/validations/domains/customer'
import type { CustomerUpdate } from '@/types/database'

interface RouteContext {
  params: Promise<{ id: string }>
}

type TypedSupabaseClient = ReturnType<typeof typed>

interface CustomerRouteContext {
  supabase: TypedSupabaseClient
  userId: string
  customerId: string
}

async function buildCustomerContext(context: RouteContext): Promise<CustomerRouteContext | NextResponse> {
  const { id } = await context.params
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid customer ID format' }, { status: 400 })
  }

  // Authenticate with Stack Auth
  const authResult = await requireAuth()
  if (isErrorResponse(authResult)) {
    return authResult
  }
  const user = authResult

  const supabase = typed(await createClient())
  return { supabase, userId: user.id, customerId: id }
}

function mapUpdatePayload(data: CustomerUpdateInput): CustomerUpdate {
  const payload: CustomerUpdate = { updated_at: new Date().toISOString() }
  const setters: Array<{
    key: keyof CustomerUpdateInput
    map: (value: CustomerUpdateInput[keyof CustomerUpdateInput]) => unknown
  }> = [
    { key: 'name', map: value => value },
    { key: 'phone', map: value => value ?? null },
    { key: 'email', map: value => value ?? null },
    { key: 'address', map: value => value ?? null },
    { key: 'customer_type', map: value => value ?? null },
    { key: 'discount_percentage', map: value => value ?? null },
    { key: 'notes', map: value => value ?? null },
    { key: 'is_active', map: value => value ?? null }
  ]

  setters.forEach(({ key, map }) => {
    const value = data[key]
    if (value !== undefined) {
      ;(payload as Record<string, unknown>)[key as string] = map(value)
    }
  })

  return payload
}

function handleCustomerNotFound(error: unknown): NextResponse | null {
  if (typeof error === 'object' && error && 'code' in error && (error as { code: string }).code === 'PGRST116') {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }
  return null
}

async function ensureNoOrders(
  supabase: TypedSupabaseClient,
  customerId: string,
  userId: string
): Promise<NextResponse | null> {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id')
    .eq('customer_id', customerId)
    .eq('user_id', userId)
    .limit(1)

  if (error) {
    apiLogger.error({ error }, 'Error checking customer orders')
    return NextResponse.json({ error: 'Failed to check customer orders' }, { status: 500 })
  }

  if (orders && orders.length > 0) {
    return NextResponse.json({ error: 'Cannot delete customer with existing orders. Please delete orders first.' }, { status: 409 })
  }

  return null
}

async function resolveUpdatePayload(
  request: NextRequest,
  userId: string
): Promise<{ updateData: CustomerUpdate } | NextResponse> {
  const body = await request.json() as Omit<CustomerUpdateInput, 'user_id'>
  const validation = CustomerUpdateSchema.safeParse({ ...body, user_id: userId })

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid request data', details: validation.error.issues }, { status: 400 })
  }

  return { updateData: mapUpdatePayload(validation.data) }
}

// Apply security middleware
export const GET = withSecurity(async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const routeContext = await buildCustomerContext(context)
    if (routeContext instanceof NextResponse) {
      return routeContext
    }

    const { supabase, userId, customerId } = routeContext
    const { data, error } = await supabase
      .from('customers')
      .select('id, user_id, name, email, phone, address, created_at, updated_at')
      .eq('id', customerId)
      .eq('user_id', userId)
      .single()

    if (error) {
      const errorResponse = handleCustomerNotFound(error)
      if (errorResponse) { return errorResponse }
      apiLogger.error({ error }, 'Error fetching customer')
      return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in GET /api/customers/[id]')
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}, SecurityPresets.enhanced())

export const PUT = withSecurity(async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const routeContext = await buildCustomerContext(context)
    if (routeContext instanceof NextResponse) {
      return routeContext
    }

    const payloadResult = await resolveUpdatePayload(request, routeContext.userId)
    if (payloadResult instanceof NextResponse) {
      return payloadResult
    }

    const { data, error } = await routeContext.supabase
      .from('customers')
      .update(payloadResult.updateData)
      .eq('id', routeContext.customerId)
      .eq('user_id', routeContext.userId)
      .select()
      .single()

    if (error) {
      const notFoundResponse = handleCustomerNotFound(error)
      if (notFoundResponse) { return notFoundResponse }
      if (typeof error === 'object' && error && 'code' in error && (error as { code: string }).code === '23505') {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
      }
      apiLogger.error({ error }, 'Error updating customer')
      return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in PUT /api/customers/[id]')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}, SecurityPresets.enhanced())

export const DELETE = withSecurity(async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const routeContext = await buildCustomerContext(context)
    if (routeContext instanceof NextResponse) {
      return routeContext
    }

    const validationResponse = await ensureNoOrders(routeContext.supabase, routeContext.customerId, routeContext.userId)
    if (validationResponse) {
      return validationResponse
    }

    const { error } = await routeContext.supabase
      .from('customers')
      .delete()
      .eq('id', routeContext.customerId)
      .eq('user_id', routeContext.userId)

    if (error) {
      const notFoundResponse = handleCustomerNotFound(error)
      if (notFoundResponse) { return notFoundResponse }
      apiLogger.error({ error }, 'Error deleting customer')
      return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Customer deleted successfully' })
  } catch (error) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in DELETE /api/customers/[id]')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}, SecurityPresets.enhanced())

