'use client'

import { useCallback, useState } from 'react'
import { useErrorHandler } from './useErrorHandler'

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
        void setIsLoading(true)
        resetError()
        await asyncFn()
      } catch (_err) {
        void handleErr(err, 'useAsyncError')
      } finally {
        void setIsLoading(false)
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
