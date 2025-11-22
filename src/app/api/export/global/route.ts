// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { handleAPIError } from '@/lib/errors/api-error-handler'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { GlobalExportService } from '@/lib/export/global-export'
import { apiLogger } from '@/lib/logger'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/export/global - Export all data as Excel file
async function getGlobalExportHandler(context: RouteContext) {
  const { user } = context

  try {
    apiLogger.info({ userId: user.id }, 'Starting global export')

    // Generate export
    const buffer = await GlobalExportService.generateExport(user.id)

    // Return file
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
    apiLogger.error({ error, userId: user.id }, 'Error in GET /api/export/global')
    return handleAPIError(error, 'GET /api/export/global')
  }
}

export const GET = createApiRoute(
  { method: 'GET', path: '/api/export/global' },
  getGlobalExportHandler
)
