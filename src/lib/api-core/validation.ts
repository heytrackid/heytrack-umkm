import type { NextRequest, NextResponse } from 'next/server'
import type { z } from 'zod'
import { formatValidationErrors } from '@/lib/validations'
import { apiLogger } from '@/lib/logger'
import type { ValidationResult } from './types'
import { createErrorResponse } from './responses'

/**
 * Validation Module
 * API request validation utilities using Zod
 */


/**
 * Validate request data with schema
 */
export function validateRequestData<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errors = formatValidationErrors(result.error.issues)
  return { success: false, errors }
}

/**
 * Validate request and return data or error response
 */
export async function validateRequestOrRespond<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T | NextResponse> {
  try {
    const body = await request.json()
    const result = validateRequestData(body, schema)

    if (!result.success) {
      return createErrorResponse('Validation failed', 400, result.errors)
    }

    if (!result.data) {
      return createErrorResponse('Validation failed: no data', 400)
    }

    return result.data
  } catch (err) {
    apiLogger.error({ err }, 'Request validation error')
    return createErrorResponse('Invalid request body', 400)
  }
}
