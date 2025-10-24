/**
 * Centralized error handling for the application
 */

import logger from '@/lib/logger'

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'DATABASE_ERROR'
  | 'AUTH_ERROR'
  | 'UNKNOWN_ERROR'

export interface ErrorDetails {
  code: ErrorCode
  message: string
  statusCode: number
  details?: Record<string, unknown>
  timestamp?: string
}

/**
 * Main error class for application-wide error handling
 * @example
 * throw new AppError('VALIDATION_ERROR', 'Invalid email format', 400)
 */
export class AppError extends Error implements ErrorDetails {
  code: ErrorCode
  message: string
  statusCode: number
  details?: Record<string, unknown>
  timestamp: string

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.message = message
    this.statusCode = statusCode
    this.details = details
    this.timestamp = new Date().toISOString()
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
    }
  }
}

/**
 * Validation error for invalid input
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details)
    this.name = 'ValidationError'
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} dengan ID ${id} tidak ditemukan` : `${resource} tidak ditemukan`
    super('NOT_FOUND', message, 404)
    this.name = 'NotFoundError'
  }
}

/**
 * Unauthorized error (not authenticated)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Anda harus login terlebih dahulu') {
    super('UNAUTHORIZED', message, 401)
    this.name = 'UnauthorizedError'
  }
}

/**
 * Forbidden error (authenticated but no permission)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Anda tidak memiliki akses ke resource ini') {
    super('FORBIDDEN', message, 403)
    this.name = 'ForbiddenError'
  }
}

/**
 * Conflict error (resource already exists)
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('CONFLICT', message, 409, details)
    this.name = 'ConflictError'
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('DATABASE_ERROR', message, 500, details)
    this.name = 'DatabaseError'
  }
}

/**
 * Auth error
 */
export class AuthError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('AUTH_ERROR', message, 401, details)
    this.name = 'AuthError'
  }
}

/**
 * Network error
 */
export class NetworkError extends AppError {
  constructor(message: string = 'Gagal terhubung ke server') {
    super('NETWORK_ERROR', message, 503)
    this.name = 'NetworkError'
  }
}

/**
 * Handle and normalize errors
 * @param error - Error to handle
 * @returns Normalized AppError
 */
export function handleError(error: any): AppError {
  // If already AppError, return as is
  if (error instanceof AppError) {
    return error
  }

  // Handle Supabase errors
  if (error?.message?.includes('JWT')) {
    return new AuthError('Sesi telah berakhir, silakan login kembali')
  }

  if (error?.message?.includes('duplicate')) {
    return new ConflictError('Data sudah ada')
  }

  if (error?.status === 404) {
    return new NotFoundError('Resource')
  }

  // Handle network errors
  if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
    return new NetworkError()
  }

  // Handle generic errors
  const message = error?.message || 'Terjadi kesalahan yang tidak terduga'
  return new AppError('UNKNOWN_ERROR', message, 500)
}

/**
 * Get user-friendly error message
 * @param error - Error to get message from
 * @returns User-friendly message
 */
export function getErrorMessage(error: any): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error?.message) {
    return error.message
  }

  return 'Terjadi kesalahan yang tidak terduga'
}

/**
 * Log error for monitoring/debugging
 * @param error - Error to log
 * @param context - Additional context
 */
export function logError(error: any, context?: string) {
  const normalizedError = handleError(error)

  if (typeof window === 'undefined') {
    // Server-side logging
    logger.error({ err: normalizedError, context }, 'Server error')
  } else {
    // Client-side logging (could send to monitoring service)
    logger.error({ context, message: normalizedError.message }, 'Client error')
  }
}
