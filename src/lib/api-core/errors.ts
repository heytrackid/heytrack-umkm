// @ts-nocheck - API type constraints
/**
 * Error Handling Module
 * API error handling and response utilities
 */

import { NextResponse } from 'next/server'
import type { APIError } from './types'

/**
 * Handle API errors and convert to standardized format
 */
export function handleAPIError(error: unknown): APIError {
  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      details: error.stack
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
    details: error
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
      code: error.code
    },
    { status: error.statusCode }
  )
}
