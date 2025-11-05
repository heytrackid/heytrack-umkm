import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { OperationalCostInsertSchema } from '@/lib/validations/domains/finance'
import type { ExpensesInsert } from '@/types/database'
import { getErrorMessage } from '@/lib/type-guards'
import { apiLogger } from '@/lib/logger'
import { checkBotId } from 'botid/server'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'
/**
 * GET /api/operational-costs
 * 
 * Fetch all operational costs (expenses where category != 'Revenue')
 * 
 * Query Parameters:
 * - start_date: Filter by start date (optional)
 * - end_date: Filter by end date (optional)
 */
export async function GET(request: NextRequest) {
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

    // Check if the request is from a bot
    const verification = await checkBotId({
      advancedOptions: {
        checkLevel: 'basic',
      },
    })
    if (verification.isBot) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()

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

    const validatedData = validation.data

    const insertPayload: ExpensesInsert = {
      user_id: user.id,
      category: validatedData.category,
      subcategory: validatedData.subcategory,
      amount: validatedData.amount,
      description: validatedData.description ?? '',
      expense_date: validatedData.date,
      supplier: validatedData.vendor_name ?? undefined,
      payment_method: 'CASH',
      status: validatedData.is_paid ? 'paid' : 'pending',
      receipt_number: validatedData.invoice_number,
      is_recurring: validatedData.is_recurring,
      recurring_frequency: validatedData.recurring_frequency ?? undefined,
      tags: []
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert(insertPayload)
      .select('id, description, category, subcategory, amount, expense_date, supplier, payment_method, status, receipt_number, is_recurring, recurring_frequency, created_at, updated_at')
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

// PUT and DELETE moved to /api/operational-costs/[id]/route.ts
