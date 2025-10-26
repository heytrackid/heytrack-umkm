'use client'

import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
import type { ChartDataPoint } from './chartUtils'
import { CustomTooltip } from './CustomTooltip'

interface ChartRendererProps {
    data: ChartDataPoint[]
    multiSelect: boolean
    selectedRecipeIds: string[]
    visibleProducts: Set<string>
    recipes: Array<{ id: string; name: string }>
}

export function ChartRenderer({
    data,
    multiSelect,
    selectedRecipeIds,
    visibleProducts,
    recipes
}: ChartRendererProps) {
    const { isMobile } = useResponsive()

    // Chart colors for single product
    const CHART_COLORS = {
        hpp: '#3b82f6',
        material: '#10b981',
        operational: '#f59e0b'
    }

    // Colors for multi-product comparison
    const MULTI_PRODUCT_COLORS = [
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // orange
        '#ef4444', // red
        '#8b5cf6'  // purple
    ]

    return (
        <div className={cn(
            "w-full",
            isMobile ? "h-[250px]" : "h-[300px]"
        )}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: isMobile ? 10 : 30,
                        left: isMobile ? 10 : 20,
                        bottom: 5
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                        dataKey="date"
                        className="text-xs"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                    />
                    <YAxis
                        className="text-xs"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                        width={isMobile ? 50 : 70}
                        tickFormatter={(value) => {
                            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                            return value.toString()
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                    />

                    {/* Render lines based on mode */}
                    {multiSelect ? (
                        // Multi-product mode: render a line for each selected product
                        selectedRecipeIds.map((recipeId, index) => {
                            if (!visibleProducts.has(recipeId)) return null
                            const recipe = recipes.find(r => r.id === recipeId)
                            const color = MULTI_PRODUCT_COLORS[index % MULTI_PRODUCT_COLORS.length]

                            return (
                                <Line
                                    key={recipeId}
                                    type="monotone"
                                    dataKey={recipeId}
                                    stroke={color}
                                    strokeWidth={isMobile ? 2 : 3}
                                    dot={{ fill: color, strokeWidth: 0, r: isMobile ? 3 : 4 }}
                                    activeDot={{ r: isMobile ? 5 : 6, strokeWidth: 0 }}
                                    name={recipe?.name || recipeId}
                                />
                            )
                        })
                    ) : (
                        // Single product mode: render HPP, material, and operational lines
                        <>
                            <Line
                                type="monotone"
                                dataKey="hpp"
                                stroke={CHART_COLORS.hpp}
                                strokeWidth={isMobile ? 2 : 3}
                                dot={{ fill: CHART_COLORS.hpp, strokeWidth: 0, r: isMobile ? 3 : 4 }}
                                activeDot={{ r: isMobile ? 5 : 6, strokeWidth: 0 }}
                                name="Total HPP"
                            />
                            <Line
                                type="monotone"
                                dataKey="material"
                                stroke={CHART_COLORS.material}
                                strokeWidth={isMobile ? 2 : 3}
                                dot={{ fill: CHART_COLORS.material, strokeWidth: 0, r: isMobile ? 3 : 4 }}
                                activeDot={{ r: isMobile ? 5 : 6, strokeWidth: 0 }}
                                name="Biaya Bahan"
                            />
                            <Line
                                type="monotone"
                                dataKey="operational"
                                stroke={CHART_COLORS.operational}
                                strokeWidth={isMobile ? 2 : 3}
                                dot={{ fill: CHART_COLORS.operational, strokeWidth: 0, r: isMobile ? 3 : 4 }}
                                activeDot={{ r: isMobile ? 5 : 6, strokeWidth: 0 }}
                                name="Biaya Operasional"
                            />
                        </>
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
