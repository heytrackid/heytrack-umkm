
/**
 * Error Handler Types
 * Type definitions for error handling and retry logic
 */

export type AppError = Error & { code?: string; statusCode?: number }

export interface ErrorState {
  error: AppError | null
  isError: boolean
  message: string
}

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  onRetry?: (count: number, error: Error) => void
}
