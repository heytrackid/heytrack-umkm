export const runtime = 'nodejs'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total_amount,
        status,
        created_at,
        customers (
          name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    return handleAPIError(error, 'GET /api/dashboard/recent-orders')
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/dashboard/recent-orders', SecurityPresets.enhanced())
