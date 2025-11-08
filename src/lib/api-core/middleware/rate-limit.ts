import { createErrorResponse } from '@/lib/api-core/responses'

import type { NextRequest, NextResponse } from 'next/server'

/**
 * Rate Limiting Middleware Module
 * API rate limiting protection
 */


/**
 * Create rate limiting middleware
 */
export function withRateLimit(options: { windowMs: number; maxRequests: number }) {
  const requests = new Map<string, { count: number; resetTime: number }>()

  return (request: NextRequest): NextResponse | null => {
    const ip = request['headers'].get('x-forwarded-for') ?? 'anonymous'
    const now = Date.now()
    const windowData = requests.get(ip)

    if (!windowData || now > windowData.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + options.windowMs })
      return null
    }

    if (windowData.count >= options.maxRequests) {
      return createErrorResponse('Rate limit exceeded', 429)
    }

    windowData.count++
    return null
  }
}
