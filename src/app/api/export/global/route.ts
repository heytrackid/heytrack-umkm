// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { type NextRequest, NextResponse } from 'next/server'

import { GlobalExportService } from '@/lib/export/global-export'
import { apiLogger } from '@/lib/logger'
import { withSecurity, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authenticate
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    apiLogger.info({ userId: user['id'] }, 'Starting global export')

    // 2. Generate export
    const buffer = await GlobalExportService.generateExport(user['id'])

    // 3. Return file
    const filename = `HeyTrack_Export_${new Date().toISOString().split('T')[0]}.xlsx`
    
    return new NextResponse(buffer as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in GET /api/export/global')
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    )
  }
}

// Apply security middleware
const securedGET = withSecurity(GET, SecurityPresets.enhanced())

export { securedGET as GET }
