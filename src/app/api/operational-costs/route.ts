// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { type NextRequest, NextResponse } from 'next/server'

import { apiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
import { OperationalCostInsertSchema } from '@/lib/validations/domains/finance'
import type { Insert } from '@/types/database'
import { SecurityPresets, withSecurity } from '@/utils/security'
import { createClient } from '@/utils/supabase/server'


/**
 * GET /api/operational-costs
 *
 * Fetch all operational costs
 *
 * Query Parameters:
 * - start_date: Filter by start date (optional)
 * - end_date: Filter by end date (optional)
 * - limit: Limit number of results (optional)
 * - offset: Offset for pagination (optional)
 * - search: Search query (optional)
 */
async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Create authenticated Supabase client
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error:')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('operational_costs')
      .select('*', { count: 'exact' })
      .eq('user_id', user['id'])
      .order('date', { ascending: false })

    // Apply filters
    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }
    if (search) {
      query = query.or(`description.ilike.%${search}%,category.ilike.%${search}%`)
    }
    if (limit) {
      query = query.limit(parseInt(limit, 10))
    }
    if (offset) {
      query = query.range(parseInt(offset, 10), parseInt(offset, 10) + parseInt(limit ?? '10', 10) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      apiLogger.error({ error }, 'Error fetching operational costs:')
      return NextResponse.json(
        { error: 'Failed to fetch operational costs' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: data ?? [],
      count: count ?? 0
    })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in GET /api/operational-costs:')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

/**
 * POST /api/operational-costs
 *
 * Create new operational cost
 */
async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Create authenticated Supabase client
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error:')
       return NextResponse.json(
         { error: 'Unauthorized' },
         { status: 401 }
       )
     }

      const body = await request.json() as unknown

    // Validate request body with Zod
    const validation = OperationalCostInsertSchema.safeParse(body)
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

    const insertPayload: Insert<'operational_costs'> = {
      user_id: user['id'],
      category: validatedData.category,
      amount: validatedData.amount,
      description: validatedData.description,
      date: validatedData.date ?? new Date().toISOString().split('T')[0],
      supplier: validatedData.supplier ?? null,
      payment_method: validatedData.payment_method ?? null,
      recurring: validatedData.recurring ?? false,
      frequency: validatedData.frequency ?? null,
      is_active: true
    }

    const { data, error } = await supabase
      .from('operational_costs')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      apiLogger.error({ error }, 'Error creating operational cost:')
      return NextResponse.json(
        { error: 'Failed to create operational cost' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in POST /api/operational-costs:')
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

// PUT and DELETE moved to /api/operational-costs/[id]/route.ts
