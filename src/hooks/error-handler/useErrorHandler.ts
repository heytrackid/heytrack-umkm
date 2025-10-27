'use client'

import { useCallback, useState } from 'react'
import { getErrorMessage } from '@/lib/type-guards'
import { logger } from '@/lib/logger'
import type { AppError, ErrorState } from './types'

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
    logger.error(`Error in ${context || 'component'}`, { error, context })

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
    logger.error('Throwing error', { error })
    setErrorState({
      error,
      isError: true,
      message: (error instanceof Error ? error.message : String(error)),
    })
    throw err
  }, [])

  return {
    ...errorState,
    handleError: handle,
    resetError: reset,
    throwError,
  }
}
