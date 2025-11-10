// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { type NextRequest, NextResponse } from 'next/server'

import { getErrorMessage } from '@/lib/type-guards'
import { PaginationQuerySchema } from '@/lib/validations/domains/common'
import { SupplierInsertSchema } from '@/lib/validations/domains/supplier'
import type { Insert } from '@/types/database'
import { withSecurity, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'



async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)

  // Validate query parameters
  const queryValidation = PaginationQuerySchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
    search: searchParams.get('search'),
    sort_by: searchParams.get('sort_by'),
    sort_order: searchParams.get('sort_order'),
  })

  if (!queryValidation.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: queryValidation.error.issues },
      { status: 400 }
    )
  }

  const { page, limit, search, sort_by, sort_order } = queryValidation['data']

  try {
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    let query = supabase
      .from('suppliers')
      .select('id, name, contact_person, email, phone, address, notes, is_active, created_at, updated_at')
      .eq('user_id', user['id'])
      .range(offset, offset + limit - 1)

    // Add search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Add sorting
    const sortField = sort_by ?? 'name'
    const sortDirection = sort_order === 'asc'
    query = query.order(sortField, { ascending: sortDirection })

    const { data: suppliers, error } = await query

    if (error) {throw error;}

    // Get total count
    let countQuery = supabase.from('suppliers').select('id', { count: 'exact', head: true }).eq('user_id', user['id'])
    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%`)
    }
    const { count } = await countQuery

    return NextResponse.json({
      data: suppliers,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit)
      }
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json() as unknown

    // Validate request body
    const validation = SupplierInsertSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    const validatedData = validation['data']

    const insertPayload = {
      user_id: user['id'],
      name: validatedData.name,
      address: validatedData.address ?? null,
      contact_person: validatedData.contact_person ?? null,
      email: validatedData.email ?? null,
      phone: validatedData.phone ?? null,
      notes: validatedData.notes ?? null,
    } as Insert<'suppliers'>

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .insert(insertPayload)
      .select('id, name, contact_person, email, phone, address, notes, is_active, created_at, updated_at')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 })
    }

    return NextResponse.json(supplier, { status: 201 })
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

// Apply security middleware
const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPOST = withSecurity(POST, SecurityPresets.enhanced())

export { securedGET as GET, securedPOST as POST }
