export const runtime = 'nodejs'

import { type NextRequest, NextResponse } from 'next/server'

import { handleAPIError } from '@/lib/errors/api-error-handler'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { BusinessBootstrapService } from '@/services/ai/BusinessBootstrapService'

async function postHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = await BusinessBootstrapService.generateAndSeed(body, user.id)

    return NextResponse.json({ success: true, ...result }, { status: 201 })
  } catch (error) {
    return handleAPIError(error, 'POST /api/ai/bootstrap')
  }
}

export const POST = withSecurity(postHandler, SecurityPresets.enhanced())
