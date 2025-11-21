import { NextResponse } from 'next/server';

import type { ApiErrorResponse, ApiSuccessResponse, PaginatedResponse } from '@/lib/api-core/types';

/**
 * API Response Module
 * Standardized API response utilities
 */


/**
 * Create success response with optional metadata and custom status
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  pagination?: { total: number; page: number; limit: number; pages: number; hasNext: boolean; hasPrev: boolean },
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  const response: Record<string, unknown> = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }
  
  if (message) response['message'] = message
  if (pagination) response['pagination'] = pagination
  
  return NextResponse.json(response as unknown as ApiSuccessResponse<T>, { status })
}

/**
 * Create error response with optional validation errors
 * Supports both string and object error formats
 */
export function createErrorResponse(
  error: string | Record<string, unknown>,
  statusCode = 400,
  errors?: string[] | undefined
): NextResponse<ApiErrorResponse> {
  const errorMessage = typeof error === 'string' ? error : (error['error'] as string) || 'An error occurred'
  const errorDetails = typeof error === 'object' ? error : undefined
  
  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
      ...(errorDetails && { details: errorDetails }),
      ...(errors && { errors }),
      timestamp: new Date().toISOString()
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
    message,
    timestamp: new Date().toISOString()
  })
}
