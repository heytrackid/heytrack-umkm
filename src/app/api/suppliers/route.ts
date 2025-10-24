import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { PaginationQuerySchema, SupplierInsertSchema } from '@/lib/validations';

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
    const supabase = createSupabaseClient();

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    let query = supabase
      .from('suppliers')
      .select('*')
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

    if (error) throw error;

    // Get total count
    let countQuery = supabase.from('suppliers').select('*', { count: 'exact', head: true })
    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%`)
    }
    const { count } = await countQuery

    return NextResponse.json({
      data: suppliers,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseClient();
    const body = await request.json();

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

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .insert([validatedData])
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json(supplier, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}