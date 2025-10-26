/**
 * CORS Middleware Module
 * Cross-Origin Resource Sharing protection
 */

import { NextRequest, NextResponse } from 'next/server'
import { createErrorResponse } from '../responses'

/**
 * Create CORS middleware
 */
export function withCors(allowedOrigins: string[] = ['*']) {
  return (request: NextRequest): NextResponse | null => {
    const origin = request.headers.get('origin')
    if (!origin) return null

    const isAllowed = allowedOrigins.includes('*') || allowedOrigins.includes(origin)
    if (!isAllowed) {
      return createErrorResponse('CORS policy violation', 403)
    }

    return null
  }
}
