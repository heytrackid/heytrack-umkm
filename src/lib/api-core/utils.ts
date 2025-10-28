/**
 * Utilities Module
 * General utility functions for API operations
 */

import { type NextRequest, NextResponse } from 'next/server'

/**
 * Parse search parameters from request URL
 */
export function parseSearchParams(request: NextRequest): Record<string, string> {
  const { searchParams } = new URL(request.url)
  return Object.fromEntries(searchParams.entries())
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') ||
         request.headers.get('x-real-ip') ||
         'unknown'
}

/**
 * Create ETag for response caching
 */
export function createETag(data: unknown): string {
  const hash = JSON.stringify(data).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return `"${hash}"`
}

/**
 * Handle conditional GET requests with ETags
 */
export function handleConditionalGET(request: NextRequest, etag: string): NextResponse | null {
  const ifNoneMatch = request.headers.get('if-none-match')
  if (ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304 })
  }
  return null
}
