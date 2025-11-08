'use client'

import { useMemo } from 'react'

import { useSupabaseQuery } from '@/hooks'

interface UseHPPAlertsOptions {
  unreadOnly?: boolean
}

export function useHPPAlerts(options: UseHPPAlertsOptions = {}) {
  const { unreadOnly = false } = options
  const { data, loading, error, refetch } = useSupabaseQuery('hpp_alerts', {
    orderBy: { column: 'created_at', ascending: false },
    filter: unreadOnly ? { is_read: false } : undefined,
    realtime: true
  })

  const alerts = useMemo(() => data ?? [], [data])

  return {
    alerts,
    data: alerts,
    loading,
    error,
    refresh: refetch
  }
}
