import type { HppCalculationInput, HppRecommendationInput, HppRecommendationUpdate } from '@/lib/validations/domains/hpp'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface HppCalculation {
  recipeId: string
  recipeName: string
  batchSize: number
  ingredientCost: number
  directCost: number
  overheadCost: number
  totalCost: number
  costPerUnit: number
  profitMargin: number
  sellingPrice: number
  profit: number
  profitAmount: number
  ingredientBreakdown: Array<{
    ingredientId: string
    ingredientName: string
    quantity: number
    unit: string
    pricePerUnit: number
    totalCost: number
  }>
}

interface HppOverview {
  summary: {
    totalRecipes: number
    avgHpp: number
    avgProfit: number
    avgProfitMargin: number
  }
  mostProfitable: {
    id: string
    name: string
    hpp: number
    sellingPrice: number
    profit: number
    profitMargin: number
  } | null
  leastProfitable: {
    id: string
    name: string
    hpp: number
    sellingPrice: number
    profit: number
    profitMargin: number
  } | null
  recipes: Array<{
    id: string
    name: string
    hpp: number
    sellingPrice: number
    profit: number
    profitMargin: number
  }>
}

interface HppRecommendation {
  id: string
  recipe_id: string
  recommendation_type: string
  title: string
  description: string
  potential_savings: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  is_implemented: boolean
  created_at: string
  updated_at: string
}

export function useCalculateHpp() {
  return useMutation({
    mutationFn: async (input: HppCalculationInput): Promise<HppCalculation> => {
      const response = await fetch('/api/hpp/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to calculate HPP')
      }

      const result = await response.json()
      return result.data
    },
  })
}

export function useHppOverview() {
  return useQuery({
    queryKey: ['hpp', 'overview'],
    queryFn: async (): Promise<HppOverview> => {
      const response = await fetch('/api/hpp/overview')

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch HPP overview')
      }

      const result = await response.json()
      return result.data
    },
  })
}

export function useHppRecommendations(recipeId?: string) {
  return useQuery({
    queryKey: ['hpp', 'recommendations', recipeId],
    queryFn: async (): Promise<HppRecommendation[]> => {
      const url = recipeId
        ? `/api/hpp/recommendations?recipeId=${recipeId}`
        : '/api/hpp/recommendations'

      const response = await fetch(url)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch recommendations')
      }

      const result = await response.json()
      return result.data
    },
  })
}

export function useCreateHppRecommendation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: HppRecommendationInput): Promise<HppRecommendation> => {
      const response = await fetch('/api/hpp/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create recommendation')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hpp', 'recommendations'] })
    },
  })
}

export function useUpdateHppRecommendation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: HppRecommendationUpdate }): Promise<HppRecommendation> => {
      const response = await fetch(`/api/hpp/recommendations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update recommendation')
      }

      const result = await response.json()
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hpp', 'recommendations'] })
    },
  })
}

export function useDeleteHppRecommendation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/hpp/recommendations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete recommendation')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hpp', 'recommendations'] })
    },
  })
}
