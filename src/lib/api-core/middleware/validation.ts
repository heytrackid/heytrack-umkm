/**
 * Validation Middleware Module
 * Request validation middleware using Zod schemas
 */

import type { NextRequest, NextResponse } from 'next/server'
import type { z } from 'zod'
import { validateRequestData } from '@/lib/api-core/validation'
import { createErrorResponse } from '@/lib/api-core/responses'

/**
 * Create validation middleware for request body
 */
export function withValidation<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<T | NextResponse> => {
    try {
      const body = await request.json()
      const result = validateRequestData(body, schema)

      if (!result.success) {
        return createErrorResponse('Validation failed', 400, result.errors)
      }

      return result.data!
    } catch (err) {
      return createErrorResponse('Invalid request body', 400)
    }
  }
}

/**
 * Create validation middleware for query parameters
 */
export function withQueryValidation<T>(schema: z.ZodSchema<T>) {
  return (request: NextRequest): T | NextResponse => {
    const { searchParams } = new URL(request.url)
    const queryData = Object.fromEntries(searchParams.entries())

    const result = validateRequestData(queryData, schema)
    if (!result.success) {
      return createErrorResponse('Query validation failed', 400, result.errors)
    }

    return result.data!
  }
}
