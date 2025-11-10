'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

interface ReactQueryProviderProps {
  children: React.ReactNode
}

export const ReactQueryProvider = ({ children }: ReactQueryProviderProps) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error instanceof Error && 'status' in error && typeof error['status'] === 'number') {
            if (error['status'] >= 400 && error['status'] < 500) {
              return false
            }
          }
          return failureCount < 3
        },
      },
      mutations: {
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process['env'].NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}