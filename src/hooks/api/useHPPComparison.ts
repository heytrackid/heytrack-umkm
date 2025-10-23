'use client'
import * as React from 'react'

import type { HPPComparison, TimePeriod } from '@/types/hpp-tracking'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

export interface UseHPPComparisonParams {
    recipeId: string
    period?: TimePeriod
    enabled?: boolean
}

interface HPPComparisonResponse {
    success: boolean
    data: HPPComparison
}

interface TrendIndicator {
    color: 'red' | 'green' | 'gray'
    icon: 'up' | 'down' | 'stable'
    label: string
}

const fetchHPPComparison = async ({
    recipeId,
    period = '30d',
}: Omit<UseHPPComparisonParams, 'enabled'>): Promise<HPPComparisonResponse> => {
    const params = new URLSearchParams({
        recipe_id: recipeId,
        period,
    })

    const response = await fetch(`/api/hpp/comparison?${params.toString()}`)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch HPP comparison')
    }

    return response.json()
}

/**
 * Calculate trend indicator based on change percentage
 * 
 * Rules:
 * - Red/Up: Increase > 5%
 * - Green/Down: Decrease > 5%
 * - Gray/Stable: Change < 5%
 */
const calculateTrendIndicator = (changePercentage: number): TrendIndicator => {
    if (changePercentage > 5) {
        return {
            color: 'red',
            icon: 'up',
            label: 'Naik',
        }
    } else if (changePercentage < -5) {
        return {
            color: 'green',
            icon: 'down',
            label: 'Turun',
        }
    } else {
        return {
            color: 'gray',
            icon: 'stable',
            label: 'Stabil',
        }
    }
}

/**
 * Hook to fetch HPP comparison data with trend indicators
 * 
 * Features:
 * - Automatic caching with 5-minute stale time
 * - Memoized trend calculations
 * - Period comparison support
 * - Refetch on window focus
 * 
 * @example
 * ```tsx
 * const { 
 *   data, 
 *   isLoading, 
 *   trendIndicator,
 *   changePercentage,
 *   changeAbsolute 
 * } = useHPPComparison({
 *   recipeId: 'recipe-uuid',
 *   period: '30d'
 * })
 * ```
 */
export const useHPPComparison = ({
    recipeId,
    period = '30d',
    enabled = true,
}: UseHPPComparisonParams) => {
    const query = useQuery({
        queryKey: ['hpp', 'comparison', recipeId, period],
        queryFn: () => fetchHPPComparison({ recipeId, period }),
        enabled: enabled && !!recipeId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
        refetchOnWindowFocus: true,
        retry: 2,
    })

    // Memoize expensive calculations
    const trendIndicator = useMemo(() => {
        if (!query.data?.data) return null
        return calculateTrendIndicator(query.data.data.change.percentage)
    }, [query.data?.data])

    const changePercentage = useMemo(() => {
        return query.data?.data.change.percentage || 0
    }, [query.data?.data])

    const changeAbsolute = useMemo(() => {
        return query.data?.data.change.absolute || 0
    }, [query.data?.data])

    const currentAvg = useMemo(() => {
        return query.data?.data.current_period.avg_hpp || 0
    }, [query.data?.data])

    const previousAvg = useMemo(() => {
        return query.data?.data.previous_period.avg_hpp || 0
    }, [query.data?.data])

    return {
        ...query,
        comparison: query.data?.data,
        trendIndicator,
        changePercentage,
        changeAbsolute,
        currentAvg,
        previousAvg,
    }
}

/**
 * Hook to get trend indicator for a specific change percentage
 * Useful for displaying trend indicators without fetching data
 * 
 * @example
 * ```tsx
 * const indicator = useTrendIndicator(12.5)
 * // Returns: { color: 'red', icon: 'up', label: 'Naik' }
 * ```
 */
export const useTrendIndicator = (changePercentage: number): TrendIndicator => {
    return useMemo(() => calculateTrendIndicator(changePercentage), [changePercentage])
}
