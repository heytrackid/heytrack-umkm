/**
 * API Error Classes
 * Custom error classes for API error handling
 */

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number = 500, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends ApiError {
  errors: Record<string, string[]>

  constructor(message: string = 'Validation failed', errors: Record<string, string[]> = {}) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
    this.errors = errors
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

export class ServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, 'SERVER_ERROR')
    this.name = 'ServerError'
  }
}

// Error handler utility
export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof Error) {
    return new ApiError(error.message)
  }

  return new ApiError('An unknown error occurred')
}

// Export all errors
export const ApiErrors = {
  ApiError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ServerError,
  handleApiError
}

export default ApiErrors
