'use client'

import type { HPPSnapshot, TimePeriod } from '@/types/hpp-tracking'
import { useQuery } from '@tanstack/react-query'

export interface UseHPPSnapshotsParams {
    recipeId: string
    period?: TimePeriod
    startDate?: string
    endDate?: string
    enabled?: boolean
}

interface HPPSnapshotsResponse {
    success: boolean
    data: HPPSnapshot[]
    meta: {
        count: number
        period: string
        recipe_name: string
    }
}

const fetchHPPSnapshots = async ({
    recipeId,
    period = '30d',
    startDate,
    endDate,
}: Omit<UseHPPSnapshotsParams, 'enabled'>): Promise<HPPSnapshotsResponse> => {
    const params = new URLSearchParams({
        recipe_id: recipeId,
        period,
    })

    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)

    const response = await fetch(`/api/hpp/snapshots?${params.toString()}`)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch HPP snapshots')
    }

    return response.json()
}

/**
 * Hook to fetch HPP snapshots with TanStack Query
 * 
 * Features:
 * - Automatic caching with 5-minute stale time
 * - Refetch on window focus
 * - Period filtering support
 * - Custom date range support
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useHPPSnapshots({
 *   recipeId: 'recipe-uuid',
 *   period: '30d'
 * })
 * ```
 */
export const useHPPSnapshots = ({
    recipeId,
    period = '30d',
    startDate,
    endDate,
    enabled = true,
}: UseHPPSnapshotsParams) => {
    return useQuery({
        queryKey: ['hpp', 'snapshots', recipeId, period, startDate, endDate],
        queryFn: () => fetchHPPSnapshots({ recipeId, period, startDate, endDate }),
        enabled: enabled && !!recipeId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
        refetchOnWindowFocus: true,
        retry: 2,
    })
}
