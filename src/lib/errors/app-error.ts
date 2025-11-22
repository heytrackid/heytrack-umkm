

/**
 * Standardized Application Error Classes
 * This file defines consistent error types for the application
 */

export interface AppErrorOptions {
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly code?: string;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(
    message: string,
    options?: AppErrorOptions
  ) {
    super(message);
    this.name = this.constructor.name;
    if (options?.code) {
      this.code = options.code;
    }
    this.status = options?.status ?? 500;
    if (options?.details) {
      this.details = options.details;
    }
    this.timestamp = new Date().toISOString();
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message, {
      code: 'VALIDATION_ERROR',
      status: 400,
      ...(details && { details })
    });
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, { 
      code: 'AUTH_ERROR', 
      status: 401 
    });
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, { 
      code: 'AUTHORIZATION_ERROR', 
      status: 403 
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, { 
      code: 'NOT_FOUND', 
      status: 404 
    });
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message, {
      code: 'DATABASE_ERROR',
      status: 500,
      ...(details && { details })
    });
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    message: string,
    service: string,
    details?: Record<string, unknown>
  ) {
    super(message, {
      code: `EXTERNAL_SERVICE_ERROR_${service.toUpperCase()}`,
      status: 502,
      ...(details && { details })
    });
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, { 
      code: 'RATE_LIMIT_ERROR', 
      status: 429 
    });
  }
}