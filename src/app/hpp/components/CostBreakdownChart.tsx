'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CardSkeleton } from '@/components/ui'
import { useResponsive } from '@/hooks/useResponsive'
import { useCurrency } from '@/hooks/useCurrency'
import { cn } from '@/lib/utils'
import type { IngredientCost, OperationalCost } from '@/types/hpp-tracking'
import {
    AlertCircle,
    ChevronDown,
    ChevronUp,
    PieChart as PieChartIcon,
    TrendingUp
} from 'lucide-react'
import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Sector,
    Tooltip
} from 'recharts'

interface CostBreakdownChartProps {
    recipeId: string
    recipeName?: string
    date?: string
    className?: string
}

// Chart colors
const CHART_COLORS = {
    material: '#10b981',
    operational: '#f59e0b'
}

const INGREDIENT_COLORS = [
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#06b6d4',
    '#84cc16',
    '#f97316'
]

interface BreakdownData {
    total_hpp: number
    material_cost: number
    operational_cost: number
    breakdown: {
        ingredients: Array<IngredientCost & {
            previous_cost?: number
            change_percentage?: number
            has_significant_change?: boolean
        }>
        operational: OperationalCost[]
        all_ingredients: IngredientCost[]
    }
    snapshot_date: string
}

export default function CostBreakdownChart({
    recipeId,
    recipeName,
    date,
    className
}: CostBreakdownChartProps) {
    const { isMobile } = useResponsive()
    const { formatCurrency } = useCurrency()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<BreakdownData | null>(null)
    const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
    const [selectedSegment, setSelectedSegment] = useState<'material' | 'operational' | null>(null)
    const [showAllIngredients, setShowAllIngredients] = useState(false)

    // Fetch breakdown data
    const fetchBreakdown = async () => {
        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({ recipe_id: recipeId })
            if (date) params.append('date', date)

            const response = await fetch(`/api/hpp/breakdown?${params}`)

            if (!response.ok) {
                throw new Error('Failed to fetch cost breakdown')
            }

            const result = await response.json()
            setData(result.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            setData(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (recipeId) {
            fetchBreakdown()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recipeId, date])

    // Prepare pie chart data for material vs operational
    const pieData = useMemo(() => {
        if (!data) return []

        return [
            {
                name: 'Biaya Bahan',
                value: data.material_cost,
                percentage: (data.material_cost / data.total_hpp) * 100,
                color: CHART_COLORS.material
            },
            {
                name: 'Biaya Operasional',
                value: data.operational_cost,
                percentage: (data.operational_cost / data.total_hpp) * 100,
                color: CHART_COLORS.operational
            }
        ]
    }, [data])

    // Custom active shape for pie chart
    const renderActiveShape = (props: any) => {
        const {
            cx,
            cy,
            innerRadius,
            outerRadius,
            startAngle,
            endAngle,
            fill,
            payload,
            percent
        } = props

        return (
            <g>
                <text x={cx} y={cy} dy={-10} textAnchor="middle" fill={fill} className="font-semibold text-sm">
                    {payload.name}
                </text>
                <text x={cx} y={cy} dy={15} textAnchor="middle" fill={fill} className="text-xl font-bold">
                    {`${(percent * 100).toFixed(1)}%`}
                </text>
                <text x={cx} y={cy} dy={35} textAnchor="middle" fill="currentColor" className="text-xs text-muted-foreground">
                    {formatCurrency(payload.value)}
                </text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 10}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
            </g>
        )
    }

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 min-w-[180px]">
                    <div className="font-medium text-foreground mb-2 border-b pb-2">
                        {data.name}
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between gap-3">
                            <span className="text-sm text-muted-foreground">Nilai:</span>
                            <span className="text-sm font-medium">{formatCurrency(data.value)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-sm text-muted-foreground">Persentase:</span>
                            <span className="text-sm font-medium">{data.percentage.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            )
        }
        return null
    }

    // Handle pie click
    const onPieClick = (data: any, index: number) => {
        setActiveIndex(index)
        setSelectedSegment(index === 0 ? 'material' : 'operational')
    }

    // Render loading state
    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Loading...</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardSkeleton rows={5} />
                </CardContent>
            </Card>
        )
    }

    // Render error state
    if (error) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Breakdown Biaya HPP</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <Button
                        onClick={fetchBreakdown}
                        className="mt-4"
                        variant="outline"
                    >
                        Coba Lagi
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // Render empty state
    if (!data) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Breakdown Biaya HPP</CardTitle>
                    <CardDescription>
                        {recipeName && `Detail biaya untuk ${recipeName}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <PieChartIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">Belum Ada Data</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            Data breakdown biaya belum tersedia untuk produk ini.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Breakdown Biaya HPP
                </CardTitle>
                <CardDescription>
                    {recipeName && `Komposisi biaya untuk ${recipeName}`}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Total HPP Display */}
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total HPP</p>
                    <p className="text-2xl font-bold">{formatCurrency(data.total_hpp)}</p>
                </div>

                {/* Pie Chart */}
                <div className={cn(
                    "w-full",
                    isMobile ? "h-[280px]" : "h-[320px]"
                )}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                {...(activeIndex !== undefined && {
                                    activeIndex,
                                    activeShape: renderActiveShape
                                })}
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={isMobile ? 60 : 80}
                                outerRadius={isMobile ? 90 : 110}
                                fill="#8884d8"
                                dataKey="value"
                                onClick={onPieClick}
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(undefined)}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        className="cursor-pointer hover:opacity-80 transition-opacity"
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Top 5 Ingredients */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">Top 5 Bahan Termahal</h3>
                        {selectedSegment === 'material' && (
                            <Badge variant="outline" className="text-xs">
                                Detail Biaya Bahan
                            </Badge>
                        )}
                    </div>

                    <div className="space-y-2">
                        {data.breakdown.ingredients.map((ingredient, index) => (
                            <div
                                key={ingredient.id}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                                    ingredient.has_significant_change
                                        ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                                        : "bg-muted/30 hover:bg-muted/50"
                                )}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: INGREDIENT_COLORS[index % INGREDIENT_COLORS.length] }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm truncate">
                                                {ingredient.name}
                                            </p>
                                            {ingredient.has_significant_change && (
                                                <Badge variant="destructive" className="text-xs flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3" />
                                                    {ingredient.change_percentage && `+${ingredient.change_percentage.toFixed(1)}%`}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {ingredient.percentage.toFixed(1)}% dari total HPP
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-sm">
                                        {formatCurrency(ingredient.cost)}
                                    </p>
                                    {ingredient.previous_cost && ingredient.previous_cost !== ingredient.cost && (
                                        <p className="text-xs text-muted-foreground line-through">
                                            {formatCurrency(ingredient.previous_cost)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Expandable Full Ingredient List */}
                {data.breakdown.all_ingredients.length > 5 && (
                    <Collapsible open={showAllIngredients} onOpenChange={setShowAllIngredients}>
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full" size="sm">
                                {showAllIngredients ? (
                                    <>
                                        <ChevronUp className="h-4 w-4 mr-2" />
                                        Sembunyikan Semua Bahan
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4 mr-2" />
                                        Lihat Semua Bahan ({data.breakdown.all_ingredients.length})
                                    </>
                                )}
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 mt-3">
                            {data.breakdown.all_ingredients.slice(5).map((ingredient, index) => (
                                <div
                                    key={ingredient.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: INGREDIENT_COLORS[(index + 5) % INGREDIENT_COLORS.length] }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">
                                                {ingredient.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {ingredient.percentage.toFixed(1)}% dari total HPP
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-sm">
                                        {formatCurrency(ingredient.cost)}
                                    </p>
                                </div>
                            ))}
                        </CollapsibleContent>
                    </Collapsible>
                )}

                {/* Operational Costs Detail */}
                {selectedSegment === 'operational' && data.breakdown.operational.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">Detail Biaya Operasional</h3>
                            <Badge variant="outline" className="text-xs">
                                Breakdown
                            </Badge>
                        </div>

                        <div className="space-y-2">
                            {data.breakdown.operational.map((cost, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-sm capitalize">
                                            {cost.category.replace('_', ' ')}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {cost.percentage.toFixed(1)}% dari total HPP
                                        </p>
                                    </div>
                                    <p className="font-semibold text-sm">
                                        {formatCurrency(cost.cost)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
