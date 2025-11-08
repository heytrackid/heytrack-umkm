'use client'

import { useCallback, useEffect, useState } from 'react'

import { type ApiResponse, type ApiRequestOptions, apiClient } from '@/lib/api/client'


type RequestConfig = ApiRequestOptions

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  autoLoad?: boolean
}

interface UseApiState<T> {
  data: T | null
  error: string | null
  isLoading: boolean
  isRefreshing: boolean
}

/**
 * useApi - Hook for making API requests with loading/error states
 */
export function useApi<T = unknown >(
  endpoint: string,
  options: UseApiOptions<T> = {}
): {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  fetch: (config?: RequestConfig) => Promise<void>;
  refetch: (config?: RequestConfig) => Promise<void>;
} {
  const { onSuccess, onError, autoLoad = false } = options

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isRefreshing: false,
  })

  /**
   * Execute GET request
   */
  const fetch = useCallback(async (config?: RequestConfig): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      const response = await apiClient.get<T>(endpoint, config)

      if (response.success && response['data']) {
        setState({
          data: response['data'],
          error: null,
          isLoading: false,
          isRefreshing: false,
        })
        onSuccess?.(response['data'])
      } else {
        const error = response.error ?? 'Failed to fetch data'
        setState({
          data: null,
          error,
          isLoading: false,
          isRefreshing: false,
        })
        onError?.(error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState({
        data: null,
        error: errorMessage,
        isLoading: false,
        isRefreshing: false,
      })
      onError?.(errorMessage)
    }
  }, [endpoint, onSuccess, onError])

  /**
   * Refetch data
   */
  const refetch = useCallback(async (config?: RequestConfig): Promise<void> => {
    setState((prev) => ({ ...prev, isRefreshing: true }))

    try {
      const response = await apiClient.get<T>(endpoint, config)

      if (response.success && response['data']) {
        setState((prev) => ({
          ...prev,
          data: response['data'] as T,
          error: null,
          isRefreshing: false,
        }))
        onSuccess?.(response['data'])
      } else {
        const error = response.error ?? 'Failed to refetch data'
        setState((prev) => ({
          ...prev,
          error,
          isRefreshing: false,
        }))
        onError?.(error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isRefreshing: false,
      }))
      onError?.(errorMessage)
    }
  }, [endpoint, onSuccess, onError])

  /**
   * Auto-load data on mount
   */
  useEffect(() => {
    if (autoLoad) {
      const timer = setTimeout(() => {
        void fetch()
      }, 0)
      
      return () => clearTimeout(timer)
    }
  }, [autoLoad, fetch])

  return {
    data: state['data'],
    error: state.error,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    fetch,
    refetch,
  }
}

/**
 * useMutationApi - Hook for POST/PUT/DELETE/PATCH requests
 */
export function useMutationApi<T = unknown , R = unknown >(
  endpoint: string,
  method: 'DELETE' | 'PATCH' | 'POST' | 'PUT' = 'POST',
  options: UseApiOptions<R> = {}
): {
  data: R | null;
  error: string | null;
  isLoading: boolean;
  mutate: (body?: T, config?: RequestConfig) => Promise<void>;
} {
  const { onSuccess, onError } = options

  const [state, setState] = useState<Omit<UseApiState<R>, 'isRefreshing'> & { data: R | null }>({
    data: null,
    error: null,
    isLoading: false,
  })

  /**
   * Execute mutation
   */
  const mutate = useCallback(
    async (body?: T, config?: RequestConfig): Promise<void> => {
      setState({ data: null, error: null, isLoading: true })

      try {
        let response: ApiResponse<R>

        switch (method) {
          case 'POST':
            response = await apiClient.post<R>(endpoint, body, config)
            break
          case 'PUT':
            response = await apiClient.put<R>(endpoint, body, config)
            break
          case 'PATCH':
            response = await apiClient.patch<R>(endpoint, body, config)
            break
          case 'DELETE':
            response = await apiClient.delete<R>(endpoint, config)
            break
          default:
            response = await apiClient.post<R>(endpoint, body, config)
        }

        if (response.success && response['data']) {
          setState({
            data: response['data'],
            error: null,
            isLoading: false,
          })
          onSuccess?.(response['data'])
        } else {
          const error = response.error ?? 'Operation failed'
          setState({
            data: null,
            error,
            isLoading: false,
          })
          onError?.(error)
          throw new Error(error)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setState({
          data: null,
          error: errorMessage,
          isLoading: false,
        })
        onError?.(errorMessage)
        throw error
      }
    },
    [endpoint, method, onSuccess, onError]
  )

  return {
    data: state['data'],
    error: state.error,
    isLoading: state.isLoading,
    mutate,
  }
}

export type { UseApiState, UseApiOptions }