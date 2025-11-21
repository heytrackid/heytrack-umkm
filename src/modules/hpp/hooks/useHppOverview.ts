'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useToast } from '@/lib/toast'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('ClientFile')




export interface HppOverviewData {
  totalRecipes: number
  recipesWithHpp: number
  averageHpp: number
  totalAlerts: number
  unreadAlerts: number
  recentAlerts: Array<{
    id: string
    recipe_id: string
    recipe_name: string
    alert_type: string
    title: string
    message: string
    severity: string
    is_read: boolean
    new_value: number | null
    created_at: string
  }>
  recentSnapshots: Array<{
    id: string
    recipe_id: string
    recipe_name: string
    hpp_value: number
    snapshot_date: string
  }>
}

export function useHppOverview() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const _query = useQuery({
    queryKey: ['hpp-overview'],
    queryFn: async () => {
      const response = await fetch('/api/hpp/overview', {
        credentials: 'include', // Include cookies for authentication
      })
      if (!response.ok) {
        throw new Error('Failed to fetch HPP overview')
      }
      return response.json()
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  })

  const markAlertAsRead = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/hpp/alerts/${alertId}/read`, {
        method: 'PUT',
        credentials: 'include', // Include cookies for authentication
      })
      if (!response.ok) {
        throw new Error('Failed to mark alert as read')
      }
      return response.json()
    },
    onMutate: async (alertId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['hpp-overview'] })
      
      const previousData = queryClient.getQueryData<HppOverviewData>(['hpp-overview'])
      
      if (previousData) {
        queryClient.setQueryData<HppOverviewData>(['hpp-overview'], {
          ...previousData,
          unreadAlerts: Math.max(0, previousData.unreadAlerts - 1),
          recentAlerts: previousData.recentAlerts.filter(a => a['id'] !== alertId)
        })
      }
      
      return { previousData }
    },
    onError: (error, alertId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['hpp-overview'], context.previousData)
      }
      
      logger.error({ error, alertId }, 'Failed to mark alert as read')
      toast({
        title: 'Error',
        description: 'Failed to mark alert as read',
        variant: 'destructive'
      })
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Alert marked as read'
      })
    }
  })

  const markAllAlertsAsRead = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/hpp/alerts/bulk-read', {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
      })
      if (!response.ok) {
        throw new Error('Failed to mark all alerts as read')
      }
      return response.json()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hpp-overview'] })
      void queryClient.invalidateQueries({ queryKey: ['hpp-alerts'] })
      toast({
        title: 'Success',
        description: 'All alerts marked as read'
      })
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to mark all alerts as read')
      toast({
        title: 'Error',
        description: 'Failed to mark all alerts as read',
        variant: 'destructive'
      })
    }
  })

  return {
    ..._query,
    markAlertAsRead,
    markAllAlertsAsRead
  }
}
