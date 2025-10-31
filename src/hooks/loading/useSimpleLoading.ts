'use client'

import { useCallback, useState } from 'react'

/**
 * Hook sederhana untuk single loading state
 *
 * @param initialValue - Initial loading value
 * @returns Array dengan [isLoading, setLoading, withLoading]
 */
export function useSimpleLoading(initialValue = false) {
  const [isLoading, setIsLoading] = useState(initialValue)

  const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      void setIsLoading(true)
      return await fn()
    } finally {
      void setIsLoading(false)
    }
  }, [])

  return [isLoading, setIsLoading, withLoading] as const
}
