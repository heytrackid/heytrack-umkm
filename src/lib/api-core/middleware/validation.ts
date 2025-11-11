import { createErrorResponse } from '@/lib/api-core/responses'
import { validateRequestData } from '@/lib/api-core/validation'

import type { NextRequest, NextResponse } from 'next/server'
import type { z } from 'zod'

/**
 * Validation Middleware Module
 * Request validation middleware using Zod schemas
 */


/**
 * Create validation middleware for request body
 */
export function withValidation<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<NextResponse | T> => {
    try {
      const body = await request.json()
      const result = validateRequestData(body, schema)

      if (!result.success) {
        return createErrorResponse('Validation failed', 400, result.errors)
      }

      if (!result['data']) {
        return createErrorResponse('Validation failed: no data', 400)
      }

      return result['data']
    } catch {
      return createErrorResponse('Invalid request body', 400)
    }
  }
}

/**
 * Create validation middleware for query parameters
 */
export function withQueryValidation<T>(schema: z.ZodSchema<T>) {
  return (request: NextRequest): NextResponse | T => {
    const { searchParams } = new URL(request.url)
    const queryData = Object.fromEntries(searchParams.entries())

    const result = validateRequestData(queryData, schema)
    if (!result.success) {
      return createErrorResponse('Query validation failed', 400, result.errors)
    }

    if (!result['data']) {
      return createErrorResponse('Query validation failed: no data', 400)
    }

    return result['data']
  }
}
