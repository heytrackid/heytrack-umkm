// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextRequest, NextResponse } from 'next/server'

import { GlobalExportService } from '@/lib/export/global-export'
import { apiLogger } from '@/lib/logger'
import { requireAuth, isErrorResponse } from '@/lib/api-auth'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'

export const dynamic = 'force-dynamic'

async function getHandler(_request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    apiLogger.info({ userId: user.id }, 'Starting global export')

    // 2. Generate export
    const buffer = await GlobalExportService.generateExport(user.id)

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
  } catch (error) {
    apiLogger.error({ error }, 'Error in GET /api/export/global')
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    )
  }
}

// Apply security middleware
export const GET = createSecureHandler(getHandler, 'GET /api/export/global', SecurityPresets.enhanced())
