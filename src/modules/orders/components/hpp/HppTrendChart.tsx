'use client'

import { useState, useEffect } from 'react'
import { dbLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase-generated'

const supabase = createClient()

type HppSnapshot = Database['public']['Tables']['hpp_snapshots']['Row']

interface HppTrendChartProps {
  recipeId: string
  days?: number
  height?: number
}

export const HppTrendChart = ({ recipeId, days = 30, height = 300 }: HppTrendChartProps) => {
  const [snapshots, setSnapshots] = useState<HppSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadSnapshots()
  }, [recipeId, days])

  const loadSnapshots = async () => {
    try {
      void setLoading(true)
      void setError(null)

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startDateStr = startDate.toISOString().split('T')[0]

      const { data, error: fetchError } = await supabase
        .from('hpp_snapshots')
        .select('*')
        .eq('recipe_id', recipeId)
        .gte('snapshot_date', startDateStr)
        .order('snapshot_date', { ascending: true })

      if (fetchError) {
        throw new Error(`Failed to load HPP snapshots: ${fetchError.message}`)
      }

      void setSnapshots(data || [])
      dbLogger.info(`Loaded ${data?.length || 0} HPP snapshots for recipe ${recipeId}`)

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      void setError(errorMessage)
      dbLogger.error({ err, recipeId }, 'Failed to load HPP trend data')
    } finally {
      void setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2 text-gray-600">Loading HPP trend...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center text-red-600" style={{ height }}>
        <span>Error: {error}</span>
      </div>
    )
  }

  if (snapshots.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-500" style={{ height }}>
        <span>No HPP data available for the selected period</span>
      </div>
    )
  }

  // Calculate chart dimensions and data
  const values = snapshots.map(s => s.hpp_value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue || 1

  const dates = snapshots.map(s => new Date(s.snapshot_date).toLocaleDateString())

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">HPP Trend (Last {days} days)</h3>

      <div className="relative" style={{ height: height - 80 }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-500">
          <span>Rp {maxValue.toLocaleString()}</span>
          <span>Rp {((maxValue + minValue) / 2).toLocaleString()}</span>
          <span>Rp {minValue.toLocaleString()}</span>
        </div>

        {/* Chart area */}
        <div className="ml-20 mr-4 relative" style={{ height: '100%' }}>
          {/* Grid lines */}
          <div className="absolute inset-0">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <div
                key={i}
                className="absolute w-full border-t border-gray-200"
                style={{ top: `${ratio * 100}%` }}
              />
            ))}
          </div>

          {/* Data points and line */}
          <svg className="absolute inset-0 w-full h-full">
            {/* Line connecting points */}
            {snapshots.length > 1 && (
              <polyline
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                points={
                  snapshots.map((snapshot, index) => {
                    const x = (index / (snapshots.length - 1)) * 100
                    const y = 100 - ((snapshot.hpp_value - minValue) / range) * 100
                    return `${x},${y}`
                  }).join(' ')
                }
              />
            )}

            {/* Data points */}
            {snapshots.map((snapshot, index) => {
              const x = (index / (snapshots.length - 1)) * 100
              const y = 100 - ((snapshot.hpp_value - minValue) / range) * 100
              const isIncrease = snapshot.change_percentage && snapshot.change_percentage > 0
              const isDecrease = snapshot.change_percentage && snapshot.change_percentage < 0

              return (
                <circle
                  key={index}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill={isIncrease ? '#EF4444' : isDecrease ? '#10B981' : '#6B7280'}
                  className="cursor-pointer hover:r-6 transition-all"
                />
              )
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-20 right-4 flex justify-between text-xs text-gray-500">
          {dates.filter((_, i) => i % Math.ceil(dates.length / 5) === 0).map((date, i) => (
            <span key={i}>{date}</span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center mt-4 space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
          <span>Increase</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
          <span>Decrease</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-500 rounded-full mr-2" />
          <span>No Change</span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-600">
            Rp {snapshots[snapshots.length - 1]?.hpp_value.toLocaleString() || 0}
          </div>
          <div className="text-sm text-gray-600">Current HPP</div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${(snapshots[snapshots.length - 1]?.change_percentage || 0) >= 0 ? 'text-red-600' : 'text-green-600'
            }`}>
            {snapshots[snapshots.length - 1]?.change_percentage ?
              `${snapshots[snapshots.length - 1]?.change_percentage! > 0 ? '+' : ''}${snapshots[snapshots.length - 1]?.change_percentage?.toFixed(1)}%` :
              'N/A'
            }
          </div>
          <div className="text-sm text-gray-600">Change</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">
            Rp {(maxValue - minValue).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Range</div>
        </div>
      </div>
    </div>
  )
}
