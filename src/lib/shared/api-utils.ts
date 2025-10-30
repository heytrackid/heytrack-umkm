/**
 * Shared API Utilities
 * Common API response patterns and utilities
 */

import { type NextRequest, NextResponse } from 'next/server'
import { getErrorMessage } from '@/shared'
import { apiLogger } from '@/lib/logger'

// API Response helpers
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status = 200
) {
  const response = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }

  if (message) {
    Object.assign(response, { message })
  }

  return NextResponse.json(response, { status })
}

export function createErrorResponse(
  message: string,
  status = 500,
  details?: unknown
) {
  const errorResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  }

  if (details) {
    Object.assign(errorResponse, { details })
  }

  apiLogger.error({ message, status, details }, 'API Error Response')

  return NextResponse.json(errorResponse, { status })
}

export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  },
  message?: string
) {
  return NextResponse.json({
    success: true,
    data,
    pagination,
    message,
    timestamp: new Date().toISOString()
  })
}

// Request validation helpers
import type { ZodSchema } from 'zod'

export async function validateRequestData<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.issues.map(i => i.message).join(', ')}`)
    }

    return result.data
  } catch (err) {
    throw new Error(`Request validation failed: ${getErrorMessage(err)}`)
  }
}

export function extractPagination(request: NextRequest): {
  page: number
  limit: number
  offset: number
} {
  const {searchParams} = request.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))

  return {
    page,
    limit,
    offset: (page - 1) * limit
  }
}

export function createPaginationMeta(
  total: number,
  page: number,
  limit: number
): {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
} {
  const totalPages = Math.ceil(total / limit)

  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
}

// Search and filter helpers
export function extractSearchParams(request: NextRequest): {
  search?: string
  filters: Record<string, unknown>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
} {
  const {searchParams} = request.nextUrl

  const search = searchParams.get('search') || undefined
  const sortBy = searchParams.get('sortBy') || undefined
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc'

  // Extract filters (any param that starts with 'filter_')
  const filters: Record<string, unknown> = {}
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('filter_')) {
      const filterKey = key.replace('filter_', '')
      filters[filterKey] = value
    }
  }

  return { search, filters, sortBy, sortOrder }
}

// Rate limiting helpers
export function createRateLimitKey(identifier: string, action: string): string {
  return `${identifier}:${action}:${Math.floor(Date.now() / 60000)}` // Per minute
}

// Caching helpers
export function generateETag(data: unknown): string {
  const crypto = require('crypto')
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')
}

export function handleConditionalGET(
  request: NextRequest,
  etag: string,
  lastModified?: string
): NextResponse | null {
  const ifNoneMatch = request.headers.get('if-none-match')
  const ifModifiedSince = request.headers.get('if-modified-since')

  if (ifNoneMatch === etag || (lastModified && ifModifiedSince === lastModified)) {
    return new NextResponse(null, { status: 304 })
  }

  return null
}

// Request logging helpers
export function logAPIRequest(
  request: NextRequest,
  userId?: string,
  additionalData?: unknown
) {
  const url = new URL(request.url)
  const logData = {
    method: request.method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams.entries()),
    userId,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    ...additionalData
  }

  apiLogger.info(logData, 'API Request')
}

export function logAPIResponse(
  request: NextRequest,
  response: NextResponse,
  duration: number,
  userId?: string
) {
  const url = new URL(request.url)
  const logData = {
    method: request.method,
    path: url.pathname,
    status: response.status,
    duration: `${duration}ms`,
    userId,
    size: response.headers.get('content-length')
  }

  if (response.status >= 400) {
    apiLogger.warn(logData, 'API Error Response')
  } else {
    apiLogger.info(logData, 'API Response')
  }
}

// Common API patterns
export function withTiming<T extends any[]>(
  fn: (...args: T) => Promise<NextResponse>,
  logger: (duration: number, ...args: T) => void = () => {}
) {
  return async (...args: T): Promise<NextResponse> => {
    const start = Date.now()
    try {
      const result = await fn(...args)
      const duration = Date.now() - start
      logger(duration, ...args)
      return result
    } catch (err) {
      const duration = Date.now() - start
      logger(duration, ...args)
      throw err
    }
  }
}

// Bulk operation helpers
export function createBulkOperationResult<T>(
  results: Array<{ success: boolean; data?: T; error?: string; id?: string }>
): {
  successful: number
  failed: number
  results: typeof results
} {
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  return {
    successful,
    failed,
    results
  }
}

// File upload helpers
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number // in bytes
    allowedTypes?: string[]
    required?: boolean
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [], required = false } = options

  if (required && !file) {
    return { valid: false, error: 'File is required' }
  }

  if (!file) {
    return { valid: true }
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` }
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` }
  }

  return { valid: true }
}
