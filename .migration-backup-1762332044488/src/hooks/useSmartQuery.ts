'use client'

import { useQuery, type UseQueryOptions, type QueryKey } from '@tanstack/react-query'

/**
 * Smart Query Hook - mencegah loading skeleton saat navigasi
 * Global placeholderData di QueryProvider sudah keep previous data
 */

interface SmartQueryOptions<T> extends Omit<UseQueryOptions<T, Error, T, QueryKey>, 'queryKey' | 'queryFn'> {
  /** Stale time dalam milidetik (default: 5 menit) */
  staleTime?: number
  /** Cache time dalam milidetik (default: 15 menit) */
  gcTime?: number
}

/**
 * Hook untuk query yang smart - mencegah skeleton loading berulang
 * Mengandalkan global placeholderData dari QueryProvider
 */
export function useSmartQuery<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options: SmartQueryOptions<T> = {}
) {
  const {
    staleTime = 5 * 60 * 1000, // 5 menit
    gcTime = 15 * 60 * 1000, // 15 menit
    ...restOptions
  } = options

  return useQuery<T, Error, T, QueryKey>({
    queryKey,
    queryFn,
    staleTime,
    gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Jangan refetch kalau data masih ada
    refetchOnReconnect: true,
    // placeholderData sudah di-set global di QueryProvider
    ...restOptions
  })
}
