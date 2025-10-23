/**
 * Example usage of HPPComparisonCard component
 * 
 * This file demonstrates how to integrate the HPPComparisonCard
 * into the HPP Historical Tab or any other page.
 */

'use client'

import { HPPComparison, TimePeriod } from '@/types/hpp-tracking'
import * as React from 'react'
import { useEffect, useState } from 'react'
import HPPComparisonCard from './HPPComparisonCard'

export default function HPPComparisonCardExample() {
    const [comparison, setComparison] = useState<HPPComparison | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedRecipeId, setSelectedRecipeId] = useState<string>('your-recipe-id')
    const [period, setPeriod] = useState<TimePeriod>('30d')

    useEffect(() => {
        async function fetchComparison() {
            setLoading(true)
            try {
                const response = await fetch(
                    `/api/hpp/comparison?recipe_id=${selectedRecipeId}&period=${period}`
                )
                const data = await response.json()

                if (data.success) {
                    setComparison(data.data)
                } else {
                    console.error('Failed to fetch comparison:', data.error)
                    setComparison(null)
                }
            } catch (error) {
                console.error('Error fetching comparison:', error)
                setComparison(null)
            } finally {
                setLoading(false)
            }
        }

        if (selectedRecipeId) {
            fetchComparison()
        }
    }, [selectedRecipeId, period])

    return (
        <div className="space-y-4">
            {/* Period selector */}
            <div className="flex gap-2">
                {(['7d', '30d', '90d', '1y'] as TimePeriod[]).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-4 py-2 rounded ${period === p
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground'
                            }`}
                    >
                        {p === '7d' && '7 Hari'}
                        {p === '30d' && '30 Hari'}
                        {p === '90d' && '90 Hari'}
                        {p === '1y' && '1 Tahun'}
                    </button>
                ))}
            </div>

            {/* Comparison Card */}
            <HPPComparisonCard
                comparison={comparison}
                loading={loading}
                recipeName="Nama Produk"
                period={period}
            />
        </div>
    )
}

/**
 * Integration with TanStack Query (Recommended)
 * 
 * For better data management, use TanStack Query:
 */

/*
import { useQuery } from '@tanstack/react-query'

function useHPPComparison(recipeId: string, period: TimePeriod) {
  return useQuery({
    queryKey: ['hpp-comparison', recipeId, period],
    queryFn: async () => {
      const response = await fetch(
        `/api/hpp/comparison?recipe_id=${recipeId}&period=${period}`
      )
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error)
      }
      return data.data as HPPComparison
    },
    enabled: !!recipeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function HPPComparisonCardWithQuery({ recipeId, period }: { recipeId: string, period: TimePeriod }) {
  const { data: comparison, isLoading } = useHPPComparison(recipeId, period)

  return (
    <HPPComparisonCard
      comparison={comparison || null}
      loading={isLoading}
      recipeName="Nama Produk"
      period={period}
    />
  )
}
*/
