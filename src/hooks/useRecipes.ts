import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
import type { RecipesTable, RecipesInsert, RecipesUpdate } from '@/types/database'

/**
 * React Query hooks for Recipes
 * Provides caching, automatic refetching, and optimistic updates
 */


type _Recipe = RecipesTable
type RecipeInsert = RecipesInsert
type RecipeUpdate = RecipesUpdate

interface UseRecipesOptions {
  limit?: number
  offset?: number
  search?: string
}

/**
 * Fetch all recipes with caching
 */
export function useRecipes(options?: UseRecipesOptions) {
  return useQuery({
    queryKey: ['recipes', options],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options?.limit) {params.set('limit', options.limit.toString())}
      if (options?.offset) {params.set('offset', options.offset.toString())}
      if (options?.search) {params.set('search', options.search)}
      
      const response = await fetch(`/api/recipes?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch recipes')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
  })
}

/**
 * Fetch single recipe by ID
 */
export function useRecipe(id: string | null) {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      if (!id) {return null}
      
      const response = await fetch(`/api/recipes/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch recipe')
      }
      return response.json()
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
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
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? 'Failed to create recipe')
      }
      
      return response.json()
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
      apiLogger.error({ error: message }, 'Failed to create recipe')
      
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
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? 'Failed to update recipe')
      }
      
      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalidate specific recipe and list
      void queryClient.invalidateQueries({ queryKey: ['recipe', variables.id] })
      void queryClient.invalidateQueries({ queryKey: ['recipes'] })
      
      toast({
        title: 'Berhasil ✓',
        description: 'Resep berhasil diperbarui',
      })
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      apiLogger.error({ error: message }, 'Failed to update recipe')
      
      toast({
        title: 'Error',
        description: message || 'Gagal memperbarui resep',
        variant: 'destructive',
      })
    },
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
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? 'Failed to delete recipe')
      }
      
      return response.json()
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
      apiLogger.error({ error: message }, 'Failed to delete recipe')
      
      toast({
        title: 'Error',
        description: message || 'Gagal menghapus resep',
        variant: 'destructive',
      })
    },
  })
}
