import { NextResponse } from 'next/server'

import type { APIError } from '@/lib/api-core/types'

/**
 * Error Handling Module
 * API error handling and response utilities
 */


/**
 * Handle API errors and convert to standardized format
 */
export function handleAPIError(error: unknown): APIError {
  if (error instanceof Error) {
    const result: APIError = {
      message: error.message,
      statusCode: 500,
      code: 'INTERNAL_ERROR',
    }
    if (error.stack) {
      result.details = { stack: error.stack }
    }
    return result
  }

  if (typeof error === 'string') {
    return {
      message: error,
      statusCode: 500,
      code: 'UNKNOWN_ERROR'
    }
  }

  // Handle Supabase/Postgres error objects
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const err = error as { message: string; code?: string; details?: string; hint?: string }
    return {
      message: err.message,
      statusCode: 500,
      code: err.code || 'DATABASE_ERROR',
      details: {
        details: err.details,
        hint: err.hint,
        ...((error as Record<string, unknown>) || {})
      }
    }
  }

  const result: APIError = {
    message: 'An unexpected error occurred',
    statusCode: 500,
    code: 'UNKNOWN_ERROR',
  }
  if (error) {
    result.details = error as Record<string, unknown>
  }
  return result
}

/**
 * Create NextResponse from API error
 */
export function createAPIErrorResponse(error: APIError): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: error.message,
      code: error['code']
    },
    { status: error['statusCode'] }
  )
}
