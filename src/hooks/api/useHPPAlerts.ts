'use client'

import { useDebounce } from '@/hooks/useDebounce'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchApi } from '@/lib/query/query-helpers'

interface UseHPPAlertsOptions {
  unreadOnly?: boolean
}

export function useHPPAlerts(options: UseHPPAlertsOptions = {}) {
  const { unreadOnly = false } = options
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['hpp-alerts', { unreadOnly }],
    queryFn: () => {
      const params = new URLSearchParams()
      if (unreadOnly) params.append('unread_only', 'true')
      return fetchApi(`/api/hpp/alerts?${params}`)
    },
  })

  const rawAlerts = useMemo(() => data ?? [], [data])
  const alerts = useDebounce(rawAlerts, 500)

  return {
    alerts,
    data: alerts,
    loading: isLoading,
    error,
    refresh: refetch
  }
}
