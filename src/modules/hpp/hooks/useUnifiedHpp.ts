'use client'

import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
} from '@tanstack/react-query'
import { useState } from 'react'

import { useToast } from '@/hooks/use-toast'
import { createClientLogger } from '@/lib/client-logger'

import type {
    HppComparison,
    HppOverview,
    RecipeIngredientWithPrice,
    RecipeWithHpp,
} from '@/modules/hpp/types/index'
import type { Row } from '@/types/database'

const logger = createClientLogger('ClientFile')

type Recipe = Row<'recipes'>

interface RecipeIngredientRecord {
  ingredient_id: string
  quantity?: number | null
  unit?: string | null
  ingredients?: {
    name?: string | null
    weighted_average_cost?: number | null
    price_per_unit?: number | null
    category?: string | null
  } | null
}

interface RecipeDetailResponse extends Recipe {
  recipe_ingredients?: RecipeIngredientRecord[] | null
}

interface RecipesListResponse {
  recipes: Array<Pick<Recipe, 'id' | 'name'>>
}

interface HppComparisonResponse {
  recipes: HppComparison[]
}

// Extended type for UI with calculated fields
export type RecipeWithCosts = RecipeDetailResponse & RecipeWithHpp & {
  ingredients: RecipeIngredientWithPrice[]
  operational_costs: number
  labor_costs: number
  overhead_costs: number
  total_cost: number
}

export interface UseUnifiedHppReturn {
  recipes: Array<Pick<Recipe, 'id' | 'name'>>
  overview: HppOverview | undefined
  recipe: RecipeWithCosts | null
  comparison: HppComparison[]
  isLoading: boolean
  recipeLoading: boolean
  selectedRecipeId: string
  setSelectedRecipeId: (id: string) => void
  calculateHpp: UseMutationResult<unknown, unknown, string, unknown>
  updatePrice: UseMutationResult<unknown, unknown, { recipeId: string; price: number; margin: number }, unknown>
}



function isRecipesListResponse(payload: unknown): payload is RecipesListResponse {
  return typeof payload === 'object' && payload !== null && Array.isArray((payload as RecipesListResponse).recipes)
}

function isHppComparisonResponse(payload: unknown): payload is HppComparisonResponse {
  return typeof payload === 'object' && payload !== null && Array.isArray((payload as HppComparisonResponse).recipes)
}



export function useUnifiedHpp(): UseUnifiedHppReturn {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('')

  // Fetch all recipes
  const { data: recipesData, isLoading: recipesLoading } = useQuery<Array<Pick<Recipe, 'id' | 'name'>>>({
    queryKey: ['recipes-list'],
    queryFn: async (): Promise<Array<Pick<Recipe, 'id' | 'name'>>> => {
      const response = await fetch('/api/recipes?limit=100', {
        credentials: 'include', // Include cookies for authentication
      })
      if (!response.ok) {throw new Error('Failed to fetch recipes')}
      const result = await response.json()
      const payload = result.data as Recipe[] | RecipesListResponse | null
      let recipeCount = 0
      if (Array.isArray(payload)) {
        recipeCount = payload.length
      } else if (isRecipesListResponse(payload)) {
        recipeCount = payload.recipes.length
      }

      logger.info({
        hasPayload: payload !== null,
        isArray: Array.isArray(payload),
        hasRecipesKey: isRecipesListResponse(payload),
        count: recipeCount
      }, 'HPP: Recipes data fetched')
      if (!payload) { return [] }

      if (Array.isArray(payload)) {
        return payload.map(({ id, name }) => ({ id, name }))
      }

      if (isRecipesListResponse(payload)) {
        return payload.recipes.map(({ id, name }) => ({ id, name }))
      }

      return []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })

  // Fetch HPP overview
  const { data: overviewData, isLoading: overviewLoading } = useQuery<HppOverview>({
    queryKey: ['hpp-overview'],
    queryFn: async (): Promise<HppOverview> => {
      const response = await fetch('/api/hpp/overview', {
        credentials: 'include', // Include cookies for authentication
      })
      if (!response.ok) {throw new Error('Failed to fetch overview')}
      const result = await response.json()
      return result.data as HppOverview
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false
  })

  // Fetch selected recipe details with HPP data
  const { data: recipeData, isLoading: recipeLoading } = useQuery<RecipeWithCosts | null>({
    queryKey: ['recipe-detail', selectedRecipeId],
    queryFn: async (): Promise<RecipeWithCosts | null> => {
      if (!selectedRecipeId) {return null}

      // Fetch recipe with HPP calculation from API
      const response = await fetch(`/api/hpp/recipe/${selectedRecipeId}`, {
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recipe with HPP data')
      }

      const result = await response.json()
      const data = result.data
      // Transform API response to match RecipeWithCosts interface
      return {
        ...data.recipe,
        ingredients: data.ingredients || [],
        operational_costs: data.operational_costs || 0,
        labor_costs: data.labor_costs || 0,
        overhead_costs: data.overhead_costs || 0,
        total_cost: data.total_cost || 0
      } as RecipeWithCosts
    },
    enabled: Boolean(selectedRecipeId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })

  // Fetch comparison data
  const { data: comparisonData } = useQuery<HppComparison[]>({
    queryKey: ['hpp-comparison'],
    queryFn: async (): Promise<HppComparison[]> => {
      const response = await fetch('/api/hpp/comparison', {
        credentials: 'include', // Include cookies for authentication
      })
      if (!response.ok) {throw new Error('Failed to fetch comparison')}
      const result = await response.json()
      const payload = result.data as HppComparison[] | HppComparisonResponse | null
      if (Array.isArray(payload)) { return payload }
      if (isHppComparisonResponse(payload)) { return payload.recipes }
      return []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })



  // Calculate HPP
  const calculateHpp = useMutation<unknown, unknown, string>({
    mutationFn: async (recipeId: string) => {
      const response = await fetch('/api/hpp/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId }),
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {throw new Error('Failed to calculate HPP')}
      return response.json()
    },
    onSuccess: (_data, recipeId) => {
      // Granular cache invalidation - only invalidate affected recipe
      void queryClient.invalidateQueries({ queryKey: ['recipe-detail', recipeId] })
      void queryClient.invalidateQueries({ queryKey: ['hpp-overview'] })
      void queryClient.invalidateQueries({ queryKey: ['hpp-comparison'] })

      toast({
        title: 'Berhasil ✓',
        description: 'Biaya produksi berhasil dihitung'
      })
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to calculate HPP')
      toast({
        title: 'Error',
        description: 'Gagal menghitung biaya produksi',
        variant: 'destructive'
      })
    }
  })

  // Update recipe price
  const updatePrice = useMutation<unknown, unknown, { recipeId: string; price: number; margin: number }>({
    mutationFn: async ({ recipeId, price, margin }: { recipeId: string; price: number; margin: number }) => {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selling_price: price,
          margin_percentage: margin
        }),
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {throw new Error('Failed to update price')}
      return response.json()
    },
    onSuccess: (_data, { recipeId }) => {
      // Granular cache invalidation - only invalidate affected recipe
      void queryClient.invalidateQueries({ queryKey: ['recipe-detail', recipeId] })
      void queryClient.invalidateQueries({ queryKey: ['recipes-list'] })
      void queryClient.invalidateQueries({ queryKey: ['hpp-overview'] })
      void queryClient.invalidateQueries({ queryKey: ['hpp-comparison'] })

      toast({
        title: 'Tersimpan ✓',
        description: 'Harga jual berhasil disimpan'
      })
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to update price')
      toast({
        title: 'Error',
        description: 'Gagal menyimpan harga jual',
        variant: 'destructive'
      })
    }
  })


  return {
    recipes: recipesData ?? [],
    overview: overviewData,
    recipe: (recipeData ?? null),
    comparison: comparisonData ?? [],
    isLoading: recipesLoading || overviewLoading,
    recipeLoading,
    selectedRecipeId,
    setSelectedRecipeId,
    calculateHpp,
    updatePrice
  } satisfies UseUnifiedHppReturn
}