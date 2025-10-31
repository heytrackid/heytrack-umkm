'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

// Create a client
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Bias towards fewer refetches for better perceived performance
      staleTime: 5 * 60 * 1000, // 5 minutes default - data stays fresh longer
      gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 20000),
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: false, // Don't refetch when component mounts if data exists
      refetchOnReconnect: true, // Only refetch when reconnecting to internet
      // Only refetch if data is stale
      refetchInterval: false,
      // Keep previous data while fetching new data (prevents loading states)
      placeholderData: (previousData) => previousData,
    },
    mutations: {
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 20000),
    },
  },
})

// Define cache presets for different types of data
export const cachePresets = {
  // For frequently changing data that needs to be fresh
  dynamic: {
    staleTime: 10000, // 10 seconds
    gcTime: 300000, // 5 minutes
    refetchInterval: false as const,
  },
  // For data that changes occasionally (orders, inventory)
  frequentlyUpdated: {
    staleTime: 30000, // 30 seconds
    gcTime: 600000, // 10 minutes
    refetchInterval: false as const,
  },
  // For data that changes moderately (customers, recipes)
  moderatelyUpdated: {
    staleTime: 120000, // 2 minutes
    gcTime: 900000, // 15 minutes
    refetchInterval: false as const,
  },
  // For static data that rarely changes (categories, settings)
  static: {
    staleTime: 300000, // 5 minutes
    gcTime: 1800000, // 30 minutes
    refetchInterval: false as const,
  },
  // For dashboard data that doesn't change frequently but should be fresh when viewed
  dashboard: {
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
    refetchInterval: false as const,
  },
  // For analytics/reporting data that can be slightly stale
  analytics: {
    staleTime: 300000, // 5 minutes
    gcTime: 1200000, // 20 minutes
    refetchInterval: false as const,
  }
}

export default function QueryProvider({ children }: { children: ReactNode }) {
  // Create a new QueryClient instance for each request to ensure data is not shared
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
