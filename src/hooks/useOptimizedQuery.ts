'use client'

/* eslint-disable react-hooks/exhaustive-deps */
import { useQuery, type QueryKey, type UseQueryOptions } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

/**
 * Optimized Query Hook
 * Wrapper around React Query with performance optimizations
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

  // Memoize query key
  const queryKeyString = JSON.stringify(queryKey)
   
  const memoizedKey = useMemo(() => queryKey, [queryKeyString])

  // Memoize query function - queryFn is expected to be stable
  const memoizedFn = useCallback(queryFn, [queryFn])

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

  const memoizedFn = useCallback(mutationFn, [mutationFn])

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
  const queryKeyString = JSON.stringify(queryKey)
  const memoizedKey = useMemo(() => queryKey, [queryKeyString])
  const memoizedFn = useCallback(queryFn, [queryFn])

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

  const queryKeyString2 = JSON.stringify(queryKey)
  const memoizedKey = useMemo(() => queryKey, [queryKeyString2])

  return {
    queryKey: memoizedKey,
    pageSize,
    enabled
  }
}
