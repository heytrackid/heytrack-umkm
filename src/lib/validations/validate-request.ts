/**
 * Request Validation Helper
 * 
 * Utility functions to validate API requests with Zod schemas
 * Provides consistent error handling and type safety
 */

import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: ValidationError }

/**
 * Validation error type
 */
export interface ValidationError {
  message: string
  errors: Array<{
    field: string
    message: string
  }>
}

/**
 * Validate request body with Zod schema
 * 
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validation result with data or error
 * 
 * @example
 * ```typescript
 * const result = await validateRequest(request, CreateIngredientSchema)
 * if (!result.success) {
 *   return NextResponse.json(result.error, { status: 400 })
 * }
 * const data = result.data
 * ```
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: {
          message: 'Validation failed',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
      }
    }
    
    // Handle JSON parse errors
    return {
      success: false,
      error: {
        message: 'Invalid JSON in request body',
        errors: [],
      },
    }
  }
}

/**
 * Validate request body and return NextResponse on error
 * 
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validated data or NextResponse with error
 * 
 * @example
 * ```typescript
 * const data = await validateRequestOrRespond(request, CreateIngredientSchema)
 * if (data instanceof NextResponse) {
 *   return data // Return error response
 * }
 * // Use validated data
 * ```
 */
export async function validateRequestOrRespond<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T | NextResponse> {
  const result = await validateRequest(request, schema)
  
  if (!result.success) {
    return NextResponse.json(
      {
        error: result.error.message,
        details: result.error.errors,
      },
      { status: 400 }
    )
  }
  
  return result.data
}

/**
 * Validate query parameters with Zod schema
 * 
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validation result with data or error
 * 
 * @example
 * ```typescript
 * const QuerySchema = z.object({
 *   page: z.coerce.number().int().positive().default(1),
 *   limit: z.coerce.number().int().positive().max(100).default(10),
 * })
 * 
 * const result = validateQueryParams(request, QuerySchema)
 * if (!result.success) {
 *   return NextResponse.json(result.error, { status: 400 })
 * }
 * ```
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const data = schema.parse(params)
    return { success: true, data }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: {
          message: 'Invalid query parameters',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
      }
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to parse query parameters',
        errors: [],
      },
    }
  }
}

/**
 * Validate path parameters with Zod schema
 * 
 * @param params - Path parameters object
 * @param schema - Zod schema to validate against
 * @returns Validation result with data or error
 * 
 * @example
 * ```typescript
 * const ParamsSchema = z.object({
 *   id: z.string().uuid(),
 * })
 * 
 * const result = validatePathParams(params, ParamsSchema)
 * if (!result.success) {
 *   return NextResponse.json(result.error, { status: 400 })
 * }
 * ```
 */
export function validatePathParams<T>(
  params: Record<string, string | string[]>,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  try {
    const data = schema.parse(params)
    return { success: true, data }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: {
          message: 'Invalid path parameters',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
      }
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to parse path parameters',
        errors: [],
      },
    }
  }
}

/**
 * Create a validation error response
 * 
 * @param message - Error message
 * @param errors - Array of field errors
 * @returns NextResponse with validation error
 */
export function validationErrorResponse(
  message: string,
  errors: Array<{ field: string; message: string }> = []
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      details: errors,
    },
    { status: 400 }
  )
}

/**
 * Safe parse with default value
 * 
 * @param schema - Zod schema
 * @param data - Data to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed data or default value
 */
export function safeParseWithDefault<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  defaultValue: T
): T {
  const result = schema.safeParse(data)
  return result.success ? result.data : defaultValue
}
