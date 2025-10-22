'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

// Create a client
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Bias towards fewer refetches for better perceived performance
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 20000),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      // Only refetch if data is stale
      refetchInterval: false,
    },
    mutations: {
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 20000),
    },
  },
})

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance for each request to ensure data is not shared
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
