import { apiLogger } from '@/lib/logger'
/**
 * Centralized Error Handling Utility
 *
 * This module provides consistent error handling across the application
 * with console logging for debugging and development.
 */

export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug'

export interface ErrorContext {
  user?: {
    id?: string
    email?: string
    username?: string
  }
  tags?: Record<string, string>
  extra?: Record<string, unknown>
  level?: ErrorSeverity
}

/**
 * Capture and log error to console
 */
export function captureError(
  error: Error | string,
  context?: ErrorContext
): void {
  const errorObj = error instanceof Error ? error : new Error(error)
  const timestamp = new Date().toISOString()

  apiLogger.error({ message: `[${timestamp}] Error captured:`, error: {
    message: errorObj.message,
    stack: errorObj.stack,
    name: errorObj.name,
  },
  context,
  level: context?.level || 'error',
}, 'Console error replaced with logger')
}

/**
 * Capture message (non-error) to console
 */
export function captureMessage(
  message: string,
  level: ErrorSeverity = 'info',
  context?: ErrorContext
): void {
  const timestamp = new Date().toISOString()

  // apiLogger.info(`[${timestamp}] [${level.toUpperCase()}]`, message, context)
}

/**
 * Set user context for error tracking (no-op without Sentry)
 */
export function setUser(user: {
  id?: string
  email?: string
  username?: string
} | null): void {
  // User context not available without Sentry
  // apiLogger.info({ params: user }, 'User context set:')
}

/**
 * Add breadcrumb for debugging (logs to console)
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  data?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString()

  // apiLogger.info(`[${timestamp}] Breadcrumb:`, {
  //   message,
  //   category: category || 'app',
  //   data,
  // })
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandler<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error: unknown) {
      captureError(error as Error, context)
      throw error
    }
  }) as T
}

/**
 * API Error Handler - Use in API routes
 */
export function handleApiError(
  error: any,
  context?: ErrorContext
): { error: string; statusCode: number } {
  const errorMessage =
    error instanceof Error ? error.message : 'An unexpected error occurred'

  // Log to console
  captureError(error instanceof Error ? error : new Error(errorMessage), {
    ...context,
    tags: {
      ...context?.tags,
      errorType: 'api_error',
    },
  })

  // Determine status code
  let statusCode = 500

  if (error instanceof Error) {
    if (error.message.includes('not found')) statusCode = 404
    if (error.message.includes('unauthorized')) statusCode = 401
    if (error.message.includes('forbidden')) statusCode = 403
    if (error.message.includes('validation')) statusCode = 400
  }

  return {
    error: errorMessage,
    statusCode,
  }
}

/**
 * Performance monitoring - track slow operations
 */
export async function trackPerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  threshold: number = 1000 // ms
): Promise<T> {
  const startTime = Date.now()

  try {
    const result = await fn()
    const duration = Date.now() - startTime

    if (duration > threshold) {
      captureMessage(
        `Slow operation detected: ${operation}`,
        'warning',
        {
          extra: {
            duration,
            threshold,
            operation,
          },
          tags: {
            performance: 'slow',
          },
        }
      )
    }

    return result
  } catch (error: unknown) {
    const duration = Date.now() - startTime
    captureError(error as Error, {
      extra: {
        duration,
        operation,
      },
      tags: {
        performance: 'failed',
      },
    })
    throw error
  }
}
