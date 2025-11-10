'use client'

import { useCallback, useState } from 'react'

import type { LoadingState, UseLoadingReturn } from '@/hooks/loading/types'



/**
 * Custom hook untuk mengelola multiple loading states
 * Berguna untuk komponen yang memiliki beberapa async operations
 *
 * @param initialStates - Initial loading states
 * @returns Object dengan loading states dan methods untuk mengontrolnya
 */
export function useLoading(initialStates: LoadingState = {}): UseLoadingReturn {
  const [loading, setLoadingState] = useState<LoadingState>(initialStates)

  const isLoading = useCallback((key: string): boolean => Boolean(loading[key]), [loading])

  const isAnyLoading = useCallback((): boolean => Object.values(loading).some(Boolean), [loading])

  const setLoading = useCallback((key: string, value: boolean) => {
    setLoadingState(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const startLoading = useCallback((key: string) => {
    setLoading(key, true)
  }, [setLoading])

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false)
  }, [setLoading])

  const withLoading = useCallback(async <T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    try {
      startLoading(key)
      return await fn()
    } finally {
      stopLoading(key)
    }
  }, [startLoading, stopLoading])

  return {
    loading,
    isLoading,
    isAnyLoading,
    setLoading,
    startLoading,
    stopLoading,
    withLoading
  }
}
