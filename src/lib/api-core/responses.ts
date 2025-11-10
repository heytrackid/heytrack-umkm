import { NextResponse } from 'next/server'

import type { ApiSuccessResponse, ApiErrorResponse, PaginatedResponse } from '@/lib/api-core/types'

/**
 * API Response Module
 * Standardized API response utilities
 */


/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message
  })
}

/**
 * Create error response
 */
export function createErrorResponse(
  error: string,
  statusCode = 400,
  errors?: string[]
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      errors
    },
    { status: statusCode }
  )
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  },
  message?: string
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    pagination,
    message
  })
}
