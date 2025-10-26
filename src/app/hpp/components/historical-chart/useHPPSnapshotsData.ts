'use client'

import type { HPPSnapshot, TimePeriod } from '@/types/hpp-tracking'
import { useState, useEffect } from 'react'

interface UseHPPSnapshotsDataProps {
    recipeId?: string
    selectedPeriod: TimePeriod
    multiSelect: boolean
    selectedRecipeIds: string[]
}

interface UseHPPSnapshotsDataReturn {
    snapshots: HPPSnapshot[]
    multiProductData: Record<string, HPPSnapshot[]>
    loading: boolean
    error: string | null
    fetchSnapshots: (period: TimePeriod) => Promise<void>
    fetchMultiProductSnapshots: (period: TimePeriod, recipeIds: string[]) => Promise<void>
}

export function useHPPSnapshotsData({
    recipeId,
    selectedPeriod,
    multiSelect,
    selectedRecipeIds
}: UseHPPSnapshotsDataProps): UseHPPSnapshotsDataReturn {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [snapshots, setSnapshots] = useState<HPPSnapshot[]>([])
    const [multiProductData, setMultiProductData] = useState<Record<string, HPPSnapshot[]>>({})

    // Fetch snapshots data for single product
    const fetchSnapshots = async (period: TimePeriod) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(
                `/api/hpp/snapshots?recipe_id=${recipeId}&period=${period}`
            )

            if (!response.ok) {
                throw new Error('Failed to fetch HPP snapshots')
            }

            const result = await response.json()
            setSnapshots(result.data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            setSnapshots([])
        } finally {
            setLoading(false)
        }
    }

    // Fetch snapshots data for multiple products
    const fetchMultiProductSnapshots = async (period: TimePeriod, recipeIds: string[]) => {
        if (recipeIds.length === 0) {
            setMultiProductData({})
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(
                `/api/hpp/trends?recipe_ids=${recipeIds.join(',')}&period=${period}`
            )

            if (!response.ok) {
                throw new Error('Failed to fetch HPP trends')
            }

            const result = await response.json()
            setMultiProductData(result.data || {})
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            setMultiProductData({})
        } finally {
            setLoading(false)
        }
    }

    // Fetch data when period or recipes change
    useEffect(() => {
        if (multiSelect) {
            fetchMultiProductSnapshots(selectedPeriod, selectedRecipeIds)
        } else if (recipeId) {
            fetchSnapshots(selectedPeriod)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recipeId, selectedPeriod, multiSelect, selectedRecipeIds])

    return {
        snapshots,
        multiProductData,
        loading,
        error,
        fetchSnapshots,
        fetchMultiProductSnapshots
    }
}
