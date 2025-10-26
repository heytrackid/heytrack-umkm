/**
 * Middleware Module
 * Combined middleware utilities for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { withValidation, withQueryValidation } from './validation'
import { withRateLimit } from './rate-limit'
import { withCors } from './cors'
import { withAuth } from './auth'

// Re-export individual middleware
export { withValidation, withQueryValidation } from './validation'
export { withRateLimit } from './rate-limit'
export { withCors } from './cors'
export { withAuth } from './auth'

/**
 * Combine multiple middleware functions
 */
export function withMiddleware(
  ...middlewares: Array<(request: NextRequest) => Promise<NextResponse | null> | NextResponse | null>
) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    for (const middleware of middlewares) {
      const result = await middleware(request)
      if (result) {
        return result
      }
    }
    return null
  }
}
