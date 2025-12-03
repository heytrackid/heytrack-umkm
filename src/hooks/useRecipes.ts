import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useToast } from '@/hooks/use-toast'
import { createClientLogger } from '@/lib/client-logger'
import { queryConfig } from '@/lib/query/query-config'
import { buildApiUrl, deleteApi, fetchApi, postApi, putApi } from '@/lib/query/query-helpers'
import { getErrorMessage } from '@/lib/type-guards'

const logger = createClientLogger('Hook')

import type { Insert, RecipeWithIngredients, Row, Update } from '@/types/database'
import type { SmartPricingAnalysis } from '@/types/features/analytics'

/**
 * React Query hooks for Recipes
 * Provides caching, automatic refetching, and optimistic updates
 */


type Recipe = Row<'recipes'>
type RecipeInsert = Insert<'recipes'>
type RecipeUpdate = Update<'recipes'>

interface RecipesResponse {
  data?: Recipe[]
  meta?: Record<string, unknown>
  error?: string
}

interface UseRecipesOptions {
  limit?: number
  offset?: number
  search?: string
  status?: string
}

/**
 * Fetch all recipes with caching
 */
export function useRecipes(options?: UseRecipesOptions) {
  const { toast } = useToast()

  const queryResult = useQuery<RecipesResponse, Error, Recipe[]>({
    queryKey: ['recipes', options],
    queryFn: async () => {
      const url = buildApiUrl('/api/recipes', {
        limit: options?.limit,
        offset: options?.offset,
        search: options?.search,
        status: options?.status,
      })
      
      const payload = await fetchApi<RecipesResponse>(url)
      return payload
    },
    ...queryConfig.queries.moderate,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    select: (result: RecipesResponse) => result.data ?? [],
  })

  useEffect(() => {
    if (!queryResult.error) {
      return
    }
    const message = getErrorMessage(queryResult.error) || 'Gagal memuat data resep'
    logger.error({ error: message }, 'useRecipes: failed to fetch recipes')
    toast({
      title: 'Gagal memuat resep',
      description: message,
      variant: 'destructive',
    })
  }, [queryResult.error, toast])

  return queryResult
}

/**
 * Fetch single recipe by ID
 */
export function useRecipe(id: string | null) {
  return useQuery<RecipeWithIngredients | null>({
    queryKey: ['recipe', id],
    queryFn: async () => {
      if (!id) {return null}
      // fetchApi already extracts .data from the API response
      const recipe = await fetchApi<RecipeWithIngredients>(`/api/recipes/${id}`)
      return recipe ?? null
    },
    enabled: Boolean(id),
    ...queryConfig.queries.moderate,
  })
}

/**
 * Create new recipe
 */
export function useCreateRecipe() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (data: RecipeInsert) => {
      return postApi('/api/recipes', data)
    },
    onSuccess: () => {
      // Invalidate and refetch recipes list
      void queryClient.invalidateQueries({ queryKey: ['recipes'] })
      
      toast({
        title: 'Berhasil ✓',
        description: 'Resep berhasil dibuat',
      })
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to create recipe')
      
      toast({
        title: 'Error',
        description: message || 'Gagal membuat resep',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Update existing recipe
 */
export function useUpdateRecipe() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RecipeUpdate }) => {
      return putApi(`/api/recipes/${id}`, data)
    },
    onSuccess: (_, variables) => {
      // Invalidate specific recipe and list
      void queryClient.invalidateQueries({ queryKey: ['recipe', variables['id']] })
      void queryClient.invalidateQueries({ queryKey: ['recipes'] })
      
      toast({
        title: 'Berhasil ✓',
        description: 'Resep berhasil diperbarui',
      })
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to update recipe')
      toast({
        title: 'Error',
        description: message || 'Gagal memperbarui resep',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for recipe pricing analysis
 */
export function useRecipePricing() {
  return useMutation({
    mutationFn: ({ recipeId, recipe }: { recipeId: string; recipe: Row<'recipes'> }) => postApi<SmartPricingAnalysis>(`/api/recipes/${recipeId}/pricing`, { recipe }),
  })
}


/**
 * Delete recipe
 */
export function useDeleteRecipe() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (id: string) => {
      return deleteApi(`/api/recipes/${id}`)
    },
    onSuccess: () => {
      // Invalidate recipes list
      void queryClient.invalidateQueries({ queryKey: ['recipes'] })
      
      toast({
        title: 'Berhasil ✓',
        description: 'Resep berhasil dihapus',
      })
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to delete recipe')
      
      toast({
        title: 'Error',
        description: message || 'Gagal menghapus resep',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Custom mutation for creating recipes with nested ingredients
 * Handles complex recipe creation with recipe_ingredients
 */
export function useCreateRecipeWithIngredients() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const logger = createClientLogger('useCreateRecipeWithIngredients')

  return useMutation({
    mutationFn: async (data: {
      recipe: RecipeInsert
      ingredients: Array<{
        ingredient_id: string
        quantity: number
        unit: string
        notes?: string
      }>
    }) => {
      const payload = {
        ...data.recipe,
        ingredients: data.ingredients,
      }
      // fetchApi already extracts .data from ApiSuccessResponse and throws on error
      const recipe = await postApi<Recipe>('/api/recipes', payload)
      return recipe
    },
    onSuccess: (data) => {
      // Invalidate recipes list
      void queryClient.invalidateQueries({ queryKey: ['recipes'] })

      toast({
        title: 'Berhasil ✓',
        description: `Resep ${data?.name} berhasil dibuat`,
      })
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      // Log full error object for debugging
      logger.error({ error, message, errorType: typeof error, errorKeys: error ? Object.keys(error as object) : [] }, 'Failed to create recipe with ingredients')

      toast({
        title: 'Error',
        description: message || 'Gagal membuat resep',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Custom mutation for updating recipes with nested ingredients
 * Handles complex recipe updates with recipe_ingredients
 */
export function useUpdateRecipeWithIngredients() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const logger = createClientLogger('useUpdateRecipeWithIngredients')

  return useMutation({
    mutationFn: async (data: {
      id: string
      recipe: Partial<RecipeInsert>
      ingredients: Array<{
        ingredient_id: string
        quantity: number
        unit: string
        notes?: string
      }>
    }) => {
      const payload = {
        ...data.recipe,
        ingredients: data.ingredients,
      }
      // fetchApi already extracts .data from ApiSuccessResponse and throws on error
      const recipe = await putApi<Recipe>(`/api/recipes/${data.id}`, payload)
      return recipe
    },
    onSuccess: (data, variables) => {
      // Invalidate recipes list and specific recipe
      void queryClient.invalidateQueries({ queryKey: ['recipes'] })
      void queryClient.invalidateQueries({ queryKey: ['recipe', variables.id] })

      toast({
        title: 'Berhasil ✓',
        description: `Resep ${data?.name} berhasil diperbarui`,
      })
    },
    onError: (error: unknown, variables) => {
      const message = getErrorMessage(error)
      logger.error({ error: message, recipeId: variables.id }, 'Failed to update recipe with ingredients')

      toast({
        title: 'Error',
        description: message || 'Gagal memperbarui resep',
        variant: 'destructive',
      })
    },
  })
}
