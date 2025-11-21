import type { HppCalculationInput, HppRecommendationInput, HppRecommendationUpdate } from '@/lib/validations/domains/hpp'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { buildApiUrl, deleteApi, fetchApi, patchApi, postApi } from '@/lib/query/query-helpers'
import { queryConfig } from '@/lib/query/query-config'

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

interface HppCalculationApiResponse {
  data: HppCalculation
}

interface HppOverviewApiResponse {
  data: HppOverview
}

interface HppRecommendationsApiResponse {
  data: HppRecommendation[]
}

export function useCalculateHpp() {
  return useMutation({
    mutationFn: async (input: HppCalculationInput): Promise<HppCalculation> => {
      const response = await postApi<HppCalculationApiResponse>('/api/hpp/calculate', input)
      return response.data
    },
  })
}

export function useHppOverview() {
  return useQuery({
    queryKey: ['hpp', 'overview'],
    queryFn: async (): Promise<HppOverview> => {
      const response = await fetchApi<HppOverviewApiResponse>('/api/hpp/overview')
      return response.data
    },
    ...queryConfig.queries.moderate,
  })
}

export function useHppRecommendations(recipeId?: string) {
  return useQuery({
    queryKey: ['hpp', 'recommendations', recipeId],
    queryFn: async (): Promise<HppRecommendation[]> => {
      const url = buildApiUrl('/api/hpp/recommendations', { recipeId })
      const response = await fetchApi<HppRecommendationsApiResponse>(url)
      return response.data
    },
    ...queryConfig.queries.moderate,
  })
}

export function useCreateHppRecommendation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: HppRecommendationInput): Promise<HppRecommendation> => {
      return postApi<HppRecommendation>('/api/hpp/recommendations', input)
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
      const response = await patchApi<{ data: HppRecommendation }>(`/api/hpp/recommendations/${id}`, data)
      return response.data
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
      await deleteApi(`/api/hpp/recommendations/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hpp', 'recommendations'] })
    },
  })
}
