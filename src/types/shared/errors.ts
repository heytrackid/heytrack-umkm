

/**
 * Error Types
 * Provides type-safe error classes and error handling utilities
 */

/**
 * Base typed error class
 */
export class TypedError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly statusCode = 500,
        public readonly details?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'TypedError';

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TypedError);
        }
    }

    /**
     * Convert error to API error format
     */
    toApiError() {
        return {
            code: this.code,
            message: this.message,
            details: this.details,
        };
    }
}

/**
 * Validation error - for invalid input data
 */
export class ValidationError extends TypedError {
    constructor(message: string, details?: Record<string, unknown>) {
        super(message, 'VALIDATION_ERROR', 400, details);
        this.name = 'ValidationError';
    }
}

/**
 * Not found error - for missing resources
 */
export class NotFoundError extends TypedError {
    constructor(resource: string, id?: string) {
        const message = id
            ? `${resource} with id '${id}' not found`
            : `${resource} not found`;
        super(message, 'NOT_FOUND', 404);
        this.name = 'NotFoundError';
    }
}

/**
 * Authentication error - for auth failures
 */
export class AuthenticationError extends TypedError {
    constructor(message = 'Authentication required') {
        super(message, 'AUTHENTICATION_ERROR', 401);
        this.name = 'AuthenticationError';
    }
}

/**
 * Authorization error - for permission failures
 */
export class AuthorizationError extends TypedError {
    constructor(message = 'Insufficient permissions') {
        super(message, 'AUTHORIZATION_ERROR', 403);
        this.name = 'AuthorizationError';
    }
}

/**
 * Conflict error - for duplicate or conflicting data
 */
export class ConflictError extends TypedError {
    constructor(message: string, details?: Record<string, unknown>) {
        super(message, 'CONFLICT_ERROR', 409, details);
        this.name = 'ConflictError';
    }
}

/**
 * Database error - for database operation failures
 */
export class DatabaseError extends TypedError {
    constructor(message: string, details?: Record<string, unknown>) {
        super(message, 'DATABASE_ERROR', 500, details);
        this.name = 'DatabaseError';
    }
}

/**
 * External service error - for third-party service failures
 */
export class ExternalServiceError extends TypedError {
    constructor(service: string, message?: string) {
        super(
            message || `External service '${service}' failed`,
            'EXTERNAL_SERVICE_ERROR',
            502,
            { service }
        );
        this.name = 'ExternalServiceError';
    }
}

/**
 * Rate limit error - for rate limiting
 */
export class RateLimitError extends TypedError {
    constructor(retryAfter?: number) {
        super(
            'Rate limit exceeded',
            'RATE_LIMIT_ERROR',
            429,
            retryAfter ? { retryAfter } : undefined
        );
        this.name = 'RateLimitError';
    }
}

/**
 * Type guard for TypedError
 */
export function isTypedError(error: unknown): error is TypedError {
    return error instanceof TypedError;
}

/**
 * Type guard for ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
}

/**
 * Type guard for NotFoundError
 */
export function isNotFoundError(error: unknown): error is NotFoundError {
    return error instanceof NotFoundError;
}

/**
 * Type guard for AuthenticationError
 */
export function isAuthenticationError(error: unknown): error is AuthenticationError {
    return error instanceof AuthenticationError;
}

/**
 * Type guard for AuthorizationError
 */
export function isAuthorizationError(error: unknown): error is AuthorizationError {
    return error instanceof AuthorizationError;
}

/**
 * Error handler utility - converts any error to ApiError format
 */
export function handleError(error: unknown) {
    if (isTypedError(error)) {
        return {
            code: error.code,
            message: (error instanceof Error ? error.message : String(error)),
            details: error.details,
            statusCode: error.statusCode,
        };
    }

    if (error instanceof Error) {
        return {
            code: 'INTERNAL_ERROR',
            message: (error instanceof Error ? error.message : String(error)),
            statusCode: 500,
        };
    }

    return {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
        statusCode: 500,
    };
}

/**
 * Safe error message extractor
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return 'An unknown error occurred';
}

/**
 * Safe error code extractor
 */
export function getErrorCode(error: unknown): string {
    if (isTypedError(error)) {
        return error.code;
    }

    return 'UNKNOWN_ERROR';
}
