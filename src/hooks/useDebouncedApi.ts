'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseDebouncedApiOptions<T> {
  delay?: number
  enabled?: boolean
  initialData?: T
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface UseDebouncedApiReturn<T> {
  data: T | undefined
  loading: boolean
  error: Error | null
  refetch: () => void
  cancel: () => void
}

/**
 * Hook untuk debounce API calls
 * Auto-cancel previous request kalau ada request baru
 * 
 * @example
 * ```tsx
 * const { data, loading } = useDebouncedApi(
 *   async () => fetchUsers(searchQuery),
 *   [searchQuery],
 *   { delay: 300 }
 * )
 * ```
 */
export function useDebouncedApi<T>(
  apiFunction: () => Promise<T>,
  dependencies: unknown[],
  options: UseDebouncedApiOptions<T> = {}
): UseDebouncedApiReturn<T> {
  const {
    delay = 300,
    enabled = true,
    initialData,
    onSuccess,
    onError
  } = options

  const [data, setData] = useState<T | undefined>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)

  // Cancel any pending requests
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  // Execute the API call
  const executeApi = useCallback(() => {
    if (!enabled) { return }

    // Cancel any pending request
    cancel()

    // Start loading after debounce
    timeoutRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)

      // Create new AbortController
      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const result = await apiFunction()

        // Only update state if still mounted and not aborted
        if (mountedRef.current && !controller.signal.aborted) {
          setData(result)
          setError(null)
          onSuccess?.(result)
        }
      } catch (unknownError) {
        // Only update error if still mounted and not aborted
        if (mountedRef.current && !controller.signal.aborted) {
          const normalizedError = unknownError instanceof Error ? unknownError : new Error('API call failed')
          setError(normalizedError)
          onError?.(normalizedError)
        }
      } finally {
        // Only update loading if still mounted and not aborted
        if (mountedRef.current && !controller.signal.aborted) {
          setLoading(false)
        }
      }
    }, delay)
  }, [apiFunction, delay, enabled, cancel, onSuccess, onError])

  // Refetch function (no debounce)
  const refetch = useCallback(async () => {
    if (!enabled) { return }

    cancel()
    setLoading(true)
    setError(null)

    try {
      const result = await apiFunction()
      if (mountedRef.current) {
        setData(result)
        setError(null)
        onSuccess?.(result)
      }
    } catch (unknownError) {
      if (mountedRef.current) {
        const normalizedError = unknownError instanceof Error ? unknownError : new Error('API call failed')
        setError(normalizedError)
        onError?.(normalizedError)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [apiFunction, enabled, cancel, onSuccess, onError])

  // Execute on dependency change
  useEffect(() => {
    executeApi()

    return () => {
      cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executeApi, cancel, ...dependencies])

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      cancel()
    }
  }, [cancel])

  return {
    data,
    loading,
    error,
    refetch,
    cancel
  }
}

/**
 * Hook untuk debounce value (not API)
 * Useful untuk search input, filters, etc.
 * 
 * @example
 * ```tsx
 * const [search, setSearch] = useState('')
 * const debouncedSearch = useDebouncedValue(search, 300)
 * 
 * // Use debouncedSearch for API calls
 * useEffect(() => {
 *   fetchData(debouncedSearch)
 * }, [debouncedSearch])
 * ```
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timeout)
    }
  }, [value, delay])

  return debouncedValue
}
