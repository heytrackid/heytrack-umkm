import { useCallback, useState } from 'react'

interface LoadingState {
  [key: string]: boolean
}

interface UseLoadingReturn {
  loading: LoadingState
  isLoading: (key: string) => boolean
  isAnyLoading: () => boolean
  setLoading: (key: string, value: boolean) => void
  startLoading: (key: string) => void
  stopLoading: (key: string) => void
  withLoading: <T>(key: string, fn: () => Promise<T>) => Promise<T>
}

/**
 * Custom hook untuk mengelola multiple loading states
 * Berguna untuk komponen yang memiliki beberapa async operations
 * 
 * @param initialStates - Initial loading states
 * @returns Object dengan loading states dan methods untuk mengontrolnya
 */
export function useLoading(initialStates: LoadingState = {}): UseLoadingReturn {
  const [loading, setLoadingState] = useState<LoadingState>(initialStates)

  const isLoading = useCallback((key: string): boolean => {
    return Boolean(loading[key])
  }, [loading])

  const isAnyLoading = useCallback((): boolean => {
    return Object.values(loading).some(Boolean)
  }, [loading])

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
      setIsLoading(true)
      return await fn()
    } finally {
      setIsLoading(false)
    }
  }, [])

  return [isLoading, setIsLoading, withLoading] as const
}

/**
 * Hook untuk mengelola loading dengan timeout
 * Berguna untuk skeleton yang perlu tampil minimal beberapa saat
 * 
 * @param minDuration - Minimum duration skeleton should be shown (in ms)
 * @returns Object dengan loading states dan methods
 */
export function useMinimumLoading(minDuration = 500) {
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

// Common loading keys untuk consistency
export const LOADING_KEYS = {
  // Dashboard
  DASHBOARD_STATS: 'dashboard_stats',
  RECENT_ORDERS: 'recent_orders',
  STOCK_ALERTS: 'stock_alerts',

  // Data Operations
  FETCH_ORDERS: 'fetch_orders',
  FETCH_CUSTOMERS: 'fetch_customers',
  FETCH_RECIPES: 'fetch_recipes',
  FETCH_INVENTORY: 'fetch_inventory',

  // Form Operations
  SAVE_RECIPE: 'save_recipe',
  SAVE_ORDER: 'save_order',
  SAVE_CUSTOMER: 'save_customer',

  // Delete Operations
  DELETE_RECIPE: 'delete_recipe',
  DELETE_ORDER: 'delete_order',
  DELETE_CUSTOMER: 'delete_customer',

  // Export Operations
  EXPORT_EXCEL: 'export_excel',

  // HPP Calculations
  CALCULATE_HPP: 'calculate_hpp',

  // Search Operations
  SEARCH: 'search',
} as const

export type LoadingKey = typeof LOADING_KEYS[keyof typeof LOADING_KEYS]