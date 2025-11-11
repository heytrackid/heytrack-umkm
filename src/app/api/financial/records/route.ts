// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


 import { NextRequest, NextResponse } from 'next/server'
 import { z } from 'zod'

 import { apiLogger } from '@/lib/logger'
import { getErrorMessage, safeNumber } from '@/lib/type-guards'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
 import { createClient } from '@/utils/supabase/server'

const FinancialRecordSchema = z.object({
  description: z.string().min(1),
  category: z.string().min(1),
  amount: z.number().positive(),
  date: z.string(),
  type: z.enum(['income', 'expense']),
})

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
    }

    const body = await request.json()
    const validation = FinancialRecordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const data = validation.data
    const { description, category, amount, date, type } = data

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
