import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { SupplierInsertSchema } from '@/lib/validations/domains/supplier'
import { PaginationQuerySchema } from '@/lib/validations/domains/common'
import { getErrorMessage } from '@/lib/type-guards'
import type { Database } from '@/types/supabase-generated'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'



export async function GET(request: NextRequest) {
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

  const { page, limit, search, sort_by, sort_order } = queryValidation.data

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
      .eq('user_id', user.id)
      .range(offset, offset + limit - 1)

    // Add search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Add sorting
    const sortField = sort_by || 'name'
    const sortDirection = sort_order === 'asc'
    query = query.order(sortField, { ascending: sortDirection })

    const { data: suppliers, error } = await query

    if (error) {throw error;}

    // Get total count
    let countQuery = supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%`)
    }
    const { count } = await countQuery

    return NextResponse.json({
      data: suppliers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()

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

    const validatedData = validation.data

    const insertPayload: Database['public']['Tables']['suppliers']['Insert'] = {
      ...validatedData,
      user_id: user.id
    }

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