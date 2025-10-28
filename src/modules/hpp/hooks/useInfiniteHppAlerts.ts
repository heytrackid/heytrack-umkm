'use client'

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'

interface HppAlert {
  id: string
  recipe_id: string
  recipe_name: string
  alert_type: string
  message: string
  is_read: boolean
  created_at: string
}

interface HppAlertsResponse {
  alerts: HppAlert[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface UseInfiniteHppAlertsOptions {
  isRead?: boolean
  alertType?: string
  recipeId?: string
}

export function useInfiniteHppAlerts(options: UseInfiniteHppAlertsOptions = {}) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const query = useInfiniteQuery<HppAlertsResponse>({
    queryKey: ['hpp-alerts-infinite', options],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: '20',
        ...(options.isRead !== undefined && { is_read: String(options.isRead) }),
        ...(options.alertType && { alert_type: options.alertType }),
        ...(options.recipeId && { recipe_id: options.recipeId })
      })

      const response = await fetch(`/api/hpp/alerts?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch alerts')
      }
      return response.json()
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
    staleTime: 30 * 1000, // 30 seconds for alerts
    gcTime: 2 * 60 * 1000, // 2 minutes
  })

  const markAsRead = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/hpp/alerts/${alertId}/read`, {
        method: 'PATCH'
      })
      if (!response.ok) {
        throw new Error('Failed to mark alert as read')
      }
      return response.json()
    },
    onMutate: async (alertId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['hpp-alerts-infinite', options] })
      
      const previousData = queryClient.getQueryData(['hpp-alerts-infinite', options])
      
      queryClient.setQueryData(['hpp-alerts-infinite', options], (old: { pages: HppAlertsResponse[] } | undefined) => {
        if (!old) {return old}
        
        return {
          ...old,
          pages: old.pages.map((page: HppAlertsResponse) => ({
            ...page,
            alerts: page.alerts.map((alert: HppAlert) =>
              alert.id === alertId ? { ...alert, is_read: true } : alert
            )
          }))
        }
      })
      
      return { previousData }
    },
    onError: (error, alertId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['hpp-alerts-infinite', options], context.previousData)
      }
      
      apiLogger.error({ err: error, alertId }, 'Failed to mark alert as read')
      toast({
        title: 'Error',
        description: 'Failed to mark alert as read',
        variant: 'destructive'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hpp-overview'] })
    }
  })

  return {
    ...query,
    markAsRead
  }
}
