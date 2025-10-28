/**
 * API Error Handler
 * Centralized error handling for API routes
 */

import { NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'
import { PostgrestError } from '@supabase/supabase-js'

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'APIError'
  }
}

/**
 * Handle API errors consistently
 */
export function handleAPIError(error: unknown): NextResponse {
  // Handle APIError
  if (error instanceof APIError) {
    apiLogger.error(
      {
        error: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      },
      'API Error'
    )

    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    )
  }

  // Handle Supabase/Postgrest errors
  if (isPostgrestError(error)) {
    const statusCode = getPostgrestStatusCode(error)
    
    apiLogger.error(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      },
      'Database Error'
    )

    return NextResponse.json(
      {
        error: getUserFriendlyMessage(error),
        code: error.code,
      },
      { status: statusCode }
    )
  }

  // Handle standard Error
  if (error instanceof Error) {
    apiLogger.error(
      {
        error: error.message,
        stack: error.stack,
      },
      'Unexpected Error'
    )

    return NextResponse.json(
      {
        error: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : error.message,
      },
      { status: 500 }
    )
  }

  // Handle unknown errors
  apiLogger.error({ error }, 'Unknown Error')

  return NextResponse.json(
    {
      error: 'Internal server error',
    },
    { status: 500 }
  )
}

/**
 * Type guard for Postgrest errors
 */
function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  )
}

/**
 * Get HTTP status code from Postgrest error
 */
function getPostgrestStatusCode(error: PostgrestError): number {
  // Map common Postgrest error codes to HTTP status codes
  const errorCodeMap: Record<string, number> = {
    '23505': 409, // unique_violation
    '23503': 409, // foreign_key_violation
    '23502': 400, // not_null_violation
    '23514': 400, // check_violation
    '42501': 403, // insufficient_privilege
    'PGRST116': 404, // not found
    'PGRST301': 400, // invalid request
  }

  return errorCodeMap[error.code] || 500
}

/**
 * Get user-friendly error message
 */
function getUserFriendlyMessage(error: PostgrestError): string {
  const messageMap: Record<string, string> = {
    '23505': 'Data sudah ada. Silakan gunakan data yang berbeda.',
    '23503': 'Data terkait tidak ditemukan.',
    '23502': 'Data wajib tidak boleh kosong.',
    '23514': 'Data tidak valid.',
    '42501': 'Anda tidak memiliki akses untuk melakukan tindakan ini.',
    'PGRST116': 'Data tidak ditemukan.',
    'PGRST301': 'Permintaan tidak valid.',
  }

  return messageMap[error.code] || error.message
}

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, unknown>,
  fields: string[]
): void {
  const missing = fields.filter(field => !data[field])
  
  if (missing.length > 0) {
    throw new APIError(
      `Missing required fields: ${missing.join(', ')}`,
      400,
      'VALIDATION_ERROR',
      { missing }
    )
  }
}

/**
 * Validate UUID format
 */
export function validateUUID(id: string, fieldName: string = 'id'): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  
  if (!uuidRegex.test(id)) {
    throw new APIError(
      `Invalid ${fieldName} format`,
      400,
      'VALIDATION_ERROR'
    )
  }
}
