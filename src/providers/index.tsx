'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Toaster } from 'sonner'

import { OnboardingChatbot } from '@/components/onboarding'
import { useAuth } from '@/hooks/useAuth'
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

function GlobalOnboardingChatbot(): JSX.Element | null {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  if (isLoading || !user) return null
  const excludedPrefixes = ['/auth', '/settings', '/ai-chatbot']
  if (excludedPrefixes.some((prefix) => pathname.startsWith(prefix))) return null
  return <OnboardingChatbot />
}

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
        <GlobalOnboardingChatbot />
        <Toaster position="top-right" richColors />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
