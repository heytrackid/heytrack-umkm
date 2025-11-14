// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { APIError, handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { requireAuth, isErrorResponse } from '@/lib/api-auth'
import { SecurityPresets, createSecureHandler } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'

const WebVitalsSchema = z.object({
  name: z.string().trim().min(1).max(80),
  value: z.number().finite(),
  rating: z.string().trim().min(1).max(30),
  id: z.string().trim().min(1).max(120),
  page: z.string().trim().max(200).optional()
}).strict()

async function postHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const body = WebVitalsSchema.parse(await request.json())

    apiLogger.info({
      userId: user.id,
      metric: body.name,
      value: body.value,
      rating: body.rating,
      id: body.id,
      page: body.page
    }, 'Web Vitals metric recorded')

    return NextResponse.json({ success: true })
  } catch (error) {
    apiLogger.error({ error }, 'Failed to record web vitals')
    return handleAPIError(error, 'POST /api/analytics/web-vitals')
  }
}

export const POST = createSecureHandler(postHandler, 'POST /api/analytics/web-vitals', SecurityPresets.maximum())
