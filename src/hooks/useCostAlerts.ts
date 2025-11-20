import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { createClientLogger } from '@/lib/client-logger'
import { useToast } from '@/hooks/use-toast'
import type { CostChangeAlert, RecipeCostImpact } from '@/types/recipes/cost'

const logger = createClientLogger('CostAlerts')

/**
 * Hook for monitoring ingredient price changes and alerting affected recipes
 */
export function useCostChangeAlerts() {
  const { toast } = useToast()
  const lastNotifiedRef = useRef<Record<string, number>>({})

  const {
    data: alerts,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['cost-change-alerts'],
    queryFn: async (): Promise<CostChangeAlert[]> => {
      try {
        const response = await fetch('/api/ingredients/cost-alerts', {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch cost alerts')
        }

        const data = await response.json()
        return (data.alerts as CostChangeAlert[]) || []
      } catch (error) {
        logger.error({ error }, 'Failed to fetch cost change alerts')
        return []
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Check every 10 minutes
    refetchOnWindowFocus: false,
  })

  // Show toast notifications for significant price changes
  useEffect(() => {
    if (!alerts || alerts.length === 0) return

    alerts.forEach((alert) => {
      if (Math.abs(alert.changePercent) >= 5) { // Alert for changes >= 5%
        const lastNotified = lastNotifiedRef.current[alert.ingredientId] ?? 0
        const now = Date.now()
        const cooldownMs = 5 * 60 * 1000 // 5 minutes

        if (now - lastNotified < cooldownMs) {
          return
        }

        const isIncrease = alert.changePercent > 0
        const direction = isIncrease ? 'naik' : 'turun'

        toast({
          title: `Harga ${alert.ingredientName} ${direction}`,
          description: `Harga ${direction} ${Math.abs(alert.changePercent).toFixed(1)}%. ${alert.affectedRecipes.length} resep terpengaruh.`,
          variant: isIncrease ? 'destructive' : 'default',
        })

        logger.info({
          ingredientId: alert.ingredientId,
          changePercent: alert.changePercent,
          affectedRecipesCount: alert.affectedRecipes.length
        }, 'Cost change alert triggered')

        lastNotifiedRef.current[alert.ingredientId] = now
      }
    })
  }, [alerts, toast])

  return {
    alerts: alerts || [],
    hasSignificantChanges: (alerts || []).some(alert => Math.abs(alert.changePercent) >= 5),
    isLoading,
    error,
    refetch
  }
}

/**
 * Hook for getting cost impact on specific recipes
 */
export function useRecipeCostImpact(recipeId: string | null) {
  return useQuery({
    queryKey: ['recipe-cost-impact', recipeId],
    queryFn: async (): Promise<RecipeCostImpact | null> => {
      if (!recipeId) return null

      try {
        const response = await fetch(`/api/recipes/${recipeId}/cost-impact`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch recipe cost impact')
        }

        const data = await response.json()
        return data as RecipeCostImpact
      } catch (error) {
        logger.error({ error, recipeId }, 'Failed to fetch recipe cost impact')
        return null
      }
    },
    enabled: Boolean(recipeId),
    staleTime: 5 * 60 * 1000,
  })
}