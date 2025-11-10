// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { type NextRequest, NextResponse } from 'next/server'

import { apiLogger } from '@/lib/logger'
import { safeNumber, getErrorMessage } from '@/lib/type-guards'
import { withSecurity, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'


// Unused types removed

/**
 * POST /api/financial/records
 * Create a new financial record (manual entry)
 */
async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }    const _body = await request.json() as { description: string; category: string; amount: number; date: string; type: string }
    const { description, category, amount, date, type } = _body

    // Validation
    if (!description || !category || !amount || !date || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be income or expense' },
        { status: 400 }
      )
    }

    // Insert into financial_records
    const { data: record, error: insertError } = await supabase
      .from('financial_records')
      .insert({
        user_id: user['id'],
        type: type.toUpperCase() as 'EXPENSE' | 'INCOME',
        description,
        category: type === 'income' ? 'Revenue' : category,
        amount,
        date,
        reference: `MANUAL-${Date.now()}`
      })
      .select()
      .single()

    if (insertError) {
      apiLogger.error({ error: insertError }, 'Error creating financial record')
      return NextResponse.json(
        { error: 'Failed to create financial record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: record
    })

  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in POST /api/financial/records')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/financial/records
 * Get financial records for the current user
 */
async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const type = searchParams.get('type') // income or expense
    const limit = safeNumber(searchParams.get('limit'), 100)

    let query = supabase
      .from('financial_records')
      .select('id, description, category, amount, date, reference, type, created_at')
      .eq('user_id', user['id'])
      .order('date', { ascending: false })
      .limit(limit)

    if (startDate) {
      query = query.gte('date', startDate)
    }

    if (endDate) {
      query = query.lte('date', endDate)
    }

    if (type === 'income') {
      query = query.eq('category', 'Revenue')
    } else if (type === 'expense') {
      query = query.neq('category', 'Revenue')
    }

    const { data: records, error: fetchError } = await query

    if (fetchError) {
      apiLogger.error({ error: fetchError }, 'Error fetching financial records')
      return NextResponse.json(
        { error: 'Failed to fetch financial records' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: records ?? []
    })

  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in GET /api/financial/records')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Apply security middleware
const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPOST = withSecurity(POST, SecurityPresets.enhanced())

export { securedGET as GET, securedPOST as POST }
