'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import type { HPPAlert } from '@/types/hpp-tracking'

export interface AlertsResponse {
    success: boolean
    data: (HPPAlert & { recipes?: { name: string } })[]
    meta: {
        total: number
        unread_count: number
        limit: number
        offset: number
    }
}

interface UseAlertsDataProps {
    recipeId?: string
    limit?: number
}

interface UseAlertsDataReturn {
    alerts: (HPPAlert & { recipes?: { name: string } })[]
    unreadCount: number
    isLoading: boolean
    error: Error | null
    markAsReadMutation: any
    dismissAlertMutation: any
}

export function useAlertsData({ recipeId, limit = 20 }: UseAlertsDataProps): UseAlertsDataReturn {
    const queryClient = useQueryClient()

    // Fetch alerts
    const { data, isLoading, error } = useQuery<AlertsResponse>({
        queryKey: ['hpp-alerts', recipeId, limit],
        queryFn: async () => {
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: '0'
            })
            if (recipeId) {
                params.append('recipe_id', recipeId)
            }
            const response = await fetch(`/api/hpp/alerts?${params}`)
            if (!response.ok) {
                throw new Error('Failed to fetch alerts')
            }
            return response.json()
        },
        refetchInterval: 60000 // Refetch every minute
    })

    // Mark as read mutation
    const markAsReadMutation = useMutation({
        mutationFn: async (alertId: string) => {
            const response = await fetch(`/api/hpp/alerts/${alertId}/read`, {
                method: 'POST'
            })
            if (!response.ok) {
                throw new Error('Failed to mark alert as read')
            }
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hpp-alerts'] })
        },
        onError: () => {
            toast({
                title: 'Error',
                description: 'Gagal menandai alert sebagai sudah dibaca',
                variant: 'destructive'
            })
        }
    })

    // Dismiss alert mutation
    const dismissAlertMutation = useMutation({
        mutationFn: async (alertId: string) => {
            const response = await fetch(`/api/hpp/alerts/${alertId}/dismiss`, {
                method: 'POST'
            })
            if (!response.ok) {
                throw new Error('Failed to dismiss alert')
            }
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hpp-alerts'] })
            toast({
                title: 'Berhasil',
                description: 'Alert berhasil dihapus'
            })
        },
        onError: () => {
            toast({
                title: 'Error',
                description: 'Gagal menghapus alert',
                variant: 'destructive'
            })
        }
    })

    const alerts = data?.data || []
    const unreadCount = data?.meta.unread_count || 0

    return {
        alerts,
        unreadCount,
        isLoading,
        error: error as Error | null,
        markAsReadMutation,
        dismissAlertMutation
    }
}
