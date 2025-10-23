/**
 * Standardized API Route Handler
 * Provides unified pattern for handling API routes with consistent error handling, validation, and responses
 * 
 * Usage:
 * export async function GET(request: NextRequest) {
 *   return createRouteHandler(async () => {
 *     // Your logic here
 *     return { data: result }
 *   })
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { AppError, handleError, getErrorMessage, logError } from '@/lib/errors'

// ============================================================================
// TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
  path?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  message?: string
  statusCode: number
  timestamp: string
  path?: string
  details?: Record<string, any>
}

export interface ValidationResult {
  isValid: boolean
  errors?: Record<string, string>
}

// ============================================================================
// ROUTE HANDLER FACTORY
// ============================================================================

/**
 * Create a standardized API route handler
 * Handles errors, validation, and response formatting
 */
export async function createRouteHandler<T>(
  handler: () => Promise<{ data: T; message?: string }>,
  options?: {
    validateRequest?: (req: any) => ValidationResult
    requireAuth?: boolean
    allowedMethods?: string[]
  }
): Promise<NextResponse<ApiResponse<T> | ApiErrorResponse>> {
  try {
    const result = await handler()

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: result.message || 'Success',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    const appError = handleError(error)
    logError(error, 'API Route Handler')

    return NextResponse.json(
      {
        success: false,
        error: appError.code,
        message: appError.message,
        statusCode: appError.statusCode,
        timestamp: new Date().toISOString(),
        details: appError.details,
      },
      { status: appError.statusCode }
    )
  }
}

// ============================================================================
// REQUEST VALIDATORS
// ============================================================================

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: any,
  requiredFields: string[]
): ValidationResult {
  const errors: Record<string, string> = {}

  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      errors[field] = `${field} is required`
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  }
}

/**
 * Validate request method
 */
export function validateMethod(
  method: string,
  allowed: string[]
): ValidationResult {
  if (!allowed.includes(method)) {
    return {
      isValid: false,
      errors: {
        method: `Method ${method} not allowed. Allowed: ${allowed.join(', ')}`,
      },
    }
  }

  return { isValid: true }
}

/**
 * Validate request has authorization header
 */
export function validateAuth(request: NextRequest): ValidationResult {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader) {
    return {
      isValid: false,
      errors: { auth: 'Missing authorization header' },
    }
  }

  return { isValid: true }
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

/**
 * Create success response
 */
export function successResponse<T>(
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  )
}

/**
 * Create error response
 */
export function errorResponse(
  error: AppError | Error | string,
  statusCode?: number
): NextResponse<ApiErrorResponse> {
  const appError = error instanceof AppError ? error : handleError(error)

  return NextResponse.json(
    {
      success: false,
      error: appError.code || 'UNKNOWN_ERROR',
      message: appError.message,
      statusCode: statusCode || appError.statusCode,
      timestamp: new Date().toISOString(),
      details: appError.details,
    },
    { status: statusCode || appError.statusCode }
  )
}

/**
 * Create validation error response
 */
export function validationErrorResponse(
  errors: Record<string, string>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      statusCode: 400,
      timestamp: new Date().toISOString(),
      details: errors,
    },
    { status: 400 }
  )
}

/**
 * Create paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
  statusCode: number = 200
): NextResponse {
  const totalPages = Math.ceil(total / pageSize)

  return NextResponse.json(
    {
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  )
}

// ============================================================================
// MIDDLEWARE & DECORATORS
// ============================================================================

/**
 * Middleware to add CORS headers
 */
export function withCORS(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

/**
 * Middleware to add caching headers
 */
export function withCache(response: NextResponse, maxAge: number = 3600): NextResponse {
  response.headers.set('Cache-Control', `public, max-age=${maxAge}`)
  return response
}

/**
 * Middleware to add rate limit headers
 */
export function withRateLimit(
  response: NextResponse,
  limit: number = 100,
  window: number = 60
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Window', window.toString())
  return response
}

// ============================================================================
// COMMON PATTERNS
// ============================================================================

/**
 * Standard GET handler with validation
 */
export async function handleGET<T>(
  request: NextRequest,
  handler: (params: Record<string, string>) => Promise<T>
): Promise<NextResponse> {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries())
    const data = await handler(params)

    return successResponse(data)
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * Standard POST handler with validation
 */
export async function handlePOST<T>(
  request: NextRequest,
  handler: (body: any) => Promise<T>,
  requiredFields?: string[]
): Promise<NextResponse> {
  try {
    const body = await request.json()

    // Validate required fields
    if (requiredFields) {
      const validation = validateRequiredFields(body, requiredFields)
      if (!validation.isValid) {
        return validationErrorResponse(validation.errors || {})
      }
    }

    const data = await handler(body)
    return successResponse(data, 'Created', 201)
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * Standard PUT handler with validation
 */
export async function handlePUT<T>(
  request: NextRequest,
  handler: (id: string, body: any) => Promise<T>,
  requiredFields?: string[]
): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl
    const id = searchParams.get('id')

    if (!id) {
      return validationErrorResponse({ id: 'ID is required' })
    }

    const body = await request.json()

    // Validate required fields
    if (requiredFields) {
      const validation = validateRequiredFields(body, requiredFields)
      if (!validation.isValid) {
        return validationErrorResponse(validation.errors || {})
      }
    }

    const data = await handler(id, body)
    return successResponse(data, 'Updated')
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * Standard DELETE handler
 */
export async function handleDELETE<T>(
  request: NextRequest,
  handler: (id: string) => Promise<T>
): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl
    const id = searchParams.get('id')

    if (!id) {
      return validationErrorResponse({ id: 'ID is required' })
    }

    const data = await handler(id)
    return successResponse(data, 'Deleted')
  } catch (error) {
    return errorResponse(error)
  }
}
