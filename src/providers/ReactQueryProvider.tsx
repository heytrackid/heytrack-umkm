'use client'

import { handleClientError } from '@/lib/error-handling'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Create a client
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30 seconds - data considered fresh for 30s
        gcTime: 10 * 60 * 1000, // 10 minutes - garbage collect after 10min
        refetchOnWindowFocus: true, // Refetch when user returns to tab
        refetchOnMount: true, // Refetch when component mounts
        refetchOnReconnect: true, // Refetch when network reconnects
        retry: (failureCount, error) => {
          // Don't retry on auth errors
          if (error && typeof error === 'object' && 'message' in error) {
            const message = String(error.message).toLowerCase()
            if (message.includes('authentication') || message.includes('401') || message.includes('unauthorized')) {
              return false
            }
          }
          // Retry up to 3 times for other errors
          return failureCount < 3
        },
      },
      mutations: {
        retry: false, // Don't retry mutations by default
        onError: (error: unknown) => handleClientError(error, 'React Query Mutation'),
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  // NOTE: Avoid useState when initializing the query client if you don't
  // have a suspense boundary between this and the code that may suspend
  // because React will throw away the client on the initial render if
  // it suspends and there is no boundary
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}