/**
 * Centralized Error Handling Utility
 * 
 * This module provides consistent error handling across the application
 * with Sentry integration for production error tracking.
 */

import * as Sentry from '@sentry/nextjs'

export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug'

export interface ErrorContext {
  user?: {
    id?: string
    email?: string
    username?: string
  }
  tags?: Record<string, string>
  extra?: Record<string, any>
  level?: ErrorSeverity
}

/**
 * Capture and log error to Sentry
 */
export function captureError(
  error: Error | string,
  context?: ErrorContext
): string | undefined {
  // Always log to console
  console.error('Error captured:', error, context)

  // Only send to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    return Sentry.captureException(error, {
      level: context?.level || 'error',
      user: context?.user,
      tags: context?.tags,
      extra: context?.extra,
    })
  }

  return undefined
}

/**
 * Capture message (non-error) to Sentry
 */
export function captureMessage(
  message: string,
  level: ErrorSeverity = 'info',
  context?: ErrorContext
): string | undefined {
  console.log(`[${level.toUpperCase()}]`, message, context)

  if (process.env.NODE_ENV === 'production') {
    return Sentry.captureMessage(message, {
      level,
      user: context?.user,
      tags: context?.tags,
      extra: context?.extra,
    })
  }

  return undefined
}

/**
 * Set user context for error tracking
 */
export function setUser(user: {
  id?: string
  email?: string
  username?: string
} | null): void {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser(user)
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  data?: Record<string, any>
): void {
  if (process.env.NODE_ENV === 'production') {
    Sentry.addBreadcrumb({
      message,
      category: category || 'app',
      data,
      level: 'info',
      timestamp: Date.now() / 1000,
    })
  }
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error: any) {
      captureError(error as Error, context)
      throw error
    }
  }) as T
}

/**
 * API Error Handler - Use in API routes
 */
export function handleApiError(
  error: unknown,
  context?: ErrorContext
): { error: string; statusCode: number } {
  const errorMessage =
    error instanceof Error ? error.message : 'An unexpected error occurred'

  // Capture to Sentry
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
  } catch (error: any) {
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
