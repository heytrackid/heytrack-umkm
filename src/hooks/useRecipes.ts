import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useToast } from '@/hooks/use-toast'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('Hook')
import { getErrorMessage } from '@/lib/type-guards'

import type { Insert, Row, Update } from '@/types/database'

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
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams()
      if (options?.limit) {params.set('limit', options.limit.toString())}
      if (options?.offset) {params.set('offset', options.offset.toString())}
      if (options?.search) {params.set('search', options.search)}
      if (options?.status) {params.set('status', options.status)}
      const queryString = params.toString()
      
      const response = await fetch(queryString ? `/api/recipes?${queryString}` : '/api/recipes', {
        credentials: 'include', // Include cookies for authentication
        signal, // React Query provides signal automatically
      })
      let payload: RecipesResponse | null = null
      try {
        payload = await response.json() as RecipesResponse
      } catch {
        // ignore parsing error, handled below
      }

      if (!response.ok || payload === null || typeof payload !== 'object') {
        const errorMessage = payload && typeof payload === 'object' && 'error' in payload && typeof (payload as { error?: unknown }).error === 'string'
          ? (payload as { error: string }).error
          : 'Failed to fetch recipes'
        throw new Error(errorMessage)
      }
      return payload
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
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
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: async ({ signal }) => {
      if (!id) {return null}
      
      const response = await fetch(`/api/recipes/${id}`, {
        credentials: 'include', // Include cookies for authentication
        signal, // React Query provides signal automatically
      })
      if (!response.ok) {
        throw new Error('Failed to fetch recipe')
      }
      return response.json()
    },
    enabled: Boolean(id),
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
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 30000) // 30s timeout

      try {
        const response = await fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include', // Include cookies for authentication
          signal: abortController.signal,
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message ?? 'Failed to create recipe')
        }
        
        return response.json()
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout - please try again')
        }
        throw error
      }
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
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 30000) // 30s timeout

      try {
        const response = await fetch(`/api/recipes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include', // Include cookies for authentication
          signal: abortController.signal,
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message ?? 'Failed to update recipe')
        }
        
        return response.json()
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout - please try again')
        }
        throw error
      }
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
 * Delete recipe
 */
export function useDeleteRecipe() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 30000) // 30s timeout

      try {
        const response = await fetch(`/api/recipes/${id}`, {
          method: 'DELETE',
          credentials: 'include', // Include cookies for authentication
          signal: abortController.signal,
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message ?? 'Failed to delete recipe')
        }
        
        return response.json()
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout - please try again')
        }
        throw error
      }
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
