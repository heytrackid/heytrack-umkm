import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/query/query-helpers'

import type { ReorderSuggestionWithDetails } from '@/types/database'

/**
 * Get reorder suggestions for low-stock ingredients
 */
export function useReorderSuggestions() {
  return useQuery<ReorderSuggestionWithDetails[]>({
    queryKey: ['reorder-suggestions'],
    queryFn: () => fetchApi<ReorderSuggestionWithDetails[]>('/api/inventory/reorder-suggestions'),
    staleTime: 60000, // 1 minute
  })
}

/**
 * Get reorder point calculation for an ingredient
 */
export function useReorderPoint(ingredientId: string | null) {
  return useQuery<{
    reorder_point: number
    safety_stock: number
    average_daily_usage: number
    lead_time_days: number
  }>({
    queryKey: ['reorder-point', ingredientId],
    queryFn: () => {
      if (!ingredientId) throw new Error('Ingredient ID is required')
      return fetchApi(`/api/inventory/reorder-point/${ingredientId}`)
    },
    enabled: !!ingredientId,
    staleTime: 300000, // 5 minutes
  })
}
