import { createClientLogger } from '@/lib/client-logger'
import { postApi } from '@/lib/query/query-helpers'
import type { RecipeCostPreview } from '@/types/recipes/cost'
import { useQuery } from '@tanstack/react-query'

const logger = createClientLogger('RecipeCostPreview')

/**
 * Hook for getting simplified cost preview for recipes
 * Used in recipe lists to show estimated material costs
 */
export function useRecipeCostPreview(recipeId: string | null) {
  return useQuery({
    queryKey: ['recipe-cost-preview', recipeId],
    queryFn: async (): Promise<RecipeCostPreview | null> => {
      if (!recipeId) {
        logger.debug({}, 'No recipeId provided, skipping cost preview fetch')
        return null
      }

      try {
        // Use the batch endpoint for single recipe
        const result = await postApi<Record<string, RecipeCostPreview>>('/api/recipes/cost-previews', { 
          recipeIds: [recipeId] 
        })
        return result[recipeId] || null
      } catch (error) {
        logger.error({ error, recipeId }, 'Failed to fetch recipe cost preview')
        return null
      }
    },
    enabled: Boolean(recipeId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false, // Don't retry on error
  })
}

/**
 * Hook for getting cost previews for multiple recipes
 * Used in recipe lists
 */
export function useRecipesCostPreviews(recipeIds: string[]) {
  const sortedIds = [...recipeIds].sort()

  return useQuery({
    queryKey: ['recipes-cost-previews', sortedIds],
    queryFn: async (): Promise<Record<string, RecipeCostPreview>> => {
      if (recipeIds.length === 0) return {}

      try {
        return await postApi<Record<string, RecipeCostPreview>>('/api/recipes/cost-previews', { recipeIds: sortedIds })
      } catch (error) {
        logger.error({ error, recipeIds }, 'Failed to fetch recipes cost previews')
        throw error
      }
    },
    enabled: recipeIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}