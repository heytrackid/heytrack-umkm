/**
 * Optimized Query Hook
 * Wrapper around React Query with performance optimizations
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import type { QueryKey } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T, Error, T, QueryKey>, 'queryKey' | 'queryFn'> {
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

  // Memoize query key
  const memoizedKey = useMemo(() => queryKey, [JSON.stringify(queryKey)])

  // Memoize query function
  const memoizedFn = useCallback(queryFn, [])

  return useQuery<T, Error, T, QueryKey>({
    queryKey: memoizedKey,
    queryFn: memoizedFn,
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

  const memoizedFn = useCallback(mutationFn, [])

  return {
    mutate: memoizedFn,
    onSuccess,
    onError,
    invalidateQueries
  }
}

/**
 * Prefetch query for faster navigation
 */
export function usePrefetchQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  enabled = true
) {
  const memoizedKey = useMemo(() => queryKey, [JSON.stringify(queryKey)])
  const memoizedFn = useCallback(queryFn, [])

  return useQuery({
    queryKey: memoizedKey,
    queryFn: memoizedFn,
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

  const memoizedKey = useMemo(() => queryKey, [JSON.stringify(queryKey)])

  return {
    queryKey: memoizedKey,
    pageSize,
    enabled
  }
}
