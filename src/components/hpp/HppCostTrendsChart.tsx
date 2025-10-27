'use client'

import { useMemo } from 'react'
import { useCurrency } from '@/hooks/useCurrency'
import { uiLogger } from '@/lib/logger'

interface CostTrendData {
  date: string
  averageHpp: number
  totalRecipes: number
}

interface HppCostTrendsChartProps {
  data: CostTrendData[]
  height?: number
}

export const HppCostTrendsChart = ({ data, height = 300 }: HppCostTrendsChartProps) => {
  const { formatCurrency } = useCurrency()

  const processedData = useMemo(() => {
    if (!data || data.length === 0) {return []}

    // Sort by date
    const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate min/max for scaling
    const hppValues = sorted.map(d => d.averageHpp)
    const minHpp = Math.min(...hppValues)
    const maxHpp = Math.max(...hppValues)
    const hppRange = maxHpp - minHpp || 1

    const recipeCounts = sorted.map(d => d.totalRecipes)
    const maxRecipes = Math.max(...recipeCounts)

    return sorted.map((item, index) => ({
      ...item,
      x: (index / (sorted.length - 1)) * 100,
      y: ((item.averageHpp - minHpp) / hppRange) * 80 + 10, // 10-90% range for padding
      recipeBarHeight: (item.totalRecipes / maxRecipes) * 40 // Max 40px height
    }))
  }, [data])

  if (!processedData || processedData.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed"
        style={{ height }}
      >
        <div className="text-center text-muted-foreground">
          <p>No trend data available</p>
          <p className="text-sm mt-1">Data will appear as snapshots are created</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* SVG Chart */}
      <div className="relative bg-muted/30 rounded-lg p-4" style={{ height }}>
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.1" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Y-axis labels */}
          <text x="2" y="10" className="text-xs fill-muted-foreground" textAnchor="start">
            {formatCurrency(Math.max(...processedData.map(d => d.averageHpp)))}
          </text>
          <text x="2" y="50" className="text-xs fill-muted-foreground" textAnchor="start">
            {formatCurrency(processedData[Math.floor(processedData.length / 2)]?.averageHpp || 0)}
          </text>
          <text x="2" y="90" className="text-xs fill-muted-foreground" textAnchor="start">
            {formatCurrency(Math.min(...processedData.map(d => d.averageHpp)))}
          </text>

          {/* HPP Line */}
          {processedData.length > 1 && (
            <polyline
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="0.3"
              points={processedData.map(d => `${d.x},${100 - d.y}`).join(' ')}
            />
          )}

          {/* HPP Data Points */}
          {processedData.map((point, index) => (
            <circle
              key={`hpp-${index}`}
              cx={point.x}
              cy={100 - point.y}
              r="0.8"
              fill="hsl(var(--primary))"
              className="hover:r-1.2 transition-all cursor-pointer"
            />
          ))}

          {/* Recipe Count Bars */}
          {processedData.map((point, index) => (
            <rect
              key={`recipes-${index}`}
              x={point.x - 0.3}
              y={95 - point.recipeBarHeight}
              width="0.6"
              height={point.recipeBarHeight}
              fill="hsl(var(--muted-foreground))"
              opacity="0.6"
              className="hover:opacity-1 transition-opacity"
            />
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute top-2 right-2 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-primary" />
            <span className="text-muted-foreground">HPP Trend</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-muted-foreground opacity-60" />
            <span className="text-muted-foreground">Recipe Count</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-semibold text-primary">
            {formatCurrency(processedData[processedData.length - 1]?.averageHpp || 0)}
          </div>
          <div className="text-xs text-muted-foreground">Latest HPP</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-muted-foreground">
            {processedData.length}
          </div>
          <div className="text-xs text-muted-foreground">Data Points</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-muted-foreground">
            {processedData.reduce((sum, d) => sum + d.totalRecipes, 0)}
          </div>
          <div className="text-xs text-muted-foreground">Total Recipes</div>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-muted-foreground px-4">
        <span>{processedData[0]?.date ? new Date(processedData[0].date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
        <span>Mid Period</span>
        <span>{processedData[processedData.length - 1]?.date ? new Date(processedData[processedData.length - 1].date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
      </div>
    </div>
  )
}
