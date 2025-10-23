'use client'

import { useQuery } from '@tanstack/react-query'

interface AlertsMetaResponse {
    success: boolean
    meta: {
        total: number
        unread_count: number
    }
}

export function useHPPAlertsCount() {
    const { data, isLoading } = useQuery<AlertsMetaResponse>({
        queryKey: ['hpp-alerts-count'],
        queryFn: async () => {
            const response = await fetch('/api/hpp/alerts?limit=1')
            if (!response.ok) {
                throw new Error('Failed to fetch alerts count')
            }
            return response.json()
        },
        refetchInterval: 60000, // Refetch every minute
        staleTime: 30000 // Consider data stale after 30 seconds
    })

    return {
        unreadCount: data?.meta.unread_count || 0,
        totalCount: data?.meta.total || 0,
        isLoading
    }
}
