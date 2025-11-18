'use client'

import { useQuery, type QueryKey, type UseQueryOptions } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

/**
 * Optimized Query Hook
 * Wrapper around React Query with performance optimizations
 * 
 * IMPORTANT: queryFn should be wrapped in useCallback by the caller
 * to prevent unnecessary re-renders. Example:
 * 
 * const fetchData = useCallback(async () => {
 *   // fetch logic
 * }, [dependencies])
 * 
 * useOptimizedQuery(['key'], fetchData)
 */


interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T, Error, T, QueryKey>, 'queryFn' | 'queryKey'> {
  // Custom options
  enableCache?: boolean
  cacheTime?: number
  staleTime?: number
}

/**
 * Optimized query hook with smart defaults
 */
export function useOptimizedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: OptimizedQueryOptions<T> = {}
) {
  const {
    enableCache = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 1 * 60 * 1000, // 1 minute
    ...restOptions
  } = options

  // Memoize query key to prevent unnecessary re-renders
  const queryKeyString = JSON.stringify(queryKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedKey = useMemo(() => queryKey, [queryKeyString])

  // Note: queryFn should already be wrapped in useCallback by the caller
  // React Query will handle the memoization internally
  return useQuery<T, Error, T, QueryKey>({
    queryKey: memoizedKey,
    queryFn,
    gcTime: enableCache ? cacheTime : 0,
    staleTime: enableCache ? staleTime : 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    ...restOptions
  })
}

/**
 * Optimized mutation hook
 * Note: mutationFn should be wrapped in useCallback by the caller
 */
export function useOptimizedMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: Error, variables: TVariables) => void
    invalidateQueries?: string[][]
  } = {}
) {
  const { onSuccess, onError, invalidateQueries = [] } = options

  return {
    mutate: mutationFn,
    onSuccess,
    onError,
    invalidateQueries
  }
}

/**
 * Prefetch query for faster navigation
 * Note: queryFn should be wrapped in useCallback by the caller
 */
export function usePrefetchQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  enabled = true
) {
  const queryKeyString = JSON.stringify(queryKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedKey = useMemo(() => queryKey, [queryKeyString])

  return useQuery({
    queryKey: memoizedKey,
    queryFn,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })
}

/**
 * Infinite query with optimization
 */
export function useOptimizedInfiniteQuery<T>(
  queryKey: string[],
  _queryFn: (page: number) => Promise<T>,
  options: {
    pageSize?: number
    enabled?: boolean
  } = {}
) {
  const { pageSize = 20, enabled = true } = options

  const queryKeyString = JSON.stringify(queryKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedKey = useMemo(() => queryKey, [queryKeyString])

  return {
    queryKey: memoizedKey,
    pageSize,
    enabled
  }
}
