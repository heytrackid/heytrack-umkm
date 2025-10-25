'use client'

import { useCallback, useState } from 'react'
import { getErrorMessage } from '@/lib/type-guards'

import { apiLogger } from '@/lib/logger'

type AppError = Error & { code?: string; statusCode?: number }

interface ErrorState {
  error: AppError | null
  isError: boolean
  message: string
}

/**
 * Hook untuk handle errors dalam functional components
 * Menyediakan error state dan methods untuk manage errors
 * 
 * @returns {Object} Error state dan methods
 * @returns {AppError|null} error - Current error object
 * @returns {boolean} isError - Whether there's an error
 * @returns {string} message - User-friendly error message
 * @returns {Function} handleError - Set error from thrown exception
 * @returns {Function} resetError - Clear current error
 * @returns {Function} throwError - Throw AppError
 * 
 * @example
 * const { error, handleError, resetError } = useErrorHandler()
 * 
 * try {
 *   await someAsyncOperation()
 * } catch (err) {
 *   handleError(err, 'MyComponent.operation')
 * }
 * 
 * if (isError) {
 *   return <ErrorDisplay message={message} onRetry={resetError} />
 * }
 */
export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    message: '',
  })

  const handle = useCallback((error: any, context?: string) => {
    const appError = error instanceof Error ? error : new Error(String(error))
    apiLogger.error({ error, context }, `Error in ${context || 'component'}`)

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
    apiLogger.error({ error }, 'Throwing error')
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
 * Automatically manages error state dan loading indicators
 * 
 * @returns {Object} Async execution controls
 * @returns {Function} executeAsync - Run async function with error handling
 * @returns {AppError|null} error - Current error if any
 * @returns {boolean} isError - Whether there's an error
 * @returns {boolean} isLoading - Whether operation is in progress
 * @returns {Function} resetError - Clear error state
 * 
 * @example
 * const { executeAsync, isLoading, error } = useAsyncError()
 * 
 * const handleSubmit = async () => {
 *   await executeAsync(async () => {
 *     await createUser(formData)
 *   })
 * }
 * 
 * return (
 *   <button disabled={isLoading}>
 *     {isLoading ? 'Loading...' : 'Submit'}
 *   </button>
 * )
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
 * Hook untuk handle form validation errors per field
 * Ideal untuk forms dengan multiple fields dan individual error messages
 * 
 * @returns {Object} Form error management
 * @returns {Record<string, string>} fieldErrors - Map of field errors
 * @returns {Function} setFieldError - Set error for specific field
 * @returns {Function} clearFieldError - Clear error for specific field
 * @returns {Function} clearAllErrors - Clear all errors
 * @returns {boolean} hasErrors - Whether there are any errors
 * 
 * @example
 * const { fieldErrors, setFieldError, hasErrors } = useFormErrors()
 * 
 * if (!email) setFieldError('email', 'Email is required')
 * if (password.length < 8) setFieldError('password', 'Min 8 chars')
 * 
 * return (
 *   <>
 *     <input onChange={() => clearFieldError('email')} />
 *     {fieldErrors.email && <span>{fieldErrors.email}</span>}
 *     <button disabled={hasErrors}>Submit</button>
 *   </>
 * )
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
 * Hook untuk implement retry logic dengan exponential backoff
 * Automatically retries failed async operations dengan increasing delays
 * 
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} initialDelay - Initial delay in ms (default: 1000)
 * 
 * @returns {Object} Retry utilities
 * @returns {Function} retry - Execute function with retry logic
 * @returns {number} retryCount - Current retry count
 * @returns {boolean} isRetrying - Whether currently retrying
 * @returns {Function} reset - Reset retry state
 * 
 * @example
 * const { retry, isRetrying, retryCount } = useRetry(3, 1000)
 * 
 * const handleFetch = async () => {
 *   const result = await retry(
 *     async () => await fetchUnreliableAPI(),
 *     (attempt, error) => apiLogger.info(`Retry ${attempt}: ${error.message}`)
 *   )
 * }
 * 
 * return (
 *   <div>
 *     {isRetrying && <p>Retrying... {retryCount}</p>}
 *     <button onClick={handleFetch}>Fetch</button>
 *   </div>
 * )
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
