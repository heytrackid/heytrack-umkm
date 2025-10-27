/**
 * Validation Module
 * API request validation utilities using Zod
 */

import type { NextResponse } from 'next/server'
import type { z } from 'zod'
import { formatValidationErrors } from '@/lib/validations'
import { apiLogger } from '@/lib/logger'
import type { ValidationResult } from './types'
import { createErrorResponse } from './responses'

/**
 * Validate request data with schema
 */
export function validateRequestData<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (err) {
    const errors = formatValidationErrors(_error)
    return { success: false, errors }
  }
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

    return result.data!
  } catch (err) {
    apiLogger.error({ err }, 'Request validation _error')
    return createErrorResponse('Invalid request body', 400)
  }
}
