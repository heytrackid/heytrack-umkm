'use client'

import { useCallback, useState } from 'react'
import type { UseMinimumLoadingReturn } from './types'

/**
 * Hook untuk mengelola loading dengan timeout
 * Berguna untuk skeleton yang perlu tampil minimal beberapa saat
 *
 * @param minDuration - Minimum duration skeleton should be shown (in ms)
 * @returns Object dengan loading states dan methods
 */
export function useMinimumLoading(minDuration = 500): UseMinimumLoadingReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setStartTime(Date.now())
  }, [])

  const stopLoading = useCallback(() => {
    if (startTime === null) {
      setIsLoading(false)
      return
    }

    const elapsed = Date.now() - startTime
    const remaining = minDuration - elapsed

    if (remaining > 0) {
      setTimeout(() => {
        setIsLoading(false)
        setStartTime(null)
      }, remaining)
    } else {
      setIsLoading(false)
      setStartTime(null)
    }
  }, [startTime, minDuration])

  const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      startLoading()
      return await fn()
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  }
}
