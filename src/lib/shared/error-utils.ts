import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/shared'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('ClientFile')


/**
 * Shared Error Handling Utilities
 * Consistent error handling patterns across the application
 */


// Error types
export interface AppError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: Date
}

export interface ValidationError {
  field: string
  message: string
}

export interface APIError {
  status: number
  message: string
  details?: Record<string, unknown>
}

// Error creation utilities
export function createAppError(code: string, message: string, details?: Record<string, unknown>): AppError {
  return {
    code,
    message,
    details,
    timestamp: new Date()
  }
}

export function createValidationError(field: string, message: string): ValidationError {
  return { field, message }
}

export function createAPIError(status: number, message: string, details?: Record<string, unknown>): APIError {
  return { status, message, details }
}

// Error handling hooks
export function useErrorHandler() {
  const { toast } = useToast()

  const handleError = (error: unknown, context?: string) => {
    const message = getErrorMessage(error)
    const title = context ? `${context} Error` : 'Error'

    logger.error({ error }, `${context ?? 'App'} Error`)

    toast({
      title,
      description: message,
      variant: 'destructive'
    })

    return message
  }

  const handleAsyncError = async <T,>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn()
    } catch (err) {
      void handleError(err, context)
      return null
    }
  }

  return { handleError, handleAsyncError }
}

// API error handling
 
export function handleAPIResponse<T>(
  response: { data?: T; error?: unknown },
  successMessage?: string,
  errorContext?: string
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { toast } = useToast()

  if (response.error) {
    const message = getErrorMessage(response.error)

    toast({
      title: errorContext ?? 'API Error',
      description: message,
      variant: 'destructive'
    })

    throw new Error(message)
  }

  if (successMessage) {
    toast({
      title: 'Success',
      description: successMessage
    })
  }

  return response.data
}

// Form error handling
export function formatFormErrors(errors: Record<string, unknown>): string[] {
  return Object.entries(errors).map(([field, error]) => {
    const message = typeof error === 'string' ? error : (error as { message?: string })?.message ?? 'Invalid value'
    return `${field}: ${message}`
  })
}

// Error boundary helpers
export function logErrorToService(error: Error, context?: unknown) {
  // In a real app, send to error monitoring service like Sentry
  logger.error({
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server'
  }, 'Error logged to service')
}

// Retry utilities
export function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let retries = 0

    const attempt = () => {
      fn()
        .then(resolve)
        .catch((error) => {
          if (retries < maxRetries) {
            retries++
            void setTimeout(attempt, delay * retries)
          } else {
            reject(error)
          }
        })
    }

    attempt()
  })
}

// Error recovery strategies
export function createErrorRecovery<T>(
  primaryFn: () => Promise<T>,
  fallbackFn?: () => Promise<T>,
  errorHandler?: (error: Error) => void
) {
  return async (): Promise<T> => {
    try {
      return await primaryFn()
    } catch (err) {
      errorHandler?.(err as Error)

      if (fallbackFn) {
        return fallbackFn()
      }

      throw err
    }
  }
}

// Common error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network connection failed. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access to this resource is forbidden.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'A server error occurred. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNKNOWN: 'An unexpected error occurred. Please try again.'
} as const

// Error classification
export function classifyError(error: unknown): keyof typeof ERROR_MESSAGES {
  if (typeof error === 'string') {
    if (error.includes('network') || error.includes('fetch')) {return 'NETWORK'}
    if (error.includes('timeout')) {return 'TIMEOUT'}
  }

  if (error instanceof Error) {
    if (error.message.includes('401')) {return 'UNAUTHORIZED'}
    if (error.message.includes('403')) {return 'FORBIDDEN'}
    if (error.message.includes('404')) {return 'NOT_FOUND'}
    if (error.message.includes('500')) {return 'SERVER_ERROR'}
  }

  return 'UNKNOWN'
}

// User-friendly error messages
export function getUserFriendlyErrorMessage(error: unknown): string {
  const errorType = classifyError(error)
  return ERROR_MESSAGES[errorType]
}
