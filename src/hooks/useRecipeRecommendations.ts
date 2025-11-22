import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/query/query-helpers'

interface RecipeRecommendation {
  id: string
  name: string
  score: number
  reason: string
  available: boolean
  estimated_profit: number
}

/**
 * Get recipe recommendations for customer
 */
export function useCustomerRecipeRecommendations(customerId: string | null) {
  return useQuery<RecipeRecommendation[]>({
    queryKey: ['recipe-recommendations', 'customer', customerId],
    queryFn: () => {
      if (!customerId) throw new Error('Customer ID is required')
      return fetchApi(`/api/customers/${customerId}/recipe-recommendations`)
    },
    enabled: !!customerId,
  })
}

/**
 * Get trending recipes
 */
export function useTrendingRecipes(limit: number = 10) {
  return useQuery<RecipeRecommendation[]>({
    queryKey: ['recipe-recommendations', 'trending', limit],
    queryFn: () => fetchApi(`/api/recipes/trending?limit=${limit}`),
  })
}

/**
 * Get most profitable recipes
 */
export function useMostProfitableRecipes(limit: number = 10) {
  return useQuery<RecipeRecommendation[]>({
    queryKey: ['recipe-recommendations', 'profitable', limit],
    queryFn: () => fetchApi(`/api/recipes/most-profitable?limit=${limit}`),
  })
}

/**
 * Get similar recipes
 */
export function useSimilarRecipes(recipeId: string | null, limit: number = 5) {
  return useQuery<RecipeRecommendation[]>({
    queryKey: ['recipe-recommendations', 'similar', recipeId, limit],
    queryFn: () => {
      if (!recipeId) throw new Error('Recipe ID is required')
      return fetchApi(`/api/recipes/${recipeId}/similar?limit=${limit}`)
    },
    enabled: !!recipeId,
  })
}
