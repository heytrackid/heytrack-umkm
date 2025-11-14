// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { APIError, handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { requireAuth, isErrorResponse } from '@/lib/api-auth'
import { SecurityPresets, createSecureHandler } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'

const LongTaskSchema = z.object({
  duration: z.number().positive(),
  startTime: z.number().nonnegative(),
  name: z.string().trim().min(1).max(120),
  page: z.string().trim().max(200).optional()
}).strict()

async function longTasksPOST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const body = LongTaskSchema.parse(await request.json())

    apiLogger.warn({
      userId: user.id,
      duration: body.duration,
      startTime: body.startTime,
      name: body.name,
      page: body.page
    }, 'Long task detected')

    return NextResponse.json({ success: true })
  } catch (error) {
    apiLogger.error({ error }, 'Failed to record long task')
    return handleAPIError(error, 'POST /api/analytics/long-tasks')
  }
}

export const POST = createSecureHandler(longTasksPOST, 'POST /api/analytics/long-tasks', SecurityPresets.maximum())
