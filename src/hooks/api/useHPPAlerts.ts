'use client'

import { toast } from '@/hooks/use-toast'
import type { HPPAlert } from '@/types/hpp-tracking'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface UseHPPAlertsParams {
    unreadOnly?: boolean
    limit?: number
    enabled?: boolean
}

interface HPPAlertsResponse {
    success: boolean
    data: HPPAlert[]
    meta: {
        total: number
        unread_count: number
    }
}

interface MarkAsReadResponse {
    success: boolean
    data: HPPAlert
}

const fetchHPPAlerts = async ({
    unreadOnly = false,
    limit = 20,
}: Omit<UseHPPAlertsParams, 'enabled'>): Promise<HPPAlertsResponse> => {
    const params = new URLSearchParams({
        limit: limit.toString(),
    })

    if (unreadOnly) {
        params.append('unread_only', 'true')
    }

    const response = await fetch(`/api/hpp/alerts?${params.toString()}`)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch HPP alerts')
    }

    return response.json()
}

const markAlertAsRead = async (alertId: string): Promise<MarkAsReadResponse> => {
    const response = await fetch(`/api/hpp/alerts/${alertId}/read`, {
        method: 'POST',
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to mark alert as read')
    }

    return response.json()
}

/**
 * Hook to fetch HPP alerts with real-time updates
 * 
 * Features:
 * - Automatic polling every 5 minutes
 * - Unread count tracking
 * - Filter by unread status
 * - Refetch on window focus
 * 
 * @example
 * ```tsx
 * const { data, isLoading, unreadCount } = useHPPAlerts({
 *   unreadOnly: false,
 *   limit: 20
 * })
 * ```
 */
export const useHPPAlerts = ({
    unreadOnly = false,
    limit = 20,
    enabled = true,
}: UseHPPAlertsParams = {}) => {
    const query = useQuery({
        queryKey: ['hpp', 'alerts', unreadOnly, limit],
        queryFn: () => fetchHPPAlerts({ unreadOnly, limit }),
        enabled,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: true,
        refetchInterval: 5 * 60 * 1000, // Poll every 5 minutes for real-time updates
        retry: 2,
    })

    return {
        ...query,
        alerts: query.data?.data || [],
        unreadCount: query.data?.meta.unread_count || 0,
        total: query.data?.meta.total || 0,
    }
}

/**
 * Hook to mark an alert as read with optimistic updates
 * 
 * Features:
 * - Optimistic UI updates
 * - Automatic cache invalidation
 * - Error handling with rollback
 * - Success/error notifications
 * 
 * @example
 * ```tsx
 * const { mutate: markAsRead, isPending } = useMarkAlertAsRead()
 * 
 * markAsRead(alertId)
 * ```
 */
export const useMarkAlertAsRead = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: markAlertAsRead,
        onMutate: async (alertId: string) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['hpp', 'alerts'] })

            // Snapshot previous values
            const previousAlerts = queryClient.getQueriesData({ queryKey: ['hpp', 'alerts'] })

            // Optimistically update all alert queries
            queryClient.setQueriesData<HPPAlertsResponse>(
                { queryKey: ['hpp', 'alerts'] },
                (old) => {
                    if (!old) return old

                    return {
                        ...old,
                        data: old.data.map((alert) =>
                            alert.id === alertId
                                ? { ...alert, is_read: true, read_at: new Date().toISOString() }
                                : alert
                        ),
                        meta: {
                            ...old.meta,
                            unread_count: Math.max(0, old.meta.unread_count - 1),
                        },
                    }
                }
            )

            return { previousAlerts }
        },
        onError: (error, alertId, context) => {
            // Rollback on error
            if (context?.previousAlerts) {
                context.previousAlerts.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data)
                })
            }

            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to mark alert as read',
                variant: 'destructive',
            })
        },
        onSuccess: () => {
            // Invalidate to ensure we have the latest data
            queryClient.invalidateQueries({ queryKey: ['hpp', 'alerts'] })
        },
    })
}

/**
 * Hook to get only the unread count without fetching full alert data
 * Useful for badge displays in navigation
 * 
 * @example
 * ```tsx
 * const { unreadCount } = useHPPAlertsUnreadCount()
 * ```
 */
export const useHPPAlertsUnreadCount = () => {
    const query = useQuery({
        queryKey: ['hpp', 'alerts', 'unread-count'],
        queryFn: () => fetchHPPAlerts({ unreadOnly: true, limit: 1 }),
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: true,
        refetchInterval: 5 * 60 * 1000, // Poll every 5 minutes
        retry: 2,
        select: (data) => data.meta.unread_count,
    })

    return {
        ...query,
        unreadCount: query.data || 0,
    }
}
