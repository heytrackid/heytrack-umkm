import { NextResponse } from 'next/server'
import { apiLogger } from '../logger'
import {

  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  ExternalServiceError,
  RateLimitError
} from './app-error'

/**
 * Centralized Error Response Handler for API Routes
 * Provides consistent error responses across all API endpoints
 */

// Export AppError as APIError for backward compatibility
export { AppError as APIError } from './app-error';
export type { AppError };

interface ErrorResponse {
  error: string;
  code?: string;
  status: number;
  details?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Centralized error response handler
 */
export function handleAPIError(error: unknown, context?: string): NextResponse {
  // Log the error with context
  apiLogger.error({
    error,
    context,
    timestamp: new Date().toISOString()
  }, 'API Error Handler');

  // Handle AppError instances
  if (error instanceof AppError) {
    const errorResponse: ErrorResponse = {
      error: error.message,
      code: error.code,
      status: error.status,
      details: error.details,
      timestamp: error.timestamp,
    };

    return NextResponse.json(errorResponse, { status: error.status });
  }

  // Handle Zod validation errors
  if (isZodError(error)) {
    const zodError = error as { issues: Array<{ path: Array<string | number>; message: string }> };
    const errorResponse: ErrorResponse = {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      status: 400,
      details: {
        issues: zodError.issues?.map((issue) => ({
          path: issue.path?.join('.'),
          message: issue.message,
        })),
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 400 });
  }

  // Handle Supabase errors
  if (isSupabaseError(error)) {
    const supabaseError = error as {
      message?: string;
      status?: number;
      code?: string;
      hint?: string;
      details?: string;
    };
    const errorResponse: ErrorResponse = {
      error: supabaseError.message ?? 'Database error occurred',
      code: 'DATABASE_ERROR',
      status: supabaseError.status ?? 500,
      details: {
        code: supabaseError.code,
        hint: supabaseError.hint,
        details: supabaseError.details,
      },
      timestamp: new Date().toISOString(),
    };

    // Map specific Supabase error codes to appropriate HTTP status codes
    let status = supabaseError.status ?? 500;
    if (supabaseError.code === '23505') {status = 409;} // Unique violation
    if (supabaseError.code === '23503') {status = 400;} // Foreign key violation
    if (supabaseError.code === '23502') {status = 400;} // Not null violation

    return NextResponse.json(errorResponse, { status });
  }

  // Handle regular Error objects
  if (error instanceof Error) {
    const errorResponse: ErrorResponse = {
      error: error.message,
      code: 'INTERNAL_ERROR',
      status: 500,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }

  // Handle other types of errors
  const errorResponse: ErrorResponse = {
    error: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    status: 500,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(errorResponse, { status: 500 });
}

/**
 * Type guard to check if an error is a Zod error
 */
function isZodError(error: unknown): error is { issues: Array<{ path: string[]; message: string }> } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'issues' in error &&
    Array.isArray((error as { issues: unknown[] }).issues)
  );
}

/**
 * Type guard to check if an error is a Supabase error
 */
function isSupabaseError(error: unknown): error is {
  message?: string;
  status?: number;
  code?: string;
  hint?: string;
  details?: string;
} {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    (typeof (error as { message: unknown }).message === 'string' || typeof (error as { message: unknown }).message === 'undefined')
  );
}

/**
 * Create a standardized error response for validation failures
 */
export function createValidationError(
  message: string, 
  details?: Record<string, unknown>,
  context?: string
): NextResponse {
  const validationError = new ValidationError(message, details);
  return handleAPIError(validationError, context);
}

/**
 * Create a standardized error response for authentication failures
 */
export function createAuthError(
  message?: string,
  context?: string
): NextResponse {
  const authError = new AuthenticationError(message);
  return handleAPIError(authError, context);
}

/**
 * Create a standardized error response for authorization failures
 */
export function createAuthorizationError(
  message?: string,
  context?: string
): NextResponse {
  const authError = new AuthorizationError(message);
  return handleAPIError(authError, context);
}

/**
 * Create a standardized error response for not found errors
 */
export function createNotFoundError(
  message?: string,
  context?: string
): NextResponse {
  const notFoundError = new NotFoundError(message);
  return handleAPIError(notFoundError, context);
}

/**
 * Create a standardized error response for database errors
 */
export function createDatabaseError(
  message: string,
  details?: Record<string, unknown>,
  context?: string
): NextResponse {
  const dbError = new DatabaseError(message, details);
  return handleAPIError(dbError, context);
}

/**
 * Create a standardized error response for external service errors
 */
export function createExternalServiceError(
  message: string,
  service: string,
  details?: Record<string, unknown>,
  context?: string
): NextResponse {
  const serviceError = new ExternalServiceError(message, service, details);
  return handleAPIError(serviceError, context);
}

/**
 * Create a standardized error response for rate limit errors
 */
export function createRateLimitError(
  message?: string,
  context?: string
): NextResponse {
  const rateLimitError = new RateLimitError(message);
  return handleAPIError(rateLimitError, context);
}

/**
 * Wrap an API route handler with centralized error handling
 */
export function withAPIErrorHandler<T extends Record<string, unknown>>(
  handler: (req: Request, ctx: T) => Promise<NextResponse>,
  context?: string
) {
  return async (req: Request, ctx: T): Promise<NextResponse> => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      return handleAPIError(error, context ?? `API Route: ${req.url}`);
    }
  };
}
