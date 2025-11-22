import { useQuery } from '@tanstack/react-query'
import { fetchApi, postApi } from '@/lib/query/query-helpers'

interface RecipeAvailabilityResult {
  available: boolean
  missing_ingredients: Array<{
    ingredient_id: string
    ingredient_name: string
    required_quantity: number
    available_quantity: number
    shortage: number
    unit: string
  }>
  can_produce_quantity: number
}

interface RecipeOption {
  id: string
  name: string
  available: boolean
  max_quantity: number
}

interface IngredientUsage {
  ingredient_id: string
  ingredient_name: string
  total_used: number
  unit: string
  recipes_using: number
}

/**
 * Check recipe availability for production
 */
export function useRecipeAvailability(recipeId: string | null, quantity: number = 1) {
  return useQuery<RecipeAvailabilityResult>({
    queryKey: ['recipe-availability', recipeId, quantity],
    queryFn: () => {
      if (!recipeId) throw new Error('Recipe ID is required')
      return fetchApi<RecipeAvailabilityResult>(`/api/recipes/availability?recipeId=${recipeId}&quantity=${quantity}`)
    },
    enabled: !!recipeId && quantity > 0,
  })
}

/**
 * Get all available recipes
 */
export function useAvailableRecipes() {
  return useQuery<RecipeOption[]>({
    queryKey: ['available-recipes'],
    queryFn: () => fetchApi<RecipeOption[]>('/api/recipes/availability/all'),
  })
}

/**
 * Check multiple recipes availability
 */
export function useBulkRecipeAvailability(recipeIds: string[]) {
  return useQuery({
    queryKey: ['bulk-recipe-availability', recipeIds],
    queryFn: () => postApi('/api/recipes/availability/bulk', { recipeIds }),
    enabled: recipeIds.length > 0,
  })
}

/**
 * Get ingredient usage across recipes
 */
export function useIngredientUsage(ingredientId: string | null) {
  return useQuery<IngredientUsage>({
    queryKey: ['ingredient-usage', ingredientId],
    queryFn: () => {
      if (!ingredientId) throw new Error('Ingredient ID is required')
      return fetchApi<IngredientUsage>(`/api/ingredients/${ingredientId}/usage`)
    },
    enabled: !!ingredientId,
  })
}

/**
 * Get recipes that can be made with current inventory
 */
export function useProducibleRecipes() {
  return useQuery<RecipeOption[]>({
    queryKey: ['producible-recipes'],
    queryFn: () => fetchApi<RecipeOption[]>('/api/recipes/producible'),
  })
}

/**
 * Calculate max production quantity for recipe
 */
export function useMaxProductionQuantity(recipeId: string | null) {
  return useQuery<{ max_quantity: number; limiting_ingredient?: string }>({
    queryKey: ['max-production-quantity', recipeId],
    queryFn: () => {
      if (!recipeId) throw new Error('Recipe ID is required')
      return fetchApi(`/api/recipes/${recipeId}/max-quantity`)
    },
    enabled: !!recipeId,
  })
}
