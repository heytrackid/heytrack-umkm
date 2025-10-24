/**
 * Server-side error handling utilities
 * Provides consistent error response format and logging for API routes
 */

import logger from '@/lib/logger'
import { NextResponse } from 'next/server'
import { ErrorCode, getErrorMessage } from './auth-errors'

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
    error: string
    code?: ErrorCode
    details?: string
    timestamp?: string
}

/**
 * Standard API success response format
 */
export interface ApiSuccessResponse<T = unknown> {
    data: T
    message?: string
    timestamp?: string
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
    error: string | ErrorCode,
    statusCode: number = 500,
    details?: string
): NextResponse<ApiErrorResponse> {
    const errorCode = typeof error === 'string' ? undefined : error
    const errorMessage = typeof error === 'string' ? error : getErrorMessage(error)

    const response: ApiErrorResponse = {
        error: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
    }

    // Only include details in development or for specific error types
    if (details && (process.env.NODE_ENV === 'development' || statusCode === 400)) {
        response.details = details
    }

    // Log error without exposing sensitive data
    logError(errorMessage, statusCode, errorCode, details)

    return NextResponse.json(response, { status: statusCode })
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
    data: T,
    message?: string,
    statusCode: number = 200
): NextResponse<ApiSuccessResponse<T>> {
    const response: ApiSuccessResponse<T> = {
        data,
        timestamp: new Date().toISOString(),
    }

    if (message) {
        response.message = message
    }

    return NextResponse.json(response, { status: statusCode })
}

/**
 * Handle authentication errors
 */
export function handleAuthError(
    error: any,
    context?: string
): NextResponse<ApiErrorResponse> {
    logger.error({ err: error, context }, 'Auth error')

    // Check if it's a Supabase auth error
    if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as { message: string }).message

        // Map common Supabase errors to our error codes
        if (errorMessage.includes('Invalid login credentials')) {
            return createErrorResponse(ErrorCode.INVALID_CREDENTIALS, 401)
        }
        if (errorMessage.includes('Email not confirmed')) {
            return createErrorResponse(ErrorCode.EMAIL_NOT_CONFIRMED, 401)
        }
        if (errorMessage.includes('JWT expired') || errorMessage.includes('Invalid Refresh Token')) {
            return createErrorResponse(ErrorCode.SESSION_EXPIRED, 401)
        }
    }

    return createErrorResponse(ErrorCode.AUTH_ERROR, 401)
}

/**
 * Handle database errors
 */
export function handleDatabaseError(
    error: any,
    context?: string
): NextResponse<ApiErrorResponse> {
    logger.error({ err: error, context }, 'Database error')

    // Don't expose database details to client
    return createErrorResponse(ErrorCode.DATABASE_ERROR, 500)
}

/**
 * Handle validation errors
 */
export function handleValidationError(
    message: string,
    details?: string
): NextResponse<ApiErrorResponse> {
    return createErrorResponse(ErrorCode.VALIDATION_ERROR, 400, details)
}

/**
 * Handle unauthorized access
 */
export function handleUnauthorized(
    message?: string
): NextResponse<ApiErrorResponse> {
    return createErrorResponse(
        message || ErrorCode.UNAUTHORIZED,
        401
    )
}

/**
 * Handle forbidden access
 */
export function handleForbidden(
    message?: string
): NextResponse<ApiErrorResponse> {
    return createErrorResponse(
        message || ErrorCode.FORBIDDEN,
        403
    )
}

/**
 * Handle not found errors
 */
export function handleNotFound(
    resource?: string
): NextResponse<ApiErrorResponse> {
    const message = resource ? `${resource} tidak ditemukan` : getErrorMessage(ErrorCode.NOT_FOUND)
    return createErrorResponse(message, 404)
}

/**
 * Log errors without exposing sensitive information
 */
function logError(
    message: string,
    statusCode: number,
    code?: ErrorCode,
    details?: string
): void {
    const logData = {
        timestamp: new Date().toISOString(),
        message,
        statusCode,
        code,
        // Only log details in development
        ...(process.env.NODE_ENV === 'development' && details ? { details } : {}),
    }

    // In production, you might want to send this to a logging service
    if (statusCode >= 500) {
        logger.error(logData, 'Server Error')
    } else if (statusCode >= 400) {
        logger.warn(logData, 'Client Error')
    }
}

/**
 * Validate user authentication in API routes
 */
export async function validateAuth(
    getUser: () => Promise<{ data: { user: unknown | null }, error: unknown }>
): Promise<{ user: { id: string }, error: null } | { user: null, error: NextResponse<ApiErrorResponse> }> {
    try {
        const { data: { user }, error } = await getUser()

        if (error) {
            return {
                user: null,
                error: handleAuthError(error, 'validateAuth'),
            }
        }

        if (!user) {
            return {
                user: null,
                error: handleUnauthorized(),
            }
        }

        return {
            user: user as { id: string },
            error: null,
        }
    } catch (error) {
        return {
            user: null,
            error: handleAuthError(error, 'validateAuth'),
        }
    }
}

/**
 * Wrap API route handler with error handling
 */
export function withErrorHandling<T>(
    handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiErrorResponse>> {
    return handler().catch((error) => {
        logger.error({ err: error }, 'Unhandled API error')

        // Handle specific error types
        if (error instanceof Error) {
            if (error.message.includes('PGRST')) {
                return handleDatabaseError(error)
            }
            if (error.message.includes('JWT') || error.message.includes('auth')) {
                return handleAuthError(error)
            }
        }

        // Generic error
        return createErrorResponse(ErrorCode.INTERNAL_ERROR, 500)
    })
}

/**
 * HTTP status codes
 */
export const HttpStatus = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
} as const
