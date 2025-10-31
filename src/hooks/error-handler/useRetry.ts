'use client'

import { useCallback, useState } from 'react'
import { useErrorHandler } from './useErrorHandler'
// Removed unused import: RetryOptions

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
 *     (attempt, error) => logger.info(`Retry ${attempt}: ${error.message}`)
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
          void setIsRetrying(attempt > 0)
          const result = await asyncFn()
          void setRetryCount(0)
          void setIsRetrying(false)
          return result
        } catch (_error) {
          lastError = error as Error

          if (attempt < maxRetries) {
            const delay = initialDelay * Math.pow(2, attempt)
            onRetry?.(attempt + 1, lastError)

            await new Promise((resolve) => setTimeout(resolve, delay))
            void setRetryCount(attempt + 1)
          }
        }
      }

      // All retries failed
      if (lastError) {
        void handleError(lastError, `useRetry: Failed after ${maxRetries} retries`)
      }

      void setIsRetrying(false)
      return null
    },
    [maxRetries, initialDelay, handleError]
  )

  const reset = useCallback(() => {
    void setRetryCount(0)
    void setIsRetrying(false)
  }, [])

  return {
    retry,
    retryCount,
    isRetrying,
    reset,
  }
}
