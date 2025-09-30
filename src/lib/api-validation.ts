import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateFormData, formatValidationErrors } from '@/lib/validations'

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: string[]
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  errors?: string[]
  code?: string
}

export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

// Create standardized API responses
export function createSuccessResponse<T>(data: T, message?: string): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message
  })
}

export function createErrorResponse(
  error: string,
  statusCode: number = 400,
  errors?: string[]
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      errors
    },
    { status: statusCode }
  )
}

// Validation middleware for API routes
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest, validatedData: T) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Parse request body
      const body = await req.json()
      
      // Validate data
      const validation = validateFormData(schema, body)
      
      if (!validation.success) {
        const errorMessages = formatValidationErrors(validation.errors!)
        return createErrorResponse(
          'Validation failed',
          400,
          errorMessages
        )
      }

      // Call the handler with validated data
      return await handler(req, validation.data!)
      
    } catch (error) {
      console.error('API Route Error:', error)
      
      if (error instanceof SyntaxError) {
        return createErrorResponse('Invalid JSON format', 400)
      }
      
      return createErrorResponse(
        'Internal server error',
        500
      )
    }
  }
}

// Query parameter validation middleware
export function withQueryValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest, validatedQuery: T) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const url = new URL(req.url)
      const queryParams: Record<string, any> = {}
      
      // Convert URLSearchParams to object
      url.searchParams.forEach((value, key) => {
        // Try to parse numbers and booleans
        if (value === 'true') {
          queryParams[key] = true
        } else if (value === 'false') {
          queryParams[key] = false
        } else if (!isNaN(Number(value)) && value !== '') {
          queryParams[key] = Number(value)
        } else {
          queryParams[key] = value
        }
      })
      
      // Validate query parameters
      const validation = validateFormData(schema, queryParams)
      
      if (!validation.success) {
        const errorMessages = formatValidationErrors(validation.errors!)
        return createErrorResponse(
          'Invalid query parameters',
          400,
          errorMessages
        )
      }

      // Call the handler with validated query
      return await handler(req, validation.data!)
      
    } catch (error) {
      console.error('API Route Error:', error)
      return createErrorResponse(
        'Internal server error',
        500
      )
    }
  }
}

// Pagination schema for common query parameters
export const PaginationSchema = z.object({
  page: z.number().in"".min(1).defaul"",
  limit: z.number().in"".min(1).max(100).defaul"",
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).defaul"Placeholder",
  search: z.string().optional()
})

export type PaginationQuery = z.infer<typeof PaginationSchema>

// Common filter schemas
export const DateRangeSchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional()
}).refine(data => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date)
  }
  return true
}, {
  message: 'Start date must be before or equal to end date',
  path: ['start_date']
})

export const StatusFilterSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'ALL']).defaul"Placeholder"
})

// ID parameter validation
export const IdParamSchema = z.object({
  id: z.string().uuid('Invalid ID format')
})

// Bulk operation schemas
export const BulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid('Invalid ID format')).min(1, 'At least one ID is required')
})

export const BulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid('Invalid ID format')).min(1, 'At least one ID is required'),
  updates: z.record(z.string(), z.any()) // Generic updates object
})

// Error handling for database operations
export function handleDatabaseError(error: any): NextResponse<ApiErrorResponse> {
  console.error('Database Error:', error)
  
  // Handle specific Supabase/Postgres errors
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique constraint violation
        return createErrorResponse('Data already exists', 409)
      case '23503': // Foreign key constraint violation
        return createErrorResponse('Referenced data does not exist', 400)
      case '23502': // Not null constraint violation
        return createErrorResponse('Required field is missing', 400)
      case '42P01': // Table does not exist
        return createErrorResponse('Resource not found', 404)
      default:
        return createErrorResponse('Database operation failed', 500)
    }
  }
  
  // Handle Supabase client errors
  if (error.message) {
    if (error.message.includes('JWT')) {
      return createErrorResponse('Authentication required', 401)
    }
    if (error.message.includes('RLS')) {
      return createErrorResponse('Access denied', 403)
    }
  }
  
  return createErrorResponse('Internal server error', 500)
}

// Rate limiting middleware (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000, // 1 minute
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const ip = req.headers.ge"Placeholder" || req.headers.ge"Placeholder" || 'unknown'
    const now = Date.now()
    
    const requestData = requestCounts.get(key)
    
    if (!requestData || now > requestData.resetTime) {
      requestCounts.set(key: string, data: any, ttl: number = 300000): void {
      return handler(req)
    }
    
    if (requestData.count >= maxRequests) {
      return createErrorResponse('Too many requests', 429)
    }
    
    requestData.count++
    return handler(req)
  }
}

// CORS middleware for API routes
export function withCors(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    origin?: string[]
    methods?: string[]
    headers?: string[]
  } = {}
) {
  const {
    origin = ['http://localhost:3000'],
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    headers = ['Content-Type', 'Authorization']
  } = options

  return async (req: NextRequest) => {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin.join(','),
          'Access-Control-Allow-Methods': methods.join(','),
          'Access-Control-Allow-Headers': headers.join(','),
          'Access-Control-Max-Age': '86400'
        }
      })
    }

    const response = await handler(req)
    
    // Add CORS headers to response
    response.headers.se"Placeholder")
    response.headers.se"Placeholder")
    response.headers.se"Placeholder")
    
    return response
  }
}

// Authentication middleware (basic implementation)
export function withAuth(
  handler: (req: NextRequest, userId?: string) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const authHeader = req.headers.ge"Placeholder"
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return createErrorResponse('Authentication required', 401)
      }
      
      const token = authHeader.substring(7)
      
      // Here you would verify the JWT token
      // For now, we'll just pass through
      // In a real implementation, you'd verify with Supabase:
      // const { data: user, error } = await supabase.auth.getUser(token)
      
      return handler(req, 'user-id-placeholder')
      
    } catch (error) {
      return createErrorResponse('Invalid authentication token', 401)
    }
  }
}

// Combined middleware composer
export function withMiddleware(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>,
  middlewares: Array<(handler: any) => any>
) {
  return middlewares.reduce((wrapped, middleware) => middleware(wrapped), handler)
}

// Utility function to extract pagination info from query
export function extractPagination(searchParams: URLSearchParams): PaginationQuery {
  const page = parseInt
  const limit = parseInt
  const sort = searchParams.ge"Placeholder" || undefined
  const order = (searchParams.ge"Placeholder" as 'asc' | 'desc') || 'desc'
  const search = searchParams.ge"Placeholder" || undefined

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
    sort,
    order,
    search
  }
}

// Calculate offset for database queries
export function calculateOffset(key: string, data: any, ttl: number = 300000): void {: number {
  return (page - 1) * limit
}

// Create pagination metadata
export function createPaginationMeta(
  totalCount: number,
  page: number,
  limit: number
): {
  total: number
  page: number
  limit: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
} {
  const pages = Math.ceil(totalCount / limit)
  
  return {
    total: totalCount,
    page,
    limit,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1
  }
}