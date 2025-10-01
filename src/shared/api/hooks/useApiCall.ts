/**
 * useApiCall Hook
 * Hook for making API calls with loading and error states
 */

import { useState, useCallback } from 'react'

interface UseApiCallOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  immediate?: boolean
}

interface UseApiCallReturn<T, P extends any[]> {
  data: T | null
  error: Error | null
  loading: boolean
  execute: (...args: P) => Promise<T | null>
  reset: () => void
}

export function useApiCall<T, P extends any[] = []>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiCallOptions<T> = {}
): UseApiCallReturn<T, P> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      setLoading(true)
      setError(null)

      try {
        const result = await apiFunction(...args)
        setData(result)
        options.onSuccess?.(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred')
        setError(error)
        options.onError?.(error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [apiFunction, options]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, error, loading, execute, reset }
}

export default useApiCall
