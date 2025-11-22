import { useQuery } from '@tanstack/react-query'
import { fetchApi, postApi } from '@/lib/query/query-helpers'

interface OrderItem {
  recipe_id: string
  quantity: number
}

interface ProductionTimeEstimate {
  total_minutes: number
  total_hours: number
  estimated_completion: string
  recipes: Array<{
    recipe_id: string
    recipe_name: string
    quantity: number
    prep_time: number
    cook_time: number
    total_time: number
  }>
}

/**
 * Estimate production time for order items
 */
export function useEstimateProductionTime(items: OrderItem[]) {
  return useQuery<ProductionTimeEstimate>({
    queryKey: ['production-time-estimate', items],
    queryFn: () => postApi<ProductionTimeEstimate>('/api/orders/estimate-production-time', { items }),
    enabled: items.length > 0,
  })
}

/**
 * Get production time for single recipe
 */
export function useRecipeProductionTime(recipeId: string | null, quantity: number = 1) {
  return useQuery<{
    prep_time: number
    cook_time: number
    total_time: number
    scaled_time: number
  }>({
    queryKey: ['recipe-production-time', recipeId, quantity],
    queryFn: () => {
      if (!recipeId) throw new Error('Recipe ID is required')
      return fetchApi(`/api/recipes/${recipeId}/production-time?quantity=${quantity}`)
    },
    enabled: !!recipeId && quantity > 0,
  })
}
