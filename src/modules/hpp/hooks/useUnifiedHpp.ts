'use client'

import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
} from '@tanstack/react-query'
import { useState } from 'react'

import { useToast } from '@/lib/toast'
import { createClientLogger } from '@/lib/client-logger'
import { HPP_CONFIG } from '@/lib/constants/hpp-config'

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

// Type guard for recipe ingredient structure
function isValidRecipeIngredient(ri: unknown): ri is RecipeIngredientRecord {
  if (!ri || typeof ri !== 'object') {return false}
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
  const { data: recipesData, isLoading: recipesLoading } = useQuery<Array<Pick<Recipe, 'id' | 'name'>>>({
    queryKey: ['recipes-list'],
    queryFn: async (): Promise<Array<Pick<Recipe, 'id' | 'name'>>> => {
      const response = await fetch('/api/recipes?limit=100', {
        credentials: 'include', // Include cookies for authentication
      })
      if (!response.ok) {throw new Error('Failed to fetch recipes')}
      const payload = await response.json() as Recipe[] | RecipesListResponse | null

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

      // Fetch complete HPP calculation from the backend service first
      let totalCost = 0;
      let operationalCost = 0;
      let laborCost = 0;
      let overheadCost = 0;
      let recipeDetail: RecipeDetailResponse | null = null;
      
      try {
        const hppResponse = await fetch(`/api/hpp/calculations?recipeId=${selectedRecipeId}`, {
          credentials: 'include', // Include cookies for authentication
        });
        
        if (hppResponse.ok) {
          const hppData = await hppResponse.json();
          if (Array.isArray(hppData.calculations) && hppData.calculations.length > 0) {
            // Get the most recent HPP calculation
            const latestCalculation = hppData.calculations[0];
            totalCost = latestCalculation.cost_per_unit || 0;
            
            // Calculate per-unit costs based on servings from recipe info
            const recipeResponse = await fetch(`/api/recipes/${selectedRecipeId}`, {
              credentials: 'include', // Include cookies for authentication
            });
            if (recipeResponse.ok) {
              recipeDetail = await recipeResponse.json();
            } else {
              throw new Error('Failed to fetch recipe details');
            }
            
            const servings = Number(recipeDetail!.servings) || 1;
            operationalCost = (latestCalculation.overhead_cost || 0) / servings;
            laborCost = (latestCalculation.labor_cost || 0) / servings;
            overheadCost = (latestCalculation.overhead_cost || 0) / servings;
          }
        }
      } catch (error) {
        logger.warn({ error, recipeId: selectedRecipeId }, 'Failed to fetch complete HPP calculation, will use fallback calculation');
      }

      // If no complete HPP calculation is available, fall back to basic calculation
      if (totalCost === 0) {
        const response = await fetch(`/api/recipes/${selectedRecipeId}`, {
          credentials: 'include', // Include cookies for authentication
        });
        if (!response.ok) {throw new Error('Failed to fetch recipe')}
        recipeDetail = await response.json();

        // Calculate ingredient costs for fallback
        let ingredientCost = 0;
        const recipeIngredients = Array.isArray(recipeDetail!.recipe_ingredients)
          ? recipeDetail!.recipe_ingredients.filter(isValidRecipeIngredient)
          : [];

         ingredientCost = recipeIngredients.reduce((sum: number, ri) => {
           const quantity = ri.quantity ?? 0;
           // Use WAC if available, otherwise use current price
           const unitPrice =
             ri.ingredients?.weighted_average_cost ??
             ri.ingredients?.price_per_unit ??
             0;

           // Log warning if ingredient has no price
           if (unitPrice === 0 && ri.ingredients?.name) {
             logger.warn({
               ingredientId: ri.ingredient_id,
               ingredientName: ri.ingredients.name
             }, 'Ingredient has no price data for HPP calculation');
           }

           return sum + quantity * unitPrice;
         }, 0);

        // Fallback operational costs calculation
        operationalCost = Math.max(
          ingredientCost * HPP_CONFIG.MIN_OPERATIONAL_COST_PERCENTAGE,
          HPP_CONFIG.DEFAULT_OVERHEAD_PER_SERVING
        );
        totalCost = ingredientCost + operationalCost;
      }

        const result = {
          ...recipeDetail!,
        ingredients: (recipeDetail!.recipe_ingredients || [])
          .filter(isValidRecipeIngredient)
          .map((ri): RecipeIngredientWithPrice => ({
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
        labor_costs: laborCost,
        overhead_costs: overheadCost,
        total_cost: totalCost
      } as RecipeWithCosts;

      return result;
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
      const payload = await response.json() as HppComparison[] | HppComparisonResponse | null
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