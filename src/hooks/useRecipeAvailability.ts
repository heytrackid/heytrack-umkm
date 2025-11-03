import { useQuery, useMutation } from '@tanstack/react-query'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('Hook')




interface RecipeAvailabilityResult {
  recipe_id: string
  recipe_name: string
  is_available: boolean
  max_quantity: number
  missing_ingredients: Array<{
    ingredient_id: string
    ingredient_name: string
    required: number
    available: number
    shortfall: number
    unit: string
    lead_time_days: number | null
  }>
  warnings: string[]
}

export function useRecipeAvailability(recipeId: string | null, quantity = 1) {
  return useQuery({
    queryKey: ['recipe-availability', recipeId, quantity],
    queryFn: async () => {
      if (!recipeId) {return null}

      const response = await fetch(
        `/api/recipes/availability?recipe_id=${recipeId}&quantity=${quantity}`
      )

      if (!response.ok) {
        throw new Error('Failed to check recipe availability')
      }

      return response.json() as Promise<RecipeAvailabilityResult>
    },
    enabled: !!recipeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true
  })
}

export function useCheckMultipleRecipes() {
  return useMutation({
    mutationFn: async (recipes: Array<{ recipe_id: string; quantity: number }>) => {
      const response = await fetch('/api/recipes/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipes })
      })

      if (!response.ok) {
        throw new Error('Failed to check recipes')
      }

      return response.json() as Promise<{
        results: RecipeAvailabilityResult[]
        summary: {
          total: number
          available: number
          unavailable: number
        }
      }>
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to check multiple recipes:')
    }
  })
}
