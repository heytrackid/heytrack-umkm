export const runtime = 'nodejs'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { ProductionBatchCreateSchema } from '@/lib/validations/domains/production'
import type { ProductionBatchInsert } from '@/types/database'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = await createClient()

    let query = supabase
      .from('production_batches')
      .select(`
        *,
        recipes (
          id,
          name,
          category
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    return handleAPIError(error, 'GET /api/production/batches')
  }
}

async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const body = await request.json()

    // Validate input
    const validation = ProductionBatchCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Data tidak valid',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create batch
    const insertData: ProductionBatchInsert = {
      ...validation.data,
      user_id: user.id,
    }

    const { data, error } = await supabase
      .from('production_batches')
      .insert(insertData as any)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return handleAPIError(error, 'POST /api/production/batches')
  }
}

const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPOST = withSecurity(POST, SecurityPresets.enhanced())

export { securedGET as GET, securedPOST as POST }
