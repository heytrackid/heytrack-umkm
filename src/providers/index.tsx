'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { useState } from 'react'
import { Toaster } from 'sonner'

import { commonQueryOptions } from '@/lib/query/query-config'

/**
 * Standardized QueryClient configuration
 */
const createQueryClient = (): QueryClient => new QueryClient({
  defaultOptions: {
    queries: {
      // Default to moderate caching strategy
      staleTime: 120000, // 2 minutes
      gcTime: 900000, // 15 minutes
      // Keep previous data while fetching new data (prevents loading states)
      placeholderData: (previousData: unknown) => previousData,
      notifyOnChangeProps: 'all',
      // Spread common options (includes retry, refetch settings)
      ...commonQueryOptions,
    },
    mutations: {
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 20000),
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }): JSX.Element {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster position="top-right" richColors />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
