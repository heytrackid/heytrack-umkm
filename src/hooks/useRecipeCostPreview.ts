import { useQuery } from '@tanstack/react-query'

import { createClientLogger } from '@/lib/client-logger'
import type { RecipeCostPreview } from '@/types/recipes/cost'

const logger = createClientLogger('RecipeCostPreview')

/**
 * Hook for getting simplified cost preview for recipes
 * Used in recipe lists to show estimated material costs
 */
export function useRecipeCostPreview(recipeId: string | null) {
  return useQuery({
    queryKey: ['recipe-cost-preview', recipeId],
    queryFn: async (): Promise<RecipeCostPreview | null> => {
      if (!recipeId) return null

      try {
        const response = await fetch(`/api/recipes/${recipeId}/cost-preview`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch recipe cost preview')
        }

        const data = await response.json()
        return data as RecipeCostPreview
      } catch (error) {
        logger.error({ error, recipeId }, 'Failed to fetch recipe cost preview')
        throw error
      }
    },
    enabled: Boolean(recipeId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
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
        const response = await fetch('/api/recipes/cost-previews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipeIds: sortedIds }),
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch recipes cost previews')
        }

        const data = (await response.json()) as Record<string, RecipeCostPreview>
        return data
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