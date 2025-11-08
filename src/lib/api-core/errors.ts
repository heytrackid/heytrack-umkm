import { NextResponse } from 'next/server'

import type { APIError } from './types'

/**
 * Error Handling Module
 * API error handling and response utilities
 */


/**
 * Handle API errors and convert to standardized format
 */
export function handleAPIError(error: unknown): APIError {
  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      details: error.stack as Record<string, unknown> | undefined
    }
  }

  if (typeof error === 'string') {
    return {
      message: error,
      statusCode: 500,
      code: 'UNKNOWN_ERROR'
    }
  }

  return {
    message: 'An unexpected error occurred',
    statusCode: 500,
    code: 'UNKNOWN_ERROR',
    details: error as Record<string, unknown> | undefined
  }
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
