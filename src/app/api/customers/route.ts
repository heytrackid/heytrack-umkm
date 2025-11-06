import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { CustomerInsertSchema } from '@/lib/validations/domains/customer'
import { CUSTOMER_FIELDS } from '@/lib/database/query-fields'
import { apiLogger } from '@/lib/logger'
import { typedInsert } from '@/lib/supabase/typed-insert'
import { getErrorMessage, safeNumber, safeString } from '@/lib/type-guards'
import { withSecurity, SecurityPresets } from '@/utils/security'
import { typed } from '@/types/type-utilities'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

// GET /api/customers - Get all customers
async function GET(request: NextRequest) {
  try {
    // Create authenticated Supabase client
    const supabase = typed(await createClient())

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Unauthorized access to GET /api/customers')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)

    // Parse query parameters with defaults
    const page = safeNumber(searchParams.get('page'), 1)
    const limit = safeNumber(searchParams.get('limit'), 10)
    const search = safeString(searchParams.get('search'), '')
    const sort_by = safeString(searchParams.get('sort_by'), 'name')
    const sort_order = safeString(searchParams.get('sort_order'), 'asc')

    // ✅ OPTIMIZED: Use specific fields instead of SELECT *
    let query = supabase
      .from('customers')
      .select(CUSTOMER_FIELDS.LIST)
      .eq('user_id', user.id)

    // Add search filter if provided
    if (search && search.length > 0) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    // Add sorting
    const sortField = sort_by
    const sortDirection = sort_order === 'asc'
    query = query.order(sortField, { ascending: sortDirection })

    // Add pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      apiLogger.error({ error }, 'Error fetching customers from database')
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Unexpected error in GET /api/customers')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

// POST /api/customers - Create new customer
async function POST(request: NextRequest) {
  try {
    // Create authenticated Supabase client
    const supabase = typed(await createClient())

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Unauthorized access to POST /api/customers')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate request body
    const validation = CustomerInsertSchema.safeParse({
      ...body,
      user_id: user.id
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

    const validatedData = validation.data
    
    // Type-safe data preparation (see docs/SUPABASE_TYPE_WORKAROUND.md)
    const customerData = typedInsert<'customers'>({
      user_id: user.id,
      name: validatedData.name,
      email: validatedData.email ?? null,
      phone: validatedData.phone ?? null,
      address: validatedData.address ?? null,
      customer_type: validatedData.customer_type ?? 'regular',
      discount_percentage: validatedData.discount_percentage ?? null,
      notes: validatedData.notes ?? null,
      is_active: validatedData.is_active ?? true,
    })
    
    // Insert with proper typing
    const { data, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select('id, name, email, phone, address, customer_type, discount_percentage, notes, is_active, loyalty_points, created_at, updated_at')
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        )
      }
      apiLogger.error({ error }, 'Error creating customer in database')
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Unexpected error in POST /api/customers')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

// Apply security middleware
const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPOST = withSecurity(POST, SecurityPresets.enhanced())

export { securedGET as GET, securedPOST as POST }