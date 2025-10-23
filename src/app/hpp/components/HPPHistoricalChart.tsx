'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { CardSkeleton } from '@/components/ui'
import { useResponsive } from '@/hooks/useResponsive'
import { useCurrency } from '@/hooks/useCurrency'
import { cn } from '@/lib/utils'
import type { HPPSnapshot, TimePeriod } from '@/types/hpp-tracking'
import {
    AlertCircle,
    Calendar,
    Minus,
    TrendingDown,
    TrendingUp
} from 'lucide-react'
import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
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

interface HPPHistoricalChartProps {
    recipeId?: string
    recipeName?: string
    className?: string
    recipes?: Array<{ id: string; name: string }>
    multiSelect?: boolean
}

// Period filter options - using utility function
const PERIOD_OPTIONS: Array<{ value: TimePeriod; label: string }> = [
    { value: '7d', label: '7 Hari' },
    { value: '30d', label: '30 Hari' },
    { value: '90d', label: '90 Hari' },
    { value: '1y', label: '1 Tahun' }
]

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

export default function HPPHistoricalChart({
    recipeId,
    recipeName,
    className,
    recipes = [],
    multiSelect = false
}: HPPHistoricalChartProps) {
    const { isMobile } = useResponsive()
    const { formatCurrency } = useCurrency()
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [snapshots, setSnapshots] = useState<HPPSnapshot[]>([])

    // Multi-select state
    const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>(
        recipeId ? [recipeId] : []
    )
    const [multiProductData, setMultiProductData] = useState<Record<string, HPPSnapshot[]>>({})
    const [visibleProducts, setVisibleProducts] = useState<Set<string>>(new Set())

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

            // Initialize visible products
            setVisibleProducts(new Set(recipeIds))
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

    // Format chart data for single product
    const chartData = useMemo(() => {
        if (multiSelect) {
            // For multi-product, we need to merge data by date
            const dateMap = new Map<string, any>()

            Object.entries(multiProductData).forEach(([recipeId, snapshots]) => {
                const recipe = recipes.find(r => r.id === recipeId)
                const recipeName = recipe?.name || recipeId

                snapshots.forEach(snapshot => {
                    const dateKey = new Date(snapshot.snapshot_date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short'
                    })

                    if (!dateMap.has(dateKey)) {
                        dateMap.set(dateKey, { date: dateKey, fullDate: snapshot.snapshot_date })
                    }

                    const entry = dateMap.get(dateKey)
                    entry[recipeId] = snapshot.hpp_value
                    entry[`${recipeId}_name`] = recipeName
                })
            })

            return Array.from(dateMap.values()).sort((a, b) =>
                new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
            )
        }

        return snapshots.map(snapshot => ({
            date: new Date(snapshot.snapshot_date).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short'
            }),
            hpp: snapshot.hpp_value,
            material: snapshot.material_cost,
            operational: snapshot.operational_cost,
            fullDate: snapshot.snapshot_date
        }))
    }, [snapshots, multiSelect, multiProductData, recipes])

    // Calculate statistics
    const stats = useMemo(() => {
        if (multiSelect) {
            // For multi-product, calculate stats across all products
            const allValues: number[] = []
            Object.values(multiProductData).forEach(snapshots => {
                allValues.push(...snapshots.map(s => s.hpp_value))
            })

            if (allValues.length === 0) {
                return { min: 0, max: 0, avg: 0, trend: 'neutral' as const }
            }

            const min = Math.min(...allValues)
            const max = Math.max(...allValues)
            const avg = allValues.reduce((a, b) => a + b, 0) / allValues.length

            return { min, max, avg, trend: 'neutral' as const }
        }

        if (snapshots.length === 0) {
            return { min: 0, max: 0, avg: 0, trend: 'neutral' as const }
        }

        const values = snapshots.map(s => s.hpp_value)
        const min = Math.min(...values)
        const max = Math.max(...values)
        const avg = values.reduce((a, b) => a + b, 0) / values.length

        // Calculate trend
        let trend: 'up' | 'down' | 'neutral' = 'neutral'
        if (snapshots.length >= 2) {
            const first = snapshots[snapshots.length - 1].hpp_value
            const last = snapshots[0].hpp_value
            const change = ((last - first) / first) * 100

            if (change > 5) trend = 'up'
            else if (change < -5) trend = 'down'
        }

        return { min, max, avg, trend }
    }, [snapshots, multiSelect, multiProductData])

    // Custom tooltip - optimized for touch devices
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={cn(
                    "bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg",
                    isMobile ? "p-3 min-w-[180px]" : "p-3 min-w-[200px]"
                )}>
                    <div className={cn(
                        "font-medium text-foreground mb-2 border-b pb-2",
                        isMobile ? "text-sm" : "text-base"
                    )}>
                        {label}
                    </div>
                    <div className="space-y-1">
                        {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={cn(
                                            "rounded-full",
                                            isMobile ? "w-3 h-3" : "w-3 h-3"
                                        )}
                                        style={{ backgroundColor: entry.color }}
                                    />
                                    <span className={cn(
                                        "text-muted-foreground",
                                        isMobile ? "text-xs" : "text-sm"
                                    )}>
                                        {entry.name}
                                    </span>
                                </div>
                                <span className={cn(
                                    "font-medium text-foreground",
                                    isMobile ? "text-xs" : "text-sm"
                                )}>
                                    {formatCurrency(entry.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
        return null
    }

    // Render loading state
    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Loading...</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardSkeleton rows={6} />
                </CardContent>
            </Card>
        )
    }

    // Render error state
    if (error) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Tren HPP Historical</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <Button
                        onClick={() => fetchSnapshots(selectedPeriod)}
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
    if (snapshots.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Tren HPP Historical</CardTitle>
                    <CardDescription>
                        {recipeName && `Data historical untuk ${recipeName}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">Belum Ada Data Historical</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            Data snapshot HPP akan tersedia setelah sistem melakukan pencatatan otomatis.
                            Snapshot dibuat setiap hari pada pukul 00:00.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Get trend icon and color
    const getTrendIcon = () => {
        switch (stats.trend) {
            case 'up':
                return <TrendingUp className="h-4 w-4" />
            case 'down':
                return <TrendingDown className="h-4 w-4" />
            default:
                return <Minus className="h-4 w-4" />
        }
    }

    const getTrendColor = () => {
        switch (stats.trend) {
            case 'up':
                return 'destructive'
            case 'down':
                return 'default'
            default:
                return 'secondary'
        }
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            Tren HPP Historical
                            <Badge variant={getTrendColor()} className="flex items-center gap-1">
                                {getTrendIcon()}
                                {stats.trend === 'up' ? 'Naik' : stats.trend === 'down' ? 'Turun' : 'Stabil'}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            {recipeName && `Grafik perubahan HPP untuk ${recipeName}`}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Multi-Select Recipe Selector */}
                {multiSelect && recipes.length > 0 && (
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Pilih Produk (Maksimal 5)</Label>
                        <div className={cn(
                            "grid gap-3",
                            isMobile ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3"
                        )}>
                            {recipes.slice(0, 10).map(recipe => (
                                <div key={recipe.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={recipe.id}
                                        checked={selectedRecipeIds.includes(recipe.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                if (selectedRecipeIds.length < 5) {
                                                    setSelectedRecipeIds([...selectedRecipeIds, recipe.id])
                                                }
                                            } else {
                                                setSelectedRecipeIds(selectedRecipeIds.filter(id => id !== recipe.id))
                                            }
                                        }}
                                        disabled={!selectedRecipeIds.includes(recipe.id) && selectedRecipeIds.length >= 5}
                                    />
                                    <Label
                                        htmlFor={recipe.id}
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        {recipe.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {selectedRecipeIds.length >= 5 && (
                            <p className="text-xs text-muted-foreground">
                                Maksimal 5 produk dapat dipilih untuk perbandingan
                            </p>
                        )}
                    </div>
                )}

                {/* Product Toggle Buttons (for hiding/showing lines) */}
                {multiSelect && selectedRecipeIds.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedRecipeIds.map((recipeId, index) => {
                            const recipe = recipes.find(r => r.id === recipeId)
                            const isVisible = visibleProducts.has(recipeId)
                            return (
                                <Button
                                    key={recipeId}
                                    variant={isVisible ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        const newVisible = new Set(visibleProducts)
                                        if (isVisible) {
                                            newVisible.delete(recipeId)
                                        } else {
                                            newVisible.add(recipeId)
                                        }
                                        setVisibleProducts(newVisible)
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: MULTI_PRODUCT_COLORS[index % MULTI_PRODUCT_COLORS.length] }}
                                    />
                                    {recipe?.name || recipeId}
                                </Button>
                            )
                        })}
                    </div>
                )}

                {/* Period Filter Buttons */}
                <div className={cn(
                    "flex gap-2",
                    isMobile && "overflow-x-auto pb-2"
                )}>
                    {PERIOD_OPTIONS.map(option => (
                        <Button
                            key={option.value}
                            variant={selectedPeriod === option.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                                setSelectedPeriod(option.value)
                                if (multiSelect) {
                                    fetchMultiProductSnapshots(option.value, selectedRecipeIds)
                                } else {
                                    fetchSnapshots(option.value)
                                }
                            }}
                            className={cn(
                                "whitespace-nowrap",
                                isMobile && "flex-shrink-0"
                            )}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>

                {/* Chart */}
                <div className={cn(
                    "w-full",
                    isMobile ? "h-[250px]" : "h-[300px]"
                )}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
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

                {/* Statistics */}
                <div className={cn(
                    "grid gap-3 grid-cols-3",
                    isMobile && "gap-2"
                )}>
                    <div className={cn(
                        "space-y-1 text-center bg-muted/50 rounded-lg",
                        isMobile ? "p-2" : "p-3"
                    )}>
                        <p className="text-xs text-muted-foreground">Minimum</p>
                        <p className={cn(
                            "font-semibold",
                            isMobile ? "text-xs" : "text-sm"
                        )}>{formatCurrency(stats.min)}</p>
                    </div>
                    <div className={cn(
                        "space-y-1 text-center bg-muted/50 rounded-lg",
                        isMobile ? "p-2" : "p-3"
                    )}>
                        <p className="text-xs text-muted-foreground">Rata-rata</p>
                        <p className={cn(
                            "font-semibold",
                            isMobile ? "text-xs" : "text-sm"
                        )}>{formatCurrency(stats.avg)}</p>
                    </div>
                    <div className={cn(
                        "space-y-1 text-center bg-muted/50 rounded-lg",
                        isMobile ? "p-2" : "p-3"
                    )}>
                        <p className="text-xs text-muted-foreground">Maksimum</p>
                        <p className={cn(
                            "font-semibold",
                            isMobile ? "text-xs" : "text-sm"
                        )}>{formatCurrency(stats.max)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
