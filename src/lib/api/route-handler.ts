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
import { apiLogger } from '@/lib/logger'

// ============================================================================
// TYPES
// ============================================================================

export interface ApiResponse<T = unknown > {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode?: number
  timestamp?: string
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface ApiErrorResponse {
  success: boolean
  error: string
  message: string
  statusCode: number
  timestamp: string
  details?: unknown
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
  handler: () => Promise<{ data: T; message?: string }>
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
    apiLogger.error({ error }, 'API Route Handler Error')

    const message = error instanceof Error ? error.message : 'Internal server error'
    const statusCode = 500

    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message,
        statusCode,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
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
  error: Error | string,
  statusCode?: number
): NextResponse<ApiErrorResponse> {
  const message = error instanceof Error ? error.message : error
  const code = statusCode || 500

  return NextResponse.json(
    {
      success: false,
      error: 'ERROR',
      message,
      statusCode: code,
      timestamp: new Date().toISOString(),
    },
    { status: code }
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
    if (error instanceof Error) {
      return errorResponse(error, 500)
    } else {
      return errorResponse('An unknown error occurred', 500)
    }
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
    if (error instanceof Error) {
      return errorResponse(error, 500)
    } else {
      return errorResponse('An unknown error occurred', 500)
    }
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
    if (error instanceof Error) {
      return errorResponse(error, 500)
    } else {
      return errorResponse('An unknown error occurred', 500)
    }
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
    if (error instanceof Error) {
      return errorResponse(error, 500)
    } else {
      return errorResponse('An unknown error occurred', 500)
    }
  }
}
