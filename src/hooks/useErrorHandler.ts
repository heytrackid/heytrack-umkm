'use client'

import { useCallback, useState } from 'react'
import { AppError, handleError, logError, getErrorMessage } from '@/lib/errors'

interface ErrorState {
  error: AppError | null
  isError: boolean
  message: string
}

/**
 * Hook for handling errors in functional components
 * 
 * Usage:
 * const { error, handleError: handleErr, resetError } = useErrorHandler()
 * 
 * try {
 *   await someAsyncOperation()
 * } catch (err) {
 *   handleErr(err)
 * }
 */
export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    message: '',
  })

  const handle = useCallback((error: unknown, context?: string) => {
    const appError = handleError(error)
    logError(error, context)

    setErrorState({
      error: appError,
      isError: true,
      message: getErrorMessage(error),
    })

    return appError
  }, [])

  const reset = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      message: '',
    })
  }, [])

  const throwError = useCallback((error: AppError) => {
    setErrorState({
      error,
      isError: true,
      message: error.message,
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
 * Hook for handling async operation errors
 * 
 * Usage:
 * const { executeAsync, error, isLoading } = useAsyncError()
 * 
 * const handleSubmit = async () => {
 *   await executeAsync(async () => {
 *     await someAsyncOperation()
 *   })
 * }
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
      } catch (err) {
        handleErr(err, 'useAsyncError')
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

/**
 * Hook for form error handling
 * Tracks errors by field
 * 
 * Usage:
 * const { fieldErrors, setFieldError, clearFieldError } = useFormErrors()
 */
export function useFormErrors() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors((prev) => ({
      ...prev,
      [field]: message,
    }))
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setFieldErrors({})
  }, [])

  const hasErrors = Object.keys(fieldErrors).length > 0

  return {
    fieldErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasErrors,
  }
}

/**
 * Hook for retry logic with exponential backoff
 * 
 * Usage:
 * const { retry, isRetrying, retryCount } = useRetry()
 * 
 * const handleRetry = async () => {
 *   await retry(async () => {
 *     await riskyOperation()
 *   })
 * }
 */
export function useRetry(maxRetries = 3, initialDelay = 1000) {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const { handleError } = useErrorHandler()

  const retry = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      onRetry?: (count: number, error: Error) => void
    ): Promise<T | null> => {
      let lastError: Error | null = null

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          setIsRetrying(attempt > 0)
          const result = await asyncFn()
          setRetryCount(0)
          setIsRetrying(false)
          return result
        } catch (error) {
          lastError = error as Error
          
          if (attempt < maxRetries) {
            const delay = initialDelay * Math.pow(2, attempt)
            onRetry?.(attempt + 1, lastError)
            
            await new Promise((resolve) => setTimeout(resolve, delay))
            setRetryCount(attempt + 1)
          }
        }
      }

      // All retries failed
      if (lastError) {
        handleError(lastError, `useRetry: Failed after ${maxRetries} retries`)
      }

      setIsRetrying(false)
      return null
    },
    [maxRetries, initialDelay, handleError]
  )

  const reset = useCallback(() => {
    setRetryCount(0)
    setIsRetrying(false)
  }, [])

  return {
    retry,
    retryCount,
    isRetrying,
    reset,
  }
}
