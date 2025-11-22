'use client'

import type { Row } from '@/types/database'
import { createClientLogger } from '@/lib/client-logger'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

const logger = createClientLogger('useRecipesWithIngredients')

type RecipeRow = Row<'recipes'>
type RecipeIngredientRow = Row<'recipe_ingredients'>
type IngredientRow = Row<'ingredients'>

export type RecipeWithIngredients = RecipeRow & {
  recipe_ingredients?: Array<RecipeIngredientRow & { ingredients?: IngredientRow | null }>
}

interface UseRecipesWithIngredientsOptions {
  realtime?: boolean
  refetchOnMount?: boolean
}

export function useRecipesWithIngredients(options: UseRecipesWithIngredientsOptions = {}) {
  const queryOptions: UseQueryOptions<RecipeWithIngredients[]> = {
    queryKey: ['recipes-with-ingredients'],
    queryFn: async () => {
      const response = await fetch('/api/recipes?include=ingredients')

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch recipes with ingredients')
      }

      const data = await response.json()
      logger.info('Recipes with ingredients fetched')
      return data
    },
    staleTime: 30000,
  }
  if (options.refetchOnMount !== undefined) {
    queryOptions.refetchOnMount = options.refetchOnMount
  }

  const { data = [], isLoading, error, refetch } = useQuery<RecipeWithIngredients[]>(queryOptions)

  return {
    data,
    loading: isLoading,
    error: error?.message || null,
    refetch: async () => {
      await refetch()
    }
  }
}
