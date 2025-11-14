export const runtime = 'nodejs'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()

    const { data: ingredients, error } = await supabase
      .from('ingredients')
      .select('name, category, unit, price_per_unit, current_stock, reorder_point, supplier')
      .eq('user_id', user.id)
      .order('name')

    if (error) throw error

    // Return as JSON for client-side CSV conversion
    return NextResponse.json({
      data: ingredients || [],
      meta: {
        total: (ingredients || []).length,
        exportedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    return handleAPIError(error, 'GET /api/export/ingredients')
  }
}

const securedGET = withSecurity(GET, SecurityPresets.enhanced())
export { securedGET as GET }
