'use client'

import { SWRConfig } from 'swr'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('SWR')

const swrFetcher = async (resource: string) => {
  const response = await fetch(resource)
  if (!response.ok) {
    throw new Error(`Error fetching ${resource}: ${response.status}`)
  }
  return response.json()
}

export const SWRProvider = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig
    value={{
      fetcher: swrFetcher,
      dedupingInterval: 5000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      keepPreviousData: true,
      onSuccess: (data: unknown, key: string) => {
        logger.debug({ key, dataCount: Array.isArray(data) ? data.length : 'object' }, 'SWR Success')
      },
      onError: (error: Error, key: string) => {
        logger.error({ key, error }, 'SWR Error')
      },
      // Cache for 5 minutes by default
      refreshInterval: 5 * 60 * 1000,
    }}
  >
    {children}
  </SWRConfig>
)