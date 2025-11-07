/**
 * API Route Helpers
 * Reusable utilities for API routes to reduce code duplication
 * and ensure consistency across all endpoints
 */

import { createErrorResponse } from '@/lib/api-core'
import { apiLogger } from '@/lib/logger'

import type { Database } from '@/types/database'

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Authentication Error
 * Thrown when authentication fails
 */
export class AuthenticationError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

/**
 * Require User Authentication
 * Validates user session and returns authenticated user
 * Throws AuthenticationError if validation fails
 * 
 * @example
 * const user = await requireAuth(supabase)
 * // user is guaranteed to exist here
 */
export async function requireAuth(supabase: SupabaseClient<Database>) {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    apiLogger.error({ error }, 'Authentication error')
    throw new AuthenticationError('Authentication failed')
  }
  
  if (!user) {
    apiLogger.warn('No user found in session')
    throw new AuthenticationError('Unauthorized')
  }
  
  return user
}

/**
 * Require User Authentication (Response Version)
 * Returns error response instead of throwing
 * Useful when you want to return immediately
 * 
 * @example
 * const authResult = await requireAuthResponse(supabase)
 * if ('error' in authResult) return authResult
 * const user = authResult
 */
export async function requireAuthResponse(supabase: SupabaseClient<Database>) {
  try {
    return await requireAuth(supabase)
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return createErrorResponse(error.message, 401)
    }
    return createErrorResponse('Authentication failed', 401)
  }
}

/**
 * Generate Request ID for tracing
 * Creates a unique identifier for each API request
 * 
 * @example
 * const requestId = generateRequestId()
 * apiLogger.info({ requestId }, 'Request started')
 */
export function generateRequestId(): string {
  // Use crypto.randomUUID() for better uniqueness
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback for older environments
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Safe Parse Number from Query Parameter
 * Returns default value if parsing fails
 * 
 * @example
 * const page = safeParseNumber(searchParams.get('page'), 1)
 */
export function safeParseNumber(value: string | null, defaultValue: number): number {
  if (!value) {
    return defaultValue
  }
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Safe Parse Boolean from Query Parameter
 * Returns default value if parsing fails
 * 
 * @example
 * const isActive = safeParseBoolean(searchParams.get('is_active'), true)
 */
export function safeParseBoolean(value: string | null, defaultValue: boolean): boolean {
  if (!value) {
    return defaultValue
  }
  return value === 'true' || value === '1'
}

/**
 * Validate UUID Format
 * Quick check before database query
 * 
 * @example
 * if (!isValidUUIDFormat(id)) {
 *   return createErrorResponse('Invalid ID format', 400)
 * }
 */
export function isValidUUIDFormat(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Extract Pagination Parameters
 * Standardized pagination parameter extraction
 * 
 * @example
 * const { page, limit, offset } = extractPaginationParams(searchParams)
 */
export function extractPaginationParams(searchParams: URLSearchParams) {
  const page = safeParseNumber(searchParams.get('page'), 1)
  const limit = Math.min(safeParseNumber(searchParams.get('limit'), 10), 100) // Max 100
  const offset = (page - 1) * limit
  
  return { page, limit, offset }
}

/**
 * Create Pagination Metadata
 * Consistent pagination response format
 * 
 * @example
 * const pagination = createPaginationMetadata(count, page, limit)
 */
export function createPaginationMetadata(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit)
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

/**
 * Log API Request Start
 * Standardized request logging with request ID
 * 
 * @example
 * const requestId = logRequestStart(request, 'GET /api/ingredients')
 */
export function logRequestStart(request: Request, endpoint: string): string {
  const requestId = generateRequestId()
  const { searchParams } = new URL(request.url)
  
  apiLogger.info({
    requestId,
    endpoint,
    method: request.method,
    params: Object.fromEntries(searchParams.entries()),
  }, 'API request started')
  
  return requestId
}

/**
 * Log API Request End
 * Standardized request completion logging
 * 
 * @example
 * logRequestEnd(requestId, 'GET /api/ingredients', 200, startTime)
 */
export function logRequestEnd(
  requestId: string,
  endpoint: string,
  statusCode: number,
  startTime: number
): void {
  const duration = Date.now() - startTime
  
  apiLogger.info({
    requestId,
    endpoint,
    statusCode,
    duration,
  }, 'API request completed')
}

/**
 * Check Resource Ownership
 * Verify that a resource belongs to the authenticated user
 * 
 * @example
 * const ingredient = await checkResourceOwnership(
 *   supabase,
 *   'ingredients',
 *   id,
 *   userId,
 *   'Ingredient not found'
 * )
 */
export async function checkResourceOwnership<T extends { user_id: string }>(
  supabase: SupabaseClient<Database>,
  table: string,
  resourceId: string,
  userId: string,
  errorMessage = 'Resource not found'
): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', resourceId)
    .eq('user_id', userId)
    .single()
  
  if (error || !data) {
    throw new Error(errorMessage)
  }
  
  return data as T
}
