import type { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware Module
 * Combined middleware utilities for API routes
 */


// Re-export individual middleware
export { withCors } from './cors'
export { withRateLimit } from './rate-limit'
export { withQueryValidation, withValidation } from './validation'
// export { withAuth } from './auth' // Removed - auth middleware not implemented

/**
 * Combine multiple middleware functions
 */
export function withMiddleware(
  ...middlewares: Array<(request: NextRequest) => NextResponse | Promise<NextResponse | null> | null>
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
