import { createClientLogger } from '@/lib/client-logger'
import { deleteApi, fetchApi, postApi, putApi } from '@/lib/query/query-helpers'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { RestockSuggestion, RestockSuggestionsSummary } from '@/types/database'

const logger = createClientLogger('useInventoryAlerts')

interface ActiveInventoryAlert {
  id: string
  ingredient_id: string
  ingredient_name: string
  current_stock: number
  reorder_point: number
  alert_type: 'low_stock' | 'out_of_stock' | 'expiring_soon'
  created_at: string
  acknowledged: boolean
}

/**
 * Get active inventory alerts
 */
export function useInventoryAlerts() {
  return useQuery<ActiveInventoryAlert[]>({
    queryKey: ['inventory-alerts'],
    queryFn: () => fetchApi<ActiveInventoryAlert[]>('/api/inventory/alerts'),
  })
}

/**
 * Check low stock alerts (trigger alert check)
 */
export function useCheckLowStockAlerts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => postApi('/api/inventory/alerts/check'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] })
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to check low stock alerts')
    },
  })
}

/**
 * Acknowledge alert
 */
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (alertId: string) => putApi(`/api/inventory/alerts/${alertId}/acknowledge`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] })
      toast.success('Alert berhasil ditandai')
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to acknowledge alert')
      toast.error('Gagal menandai alert')
    },
  })
}

/**
 * Dismiss alert
 */
export function useDismissAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (alertId: string) => deleteApi(`/api/inventory/alerts/${alertId}/dismiss`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] })
      toast.success('Alert berhasil dihapus')
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to dismiss alert')
      toast.error('Gagal menghapus alert')
    },
  })
}

/**
 * Get restock suggestions
 */
export function useRestockSuggestions() {
  return useQuery<{
    suggestions: RestockSuggestion[]
    summary: RestockSuggestionsSummary
  }>({
    queryKey: ['restock-suggestions'],
    queryFn: () => fetchApi<{
      suggestions: RestockSuggestion[]
      summary: RestockSuggestionsSummary
    }>('/api/inventory/restock-suggestions'),
  })
}

/**
 * Check ingredient alert for specific ingredient
 */
export function useCheckIngredientAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ingredientId: string) => postApi('/api/inventory/alerts/check-ingredient', { ingredientId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] })
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to check ingredient alert')
    },
  })
}
