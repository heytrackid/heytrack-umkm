import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'

/**
 * POST /api/financial/records
 * Create a new financial record (manual entry)
 */
export async function POST(_request: NextRequest) {
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

    const body = await request.json()
    const { description, category, amount, date, type, source = 'manual_entry' } = body

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
        user_id: user.id,
        description,
        category: type === 'income' ? 'Revenue' : category,
        amount,
        date,
        reference: `MANUAL-${Date.now()}`,
        source
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
    apiLogger.error({ error }, 'Error in POST /api/financial/records')
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
export async function GET(_request: NextRequest) {
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
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = supabase
      .from('financial_records')
      .select('*')
      .eq('user_id', user.id)
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
      data: records || []
    })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in GET /api/financial/records')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
