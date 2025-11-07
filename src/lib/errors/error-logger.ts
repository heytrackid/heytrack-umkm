import { apiLogger, dbLogger, uiLogger } from '../logger';


/**
 * Enhanced Error Logging Utilities
 * Provides structured logging for different types of errors
 */


interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  url?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface ErrorLog {
  message: string;
  stack?: string;
  context: ErrorContext;
  timestamp: string;
  level: 'error' | 'info' | 'warn';
  type: string;
}

/**
 * Enhanced error logger with context
 */
export class EnhancedErrorLogger {
  /**
   * Log an API error with additional context
   */
  static logApiError(
    error: unknown,
    context?: ErrorContext,
    additionalData?: Record<string, unknown>
  ): void {
    const log: ErrorLog = {
      message: this.getErrorMessage(error),
      stack: this.getErrorStack(error),
      context: context ?? {},
      timestamp: new Date().toISOString(),
      level: 'error',
      type: this.getErrorType(error),
      ...additionalData,
    };

    apiLogger.error(log, 'API Error');
  }

  /**
   * Log a database error with additional context
   */
  static logDatabaseError(
    error: unknown,
    context?: ErrorContext,
    additionalData?: Record<string, unknown>
  ): void {
    const log: ErrorLog = {
      message: this.getErrorMessage(error),
      stack: this.getErrorStack(error),
      context: context ?? {},
      timestamp: new Date().toISOString(),
      level: 'error',
      type: this.getErrorType(error),
      ...additionalData,
    };

    dbLogger.error(log, 'Database Error');
  }

  /**
   * Log a UI error with additional context
   */
  static logUiError(
    error: unknown,
    context?: ErrorContext,
    additionalData?: Record<string, unknown>
  ): void {
    const log: ErrorLog = {
      message: this.getErrorMessage(error),
      stack: this.getErrorStack(error),
      context: context ?? {},
      timestamp: new Date().toISOString(),
      level: 'error',
      type: this.getErrorType(error),
      ...additionalData,
    };

    uiLogger.error(log, 'UI Error');
  }

  /**
   * Extract error message from unknown error
   */
  private static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Unknown error';
  }

  /**
   * Extract error stack from unknown error
   */
  private static getErrorStack(error: unknown): string | undefined {
    if (error instanceof Error) {
      return error.stack;
    }
    return undefined;
  }

  /**
   * Determine error type from unknown error
   */
  private static getErrorType(error: unknown): string {
    if (error instanceof Error) {
      return error.constructor.name;
    }
    if (typeof error === 'string') {
      return 'StringError';
    }
    return 'UnknownType';
  }

  /**
   * Create error context from request
   */
  static createContextFromRequest(request: Request): ErrorContext {
    const url = new URL(request.url);
    return {
      url: url.toString(),
      userAgent: request['headers'].get('user-agent') ?? undefined,
      ipAddress: request['headers'].get('x-forwarded-for')?.split(',')[0] ?? 
                 request['headers'].get('x-real-ip') ?? 
                 undefined,
    };
  }

  /**
   * Log error with additional context and return a tracking ID
   */
  static logErrorWithContext(
    error: unknown,
    context: ErrorContext,
    logger: typeof apiLogger | typeof dbLogger | typeof uiLogger = apiLogger
  ): string {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const log = {
      errorId,
      message: this.getErrorMessage(error),
      stack: this.getErrorStack(error),
      context,
      timestamp: new Date().toISOString(),
      type: this.getErrorType(error),
    };

    logger.error(log, 'Application Error');

    return errorId;
  }

  /**
   * Log a warning with context
   */
  static logWarning(
    message: string,
    context?: ErrorContext,
    additionalData?: Record<string, unknown>
  ): void {
    const log: ErrorLog = {
      message,
      context: context ?? {},
      timestamp: new Date().toISOString(),
      level: 'warn',
      type: 'Warning',
      ...additionalData,
    };

    apiLogger.warn(log, 'Application Warning');
  }

  /**
   * Log an informational message with context
   */
  static logInfo(
    message: string,
    context?: ErrorContext,
    additionalData?: Record<string, unknown>
  ): void {
    const log: ErrorLog = {
      message,
      context: context ?? {},
      timestamp: new Date().toISOString(),
      level: 'info',
      type: 'Info',
      ...additionalData,
    };

    apiLogger.info(log, 'Application Info');
  }
}

/**
 * Convenience functions for different loggers
 */
export const {logApiError} = EnhancedErrorLogger;
export const {logDatabaseError} = EnhancedErrorLogger;
export const {logUiError} = EnhancedErrorLogger;
export const {logErrorWithContext} = EnhancedErrorLogger;
export const {logWarning} = EnhancedErrorLogger;
export const {logInfo} = EnhancedErrorLogger;
export const {createContextFromRequest} = EnhancedErrorLogger;