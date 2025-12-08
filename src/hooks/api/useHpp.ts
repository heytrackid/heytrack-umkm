import { successToast } from '@/hooks/use-toast'
import { handleError } from '@/lib/error-handling'
import type { HppCalculationInput, HppRecommendationInput, HppRecommendationUpdate } from '@/lib/validations/domains/hpp'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryConfig } from '@/lib/query/query-config'
import { buildApiUrl, deleteApi, fetchApi, patchApi, postApi } from '@/lib/query/query-helpers'

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
      const response = await postApi<HppCalculationApiResponse>('/api/hpp', input)
      return response.data
    },
    onError: (error) => handleError(error, 'Calculate HPP', true, 'Gagal menghitung biaya produksi'),
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
    refetchOnWindowFocus: true,
    refetchOnMount: true,
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
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

export function useCreateHppRecommendation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: HppRecommendationInput): Promise<HppRecommendation> => {
      return postApi<HppRecommendation>('/api/hpp/recommendations', input)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hpp', 'recommendations'] })
      void queryClient.invalidateQueries({ queryKey: ['hpp', 'overview'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'hpp-summary'] })
      successToast('Berhasil', 'Rekomendasi berhasil dibuat')
    },
    onError: (error) => handleError(error, 'Create HPP recommendation', true, 'Gagal membuat rekomendasi'),
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
      void queryClient.invalidateQueries({ queryKey: ['hpp', 'recommendations'] })
      void queryClient.invalidateQueries({ queryKey: ['hpp', 'overview'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'hpp-summary'] })
      successToast('Berhasil', 'Rekomendasi berhasil diperbarui')
    },
    onError: (error) => handleError(error, 'Update HPP recommendation', true, 'Gagal memperbarui rekomendasi'),
  })
}

export function useDeleteHppRecommendation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await deleteApi(`/api/hpp/recommendations/${id}`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hpp', 'recommendations'] })
      void queryClient.invalidateQueries({ queryKey: ['hpp', 'overview'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'hpp-summary'] })
      successToast('Berhasil', 'Rekomendasi berhasil dihapus')
    },
    onError: (error) => handleError(error, 'Delete HPP recommendation', true, 'Gagal menghapus rekomendasi'),
  })
}

// Pricing Assistant
export interface PricingRecommendation {
  recipeId: string
  currentPrice: number
  recommendedPrice: number
  hppValue: number
  minPrice: number
  maxPrice: number
  optimalMargin: number
  reasoning: string[]
  confidence: number
  marketFactors: {
    competitorPrices: number[]
    demandLevel: 'high' | 'low' | 'medium'
    seasonality: 'low' | 'normal' | 'peak'
    category: string
  }
  riskAssessment: {
    riskLevel: 'high' | 'low' | 'medium'
    riskFactors: string[]
  }
}

export function usePricingAssistant() {
  return useMutation({
    mutationFn: (recipeId: string): Promise<PricingRecommendation> => postApi('/api/hpp/pricing-assistant', { recipeId }),
    onSuccess: () => {
      successToast('Berhasil', 'Rekomendasi harga berhasil dibuat')
    },
    onError: (error) => handleError(error, 'Pricing assistant', true, 'Gagal membuat rekomendasi harga'),
  })
}

export function useCalculateAllHpp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (): Promise<void> => patchApi('/api/hpp'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hpp'] })
      successToast('Berhasil', 'Semua biaya produksi berhasil dihitung')
    },
    onError: (error) => handleError(error, 'Calculate HPP', true, 'Gagal menghitung biaya'),
  })
}

// HPP Comparison
export interface HppComparisonItem {
  recipe_id: string
  recipe_name: string
  current_hpp: number
  previous_hpp: number
  change_percentage: number
  change_type: 'increase' | 'decrease' | 'stable'
  last_updated: string
}

export function useHppComparison(options?: { days?: number }) {
  return useQuery({
    queryKey: ['hpp', 'comparison', options],
    queryFn: (): Promise<HppComparisonItem[]> => {
      const params = new URLSearchParams()
      if (options?.days) params.set('days', options.days.toString())

      return fetchApi(`/api/hpp/comparison?${params}`)
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

// Recipe Comparison for analytics page
export interface RecipeComparison {
  id: string
  name: string
  category: string
  hppValue: number
  sellingPrice: number
  margin: number
  marginPercentage: number
  timesMade: number
  lastMade: string | null
  profitability: 'high' | 'low' | 'medium'
  efficiency: 'high' | 'low' | 'medium'
}

export interface BenchmarkData {
  averageHpp: number
  averageMargin: number
  averagePrice: number
  topPerformer: RecipeComparison | null
  worstPerformer: RecipeComparison | null
  totalRevenue: number
  totalProduction: number
}

export interface RecipeComparisonData {
  recipes: RecipeComparison[]
  benchmark: BenchmarkData
}

export function useRecipeComparison(options?: { category?: string }) {
  return useQuery({
    queryKey: ['recipe-comparison', options],
    queryFn: (): Promise<RecipeComparisonData> => {
      const params = new URLSearchParams()
      if (options?.category && options.category !== 'all') {
        params.append('category', options.category)
      }

      return fetchApi(`/api/hpp/comparison?${params}`)
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}


