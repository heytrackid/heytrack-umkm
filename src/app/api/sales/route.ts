import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { PaginationQuerySchema, SalesInsertSchema, SalesQuerySchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Validate query parameters
  const paginationValidation = PaginationQuerySchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
    search: searchParams.get('search'),
    sort_by: searchParams.get('sort_by'),
    sort_order: searchParams.get('sort_order'),
  })

  if (!paginationValidation.success) {
    return NextResponse.json(
      { error: 'Invalid pagination parameters', details: paginationValidation.error.issues },
      { status: 400 }
    )
  }

  // Validate sales-specific query parameters
  const salesQueryValidation = SalesQuerySchema.safeParse({
    start_date: searchParams.get('start_date'),
    end_date: searchParams.get('end_date'),
    recipe_id: searchParams.get('recipe_id'),
    customer_name: searchParams.get('customer_name'),
  })

  if (!salesQueryValidation.success) {
    return NextResponse.json(
      { error: 'Invalid sales query parameters', details: salesQueryValidation.error.issues },
      { status: 400 }
    )
  }

  const { page, limit, search, sort_by, sort_order } = paginationValidation.data
  const { start_date, end_date, recipe_id, customer_name } = salesQueryValidation.data

  try {
    const supabase = createSupabaseClient();

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    let query = supabase
      .from('sales')
      .select(`
        *,
        recipe:recipes(name)
      `)
      .range(offset, offset + limit - 1)

    // Add filters
    if (search) {
      query = query.or(`customer_name.ilike.%${search}%`)
    }

    if (start_date) {
      query = query.gte('date', start_date)
    }

    if (end_date) {
      query = query.lte('date', end_date)
    }

    if (recipe_id) {
      query = query.eq('recipe_id', recipe_id)
    }

    if (customer_name) {
      query = query.ilike('customer_name', `%${customer_name}%`)
    }

    // Add sorting
    const sortField = sort_by || 'date'
    const sortDirection = sort_order === 'asc'
    query = query.order(sortField, { ascending: sortDirection })

    const { data: sales, error } = await query

    if (error) throw error;

    // Get total count
    let countQuery = supabase.from('sales').select('*', { count: 'exact', head: true })

    // Apply same filters to count query
    if (search) {
      countQuery = countQuery.or(`customer_name.ilike.%${search}%`)
    }
    if (start_date) {
      countQuery = countQuery.gte('date', start_date)
    }
    if (end_date) {
      countQuery = countQuery.lte('date', end_date)
    }
    if (recipe_id) {
      countQuery = countQuery.eq('recipe_id', recipe_id)
    }
    if (customer_name) {
      countQuery = countQuery.ilike('customer_name', `%${customer_name}%`)
    }

    const { count } = await countQuery

    return NextResponse.json({
      data: sales,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseClient();
    const body = await request.json();

    // Validate request body
    const validation = SalesInsertSchema.safeParse(body)
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

    const { data: sale, error } = await supabase
      .from('sales')
      .insert([validatedData])
      .select(`
        *,
        recipe:recipes(name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(sale, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}