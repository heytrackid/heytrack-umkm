// @ts-nocheck
/**
 * Centralized Error Handling Utilities
 * Provides consistent error handling across the application
 */

import { NextResponse } from 'next/server';
import { apiLogger } from '../logger';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  ExternalServiceError,
  RateLimitError,
} from './app-error';

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: unknown,
  context?: string
): NextResponse {
  // Log the error with context
  apiLogger.error({
    error,
    context,
    timestamp: new Date().toISOString()
  }, 'Application Error');

  // Handle different error types
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        status: error.status,
        details: error.details,
        timestamp: error.timestamp,
      },
      { status: error.status }
    );
  }

  // Handle Zod validation errors
  if (isZodError(error)) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        status: 400,
        details: error.issues?.map((issue: any) => ({
          field: issue.path?.join('.'),
          message: issue.message,
        })),
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  // Handle Supabase errors
  if (isSupabaseError(error)) {
    const supabaseError = error as any; // Supabase error type
    return NextResponse.json(
      {
        error: supabaseError.message || 'Database error occurred',
        code: 'DATABASE_ERROR',
        status: supabaseError.status || 500,
        details: {
          hint: supabaseError.hint,
          details: supabaseError.details,
        },
        timestamp: new Date().toISOString(),
      },
      { status: supabaseError.status || 500 }
    );
  }

  // Handle regular Error objects
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message,
        code: 'INTERNAL_ERROR',
        status: 500,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  // Handle other types of errors
  return NextResponse.json(
    {
      error: 'An unknown error occurred',
      code: 'UNKNOWN_ERROR',
      status: 500,
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

/**
 * Type guard to check if an error is a Zod error
 */
function isZodError(error: unknown): error is { issues: Array<{ path: string[]; message: string }> } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'issues' in error &&
    Array.isArray((error as any).issues)
  );
}

/**
 * Type guard to check if an error is a Supabase error
 */
function isSupabaseError(error: unknown): error is any {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

/**
 * Type guard to check if a value is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if a value is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Type guard to check if a value is an AuthenticationError
 */
export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

/**
 * Type guard to check if a value is an AuthorizationError
 */
export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

/**
 * Type guard to check if a value is a NotFoundError
 */
export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

/**
 * Type guard to check if a value is a DatabaseError
 */
export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError;
}

/**
 * Safely execute an async function with error handling
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  errorContext?: string
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await fn();
    return { data };
  } catch (error) {
    const appError = convertToAppError(error, errorContext);
    return { error: appError };
  }
}

/**
 * Convert any error to an AppError
 */
export function convertToAppError(error: unknown, context?: string): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      error.message,
      {
        code: 'INTERNAL_ERROR',
        status: 500,
        details: context ? { context } : undefined,
      }
    );
  }

  return new AppError(
    String(error),
    {
      code: 'INTERNAL_ERROR',
      status: 500,
      details: context ? { context, originalError: error } : undefined,
    }
  );
}

/**
 * Log an error with additional context
 */
export function logError(error: unknown, context?: string): void {
  if (error instanceof AppError) {
    apiLogger.error({
      error: error.message,
      code: error.code,
      status: error.status,
      details: error.details,
      timestamp: error.timestamp,
      context,
    });
  } else if (error instanceof Error) {
    apiLogger.error({
      error: error.message,
      stack: error.stack,
      context,
    });
  } else {
    apiLogger.error({
      error,
      context,
    });
  }
}

/**
 * Handle API route errors consistently
 */
export async function handleAPIRouteError(
  fn: () => Promise<NextResponse>,
  context?: string
): Promise<NextResponse> {
  try {
    return await fn();
  } catch (error) {
    return createErrorResponse(error, context);
  }
}