'use client'

import { useState } from 'react'
import type { Database } from '@/types/supabase-generated'
type Recipe = Database['public']['Tables']['recipes']['Row']
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'
import { HPP_CONFIG } from '@/lib/constants/hpp-config'
import type {
  RecipeIngredientWithPrice,
  RecipeWithHpp,
  HppOverview,
  HppComparison,
} from '@/modules/hpp/types'

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

// Type guard for recipe ingredient structure
function isValidRecipeIngredient(ri: unknown): ri is RecipeIngredientRecord {
  if (!ri || typeof ri !== 'object') return false
  const ingredient = ri as { ingredient_id?: unknown }
  return typeof ingredient.ingredient_id === 'string'
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
  const { data: recipesData, isLoading: recipesLoading } = useQuery<Pick<Recipe, 'id' | 'name'>[]>({
    queryKey: ['recipes-list'],
    queryFn: async (): Promise<Array<Pick<Recipe, 'id' | 'name'>>> => {
      const response = await fetch('/api/recipes?limit=100')
      if (!response.ok) {throw new Error('Failed to fetch recipes')}
      const payload = await response.json() as RecipesListResponse | Recipe[] | null
      const recipeCount = Array.isArray(payload)
        ? payload.length
        : isRecipesListResponse(payload)
          ? payload.recipes.length
          : 0

      apiLogger.info({
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
      const response = await fetch('/api/hpp/overview')
      if (!response.ok) {throw new Error('Failed to fetch overview')}
      return response.json() as Promise<HppOverview>
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false
  })

  // Fetch selected recipe details
  const { data: recipeData, isLoading: recipeLoading } = useQuery<RecipeWithCosts | null>({
    queryKey: ['recipe-detail', selectedRecipeId],
    queryFn: async (): Promise<RecipeWithCosts | null> => {
      if (!selectedRecipeId) {return null}
      
      const response = await fetch(`/api/recipes/${selectedRecipeId}`)
      if (!response.ok) {throw new Error('Failed to fetch recipe')}
      const data: RecipeDetailResponse = await response.json()
      
      // Calculate total cost from ingredients with type safety
      let ingredientCost = 0
      const recipeIngredients = Array.isArray(data.recipe_ingredients)
        ? data.recipe_ingredients.filter(isValidRecipeIngredient)
        : []

      ingredientCost = recipeIngredients.reduce((sum: number, ri) => {
        const quantity = ri.quantity ?? 0
        // Use WAC if available, otherwise use current price
        const unitPrice =
          ri.ingredients?.weighted_average_cost ??
          ri.ingredients?.price_per_unit ??
          0
        return sum + quantity * unitPrice
      }, 0)
      
      // Get operational costs using configured percentage and minimum
      const operationalCost = Math.max(
        ingredientCost * HPP_CONFIG.MIN_OPERATIONAL_COST_PERCENTAGE,
        HPP_CONFIG.DEFAULT_OVERHEAD_PER_SERVING
      )
      
      const result = {
        ...data,
        ingredients: recipeIngredients.map((ri): RecipeIngredientWithPrice => ({
          id: ri.ingredient_id,
          name: ri.ingredients?.name ?? 'Unknown',
          quantity: ri.quantity ?? 0,
          unit: ri.unit ?? 'unit',
          unit_price:
            ri.ingredients?.weighted_average_cost ??
            ri.ingredients?.price_per_unit ??
            0,
          category: ri.ingredients?.category ?? undefined
        })),
        operational_costs: operationalCost,
        total_cost: ingredientCost + operationalCost
      } as RecipeWithCosts
      
      return result
    },
    enabled: !!selectedRecipeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })

  // Fetch comparison data
  const { data: comparisonData } = useQuery<HppComparison[]>({
    queryKey: ['hpp-comparison'],
    queryFn: async (): Promise<HppComparison[]> => {
      const response = await fetch('/api/hpp/comparison')
      if (!response.ok) {throw new Error('Failed to fetch comparison')}
      const payload = await response.json() as HppComparisonResponse | HppComparison[] | null
      if (!payload) { return [] }
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
        body: JSON.stringify({ recipeId })
      })
      
      if (!response.ok) {throw new Error('Failed to calculate HPP')}
      return response.json()
    },
    onSuccess: (_data, recipeId) => {
      // Granular cache invalidation - only invalidate affected recipe
      queryClient.invalidateQueries({ queryKey: ['recipe-detail', recipeId] })
      queryClient.invalidateQueries({ queryKey: ['hpp-overview'] })
      queryClient.invalidateQueries({ queryKey: ['hpp-comparison'] })
      
      toast({
        title: 'Berhasil ✓',
        description: 'Biaya produksi berhasil dihitung'
      })
    },
    onError: (error) => {
      apiLogger.error({ error }, 'Failed to calculate HPP')
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
        })
      })
      
      if (!response.ok) {throw new Error('Failed to update price')}
      return response.json()
    },
    onSuccess: (_data, { recipeId }) => {
      // Granular cache invalidation - only invalidate affected recipe
      queryClient.invalidateQueries({ queryKey: ['recipe-detail', recipeId] })
      queryClient.invalidateQueries({ queryKey: ['recipes-list'] })
      queryClient.invalidateQueries({ queryKey: ['hpp-overview'] })
      queryClient.invalidateQueries({ queryKey: ['hpp-comparison'] })
      
      toast({
        title: 'Tersimpan ✓',
        description: 'Harga jual berhasil disimpan'
      })
    },
    onError: (error) => {
      apiLogger.error({ error }, 'Failed to update price')
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
    recipe: (recipeData ?? null) as RecipeWithCosts | null,
    comparison: comparisonData ?? [],
    isLoading: recipesLoading || overviewLoading,
    recipeLoading,
    selectedRecipeId,
    setSelectedRecipeId,
    calculateHpp,
    updatePrice
  } satisfies UseUnifiedHppReturn
}
