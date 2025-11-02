'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'




interface HppOverviewData {
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
    message: string
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

  const query = useQuery<HppOverviewData>({
    queryKey: ['hpp-overview'],
    queryFn: async () => {
      const response = await fetch('/api/hpp/overview')
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
        method: 'PUT'
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
          recentAlerts: previousData.recentAlerts.filter(a => a.id !== alertId)
        })
      }
      
      return { previousData }
    },
    onError: (error, alertId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['hpp-overview'], context.previousData)
      }
      
      apiLogger.error({ err: error, alertId }, 'Failed to mark alert as read')
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
        method: 'POST'
      })
      if (!response.ok) {
        throw new Error('Failed to mark all alerts as read')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hpp-overview'] })
      queryClient.invalidateQueries({ queryKey: ['hpp-alerts'] })
      toast({
        title: 'Success',
        description: 'All alerts marked as read'
      })
    },
    onError: (error) => {
      apiLogger.error({ err: error }, 'Failed to mark all alerts as read')
      toast({
        title: 'Error',
        description: 'Failed to mark all alerts as read',
        variant: 'destructive'
      })
    }
  })

  return {
    ...query,
    markAlertAsRead,
    markAllAlertsAsRead
  }
}
