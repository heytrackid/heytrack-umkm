'use client'

import { useCallback, useState } from 'react'

import { createClientLogger } from '@/lib/client-logger'

// Simple error message getter
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {return error.message}
  if (typeof error === 'string') {return error}
  return 'An unknown error occurred'
}

const logger = createClientLogger('ErrorHandler')

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

/**
 * Hook untuk handle errors dalam functional components
 * Menyediakan error state dan methods untuk manage errors
 */
export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    message: '',
  })

  const handle = useCallback((error: unknown, context?: string) => {
    const appError = error instanceof Error ? error : new Error(String(error))
    logger.error({ error, context }, `Error in ${context ?? 'component'}`)

    setErrorState({
      error: appError as AppError,
      isError: true,
      message: getErrorMessage(error),
    })

    return appError as AppError
  }, [])

  const reset = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      message: '',
    })
  }, [])

  const throwError = useCallback((error: AppError) => {
    logger.error({ error }, 'Throwing error')
    setErrorState({
      error,
      isError: true,
      message: (error instanceof Error ? error.message : String(error)),
    })
    throw error
  }, [])

  return {
    ...errorState,
    handleError: handle,
    resetError: reset,
    throwError,
  }
}

/**
 * Hook untuk handle async operations dengan error handling dan loading state
 */
export function useAsyncError() {
  const [isLoading, setIsLoading] = useState(false)
  const { error, isError, handleError: handleErr, resetError } = useErrorHandler()

  const executeAsync = useCallback(
    async (asyncFn: () => Promise<void>) => {
      try {
        setIsLoading(true)
        resetError()
        await asyncFn()
      } catch (error) {
        void handleErr(error, 'useAsyncError')
      } finally {
        setIsLoading(false)
      }
    },
    [handleErr, resetError]
  )

  return {
    executeAsync,
    error,
    isError,
    isLoading,
    resetError,
  }
}

// Export other error utilities
export {
  monitoringService,
  captureException,
  captureMessage,
  ErrorMonitoringService
} from './monitoring-service'
