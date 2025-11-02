import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getErrorMessage } from '@/lib/type-guards'
import { apiLogger } from '@/lib/logger'
import { PaginationQuerySchema, SalesInsertSchema, SalesQuerySchema } from '@/lib/validations'
import type { FinancialRecordsInsert } from '@/types/database'
import { withSecurity, SecurityPresets } from '@/utils/security'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

// Note: 'sales' table doesn't exist - sales data is tracked through orders and order_items
// type Sale = SalesTable

// Define the original GET function
async function GET(request: NextRequest) {
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
    period: searchParams.get('period') || 'monthly',
    include_trends: searchParams.get('include_trends') === 'true',
  })

  if (!salesQueryValidation.success) {
    return NextResponse.json(
      { error: 'Invalid sales query parameters', details: salesQueryValidation.error.issues },
      { status: 400 }
    )
  }

  const { page, limit, search, sort_by, sort_order } = paginationValidation.data
  const { start_date, end_date, recipe_id } = salesQueryValidation.data

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
      .from('financial_records')
      .select(`
        *
      `)
      .eq('record_type', 'INCOME')
      .eq('user_id', user.id)
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

    // Add sorting
    const sortField = sort_by || 'date'
    const sortDirection = sort_order === 'asc'
    query = query.order(sortField, { ascending: sortDirection })

    const { data: sales, error } = await query

    if (error) {throw error;}

    // Get total count
    let countQuery = supabase.from('financial_records').select('*', { count: 'exact', head: true }).eq('record_type', 'INCOME').eq('user_id', user.id)

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

    const { count } = await countQuery

    return NextResponse.json({
      data: sales,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in GET /api/sales')
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

// Define the original POST function
async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // The request body is already sanitized by the security middleware
    const body = await request.json()

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

    // Map sales data to financial_records structure
    const insertPayload: FinancialRecordsInsert = {
      amount: validatedData.total_amount,
      category: 'Sales',
      description: `Sale of recipe ${validatedData.recipe_id}${validatedData.customer_name ? ` to ${validatedData.customer_name}` : ''}`,
      date: validatedData.date,
      reference: validatedData.recipe_id,
      type: 'INCOME',
      user_id: user.id
    }

    const { data: sale, error } = await supabase
      .from('financial_records')
      .insert(insertPayload)
      .select('*')
      .single()

    if (error) {
      apiLogger.error({ error }, 'Error creating sale')
      return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 })
    }

    return NextResponse.json(sale, { status: 201 })
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in POST /api/sales')
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

// Apply security middleware with enhanced security configuration
const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPOST = withSecurity(POST, SecurityPresets.enhanced())

// Export secured handlers
export { securedGET as GET, securedPOST as POST }
