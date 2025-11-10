// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { type NextRequest, NextResponse } from 'next/server'

import { CUSTOMER_FIELDS } from '@/lib/database/query-fields'
import { apiLogger } from '@/lib/logger'
import { typedInsert } from '@/lib/supabase/typed-insert'
import { getErrorMessage, safeNumber, safeString } from '@/lib/type-guards'
import { CustomerInsertSchema } from '@/lib/validations/domains/customer'
import type { Insert } from '@/types/database'
import { typed } from '@/types/type-utilities'
import { withSecurity, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'

import type { PostgrestError } from '@supabase/supabase-js'

type TypedSupabaseClient = ReturnType<typeof typed>
type CustomerValidationResult = ReturnType<typeof CustomerInsertSchema.safeParse>

interface AuthResult {
  supabase: TypedSupabaseClient
  userId: string
}

interface ListQuery {
  page: number
  limit: number
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

async function requireUser(): Promise<AuthResult | NextResponse> {
  const supabase = typed(await createClient())
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    apiLogger.error({ error }, 'Unauthorized access to /api/customers')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return { supabase, userId: user.id }
}

function parseListQuery(request: NextRequest): ListQuery {
  const { searchParams } = new URL(request.url)
  const sortOrder = safeString(searchParams.get('sort_order'), 'asc') === 'asc' ? 'asc' : 'desc'

  return {
    page: safeNumber(searchParams.get('page'), 1),
    limit: safeNumber(searchParams.get('limit'), 10),
    search: safeString(searchParams.get('search'), ''),
    sortBy: safeString(searchParams.get('sort_by'), 'name'),
    sortOrder
  }
}

async function fetchCustomersList(
  supabase: TypedSupabaseClient,
  userId: string,
  queryOptions: ListQuery
): Promise<{ data: unknown[] | null; error: PostgrestError | null }> {
  const { page, limit, search, sortBy, sortOrder } = queryOptions
  const offset = (page - 1) * limit

  let query = supabase
    .from('customers')
    .select(CUSTOMER_FIELDS.LIST)
    .eq('user_id', userId)
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  const { data, error } = await query
  return { data, error }
}

function validateCustomerPayload(body: Record<string, unknown>, userId: string): CustomerValidationResult {
  return CustomerInsertSchema.safeParse({
    ...body,
    user_id: userId
  })
}

function buildCustomerInsert(userId: string, data: any): Insert<'customers'> {
  return typedInsert<'customers'>({
    user_id: userId,
    name: data.name,
    email: data.email ?? null,
    phone: data.phone ?? null,
    address: data.address ?? null,
    customer_type: data.customer_type ?? 'regular',
    discount_percentage: data.discount_percentage ?? null,
    notes: data.notes ?? null,
    is_active: data.is_active ?? true
  })
}

// GET /api/customers - Get all customers
async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireUser()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { data, error } = await fetchCustomersList(authResult.supabase, authResult.userId, parseListQuery(request))

    if (error) {
      apiLogger.error({ error }, 'Error fetching customers from database')
      return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Unexpected error in GET /api/customers')
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

// POST /api/customers - Create new customer
async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireUser()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json() as Record<string, unknown>
    const validation = validateCustomerPayload(body, authResult.userId)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request data', details: validation.error.issues }, { status: 400 })
    }

    const customerData = buildCustomerInsert(authResult.userId, validation.data)
    const { data, error } = await authResult.supabase
      .from('customers')
      .insert(customerData)
      .select('id, name, email, phone, address, customer_type, discount_percentage, notes, is_active, loyalty_points, created_at, updated_at')
      .single()

    if (error) {
      if ('code' in error && error.code === '23505') {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
      }
      apiLogger.error({ error }, 'Error creating customer in database')
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Unexpected error in POST /api/customers')
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

// Apply security middleware
const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPOST = withSecurity(POST, SecurityPresets.enhanced())

export { securedGET as GET, securedPOST as POST }
