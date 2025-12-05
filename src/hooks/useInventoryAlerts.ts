import { createClientLogger } from '@/lib/client-logger'
import { handleError } from '@/lib/error-handling'
import { deleteApi, fetchApi, postApi, putApi } from '@/lib/query/query-helpers'
import type { RestockSuggestion, RestockSuggestionsSummary } from '@/types/database'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { successToast } from '@/hooks/use-toast'

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
    queryFn: async () => {
      const response = await fetchApi<{ data: ActiveInventoryAlert[] }>('/api/inventory/alerts')
      // Extract data array if response has pagination structure
      return Array.isArray(response) ? response : response.data
    },
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
      successToast('Berhasil', 'Alert berhasil ditandai')
    },
    onError: (error) => handleError(error, 'Acknowledge alert', true, 'Gagal menandai alert'),
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
      successToast('Berhasil', 'Alert berhasil dihapus')
    },
    onError: (error) => handleError(error, 'Dismiss alert', true, 'Gagal menghapus alert'),
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
