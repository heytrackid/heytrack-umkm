import type { NextRequest, NextResponse } from 'next/server'

/**
 * API Core Module Types
 * Centralized type definitions for API core functionality
 */


// ==========================================================
// CACHE TYPES
// ==========================================================

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export interface CacheConfig {
  defaultTTL: number
  maxSize: number
}

// ==========================================================
// RESPONSE TYPES
// ==========================================================

export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  errors?: string[] | undefined
  code?: string | undefined
}

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ==========================================================
// VALIDATION TYPES
// ==========================================================

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: string[]
}

// ==========================================================
// PAGINATION TYPES
// ==========================================================

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginationState {
  page: number
  limit: number
  offset: number
  total: number
  pages: number
}

/**
 * Standard pagination metadata for API responses
 */
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

// ==========================================================
// MIDDLEWARE TYPES
// ==========================================================

export interface MiddlewareOptions {
  requireAuth?: boolean
  requireAdmin?: boolean
  rateLimit?: {
    windowMs: number
    maxRequests: number
  }
  cors?: boolean
}

// ==========================================================
// ERROR TYPES
// ==========================================================

export interface APIError {
  message: string
  statusCode: number
  code?: string
  details?: Record<string, unknown>
}

// ==========================================================
// ROUTE HANDLER TYPES
// ==========================================================

export interface RouteHandlerConfig {
  validation?: {
    body?: unknown // z.ZodSchema
    query?: unknown // z.ZodSchema
    params?: unknown // z.ZodSchema
  }
  middleware?: Array<(request: NextRequest) => NextResponse | Promise<NextResponse | void> | void>
  pagination?: boolean
  caching?: {
    key: string
    ttl?: number
  }
}

// ==========================================================
// UTILITY TYPES
// ==========================================================

export interface RouteHandlerContext<T = unknown> {
  request: NextRequest
  validatedData?: T
  pagination?: PaginationState
  user?: { id: string; email?: string; role?: string }
}
