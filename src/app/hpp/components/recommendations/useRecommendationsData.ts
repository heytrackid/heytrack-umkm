'use client'

import { useQuery } from '@tanstack/react-query'
import type { HPPRecommendation } from '@/types/hpp-tracking'

export interface RecommendationsResponse {
    success: boolean
    data: Array<HPPRecommendation & { recipe_id: string; recipe_name: string }>
    meta: {
        total_recommendations: number
        recipes_analyzed: number
    }
}

interface UseRecommendationsDataProps {
    recipeId?: string
}

interface UseRecommendationsDataReturn {
    recommendations: Array<HPPRecommendation & { recipe_id: string; recipe_name: string }>
    totalPotentialSavings: number
    isLoading: boolean
    error: Error | null
}

export function useRecommendationsData({
    recipeId
}: UseRecommendationsDataProps): UseRecommendationsDataReturn {
    // Fetch recommendations
    const { data, isLoading, error } = useQuery<RecommendationsResponse>({
        queryKey: ['hpp-recommendations', recipeId],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (recipeId) {
                params.append('recipe_id', recipeId)
            }
            const response = await fetch(`/api/hpp/recommendations?${params}`)
            if (!response.ok) {
                throw new Error('Failed to fetch recommendations')
            }
            return response.json()
        },
        refetchInterval: 300000 // Refetch every 5 minutes
    })

    const recommendations = data?.data || []
    const totalPotentialSavings = recommendations.reduce(
        (sum, rec) => sum + (rec.potential_savings || 0),
        0
    )

    return {
        recommendations,
        totalPotentialSavings,
        isLoading,
        error: error as Error | null
    }
}
