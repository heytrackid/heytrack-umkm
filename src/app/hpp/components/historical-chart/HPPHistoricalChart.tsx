'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import type { HPPSnapshot, TimePeriod } from '@/types/hpp-tracking'

// Import modular components and hooks
import { useHPPSnapshotsData } from './useHPPSnapshotsData'
import { useMultiSelectState } from './useMultiSelectState'
import {
    PERIOD_OPTIONS,
    formatSingleProductChartData,
    formatMultiProductChartData,
    calculateSingleProductStats,
    calculateMultiProductStats,
    getTrendIcon,
    getTrendColor,
    getTrendLabel,
    type ChartStatistics,
    type ChartDataPoint
} from './chartUtils'
import { LoadingState, ErrorState, EmptyState } from './ChartStates'
import { ProductSelector } from './ProductSelector'
import { PeriodFilter } from './PeriodFilter'
import { ChartRenderer } from './ChartRenderer'
import { StatisticsDisplay } from './StatisticsDisplay'

interface HPPHistoricalChartProps {
    recipeId?: string
    recipeName?: string
    className?: string
    recipes?: Array<{ id: string; name: string }>
    multiSelect?: boolean
}

export default function HPPHistoricalChart({
    recipeId,
    recipeName,
    className,
    recipes = [],
    multiSelect = false
}: HPPHistoricalChartProps) {
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d')

    // Multi-select state
    const {
        selectedRecipeIds,
        visibleProducts,
        toggleRecipeSelection,
        toggleProductVisibility,
        initializeVisibleProducts,
        canSelectMore
    } = useMultiSelectState({
        initialRecipeIds: recipeId ? [recipeId] : []
    })

    // Data fetching
    const {
        snapshots,
        multiProductData,
        loading,
        error,
        fetchSnapshots,
        fetchMultiProductSnapshots
    } = useHPPSnapshotsData({
        recipeId,
        selectedPeriod,
        multiSelect,
        selectedRecipeIds
    })

    // Initialize visible products when multi-product data is loaded
    if (multiSelect && Object.keys(multiProductData).length > 0 && visibleProducts.size === 0) {
        initializeVisibleProducts(selectedRecipeIds)
    }

    // Format chart data
    const chartData: ChartDataPoint[] = multiSelect
        ? formatMultiProductChartData(multiProductData, recipes)
        : formatSingleProductChartData(snapshots)

    // Calculate statistics
    const stats: ChartStatistics = multiSelect
        ? calculateMultiProductStats(multiProductData)
        : calculateSingleProductStats(snapshots)

    // Handle period change
    const handlePeriodChange = (period: TimePeriod) => {
        setSelectedPeriod(period)
        if (multiSelect) {
            fetchMultiProductSnapshots(period, selectedRecipeIds)
        } else {
            fetchSnapshots(period)
        }
    }

    // Render loading state
    if (loading) {
        return <LoadingState className={className} />
    }

    // Render error state
    if (error) {
        return (
            <ErrorState
                className={className}
                error={error}
                selectedPeriod={selectedPeriod}
                onRetry={() => fetchSnapshots(selectedPeriod)}
            />
        )
    }

    // Render empty state
    if (snapshots.length === 0 && Object.keys(multiProductData).length === 0) {
        return <EmptyState className={className} recipeName={recipeName} />
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            Tren HPP Historical
                            <Badge variant={getTrendColor(stats.trend)} className="flex items-center gap-1">
                                {getTrendIcon(stats.trend) === 'trending-up' && <TrendingUp className="h-4 w-4" />}
                                {getTrendIcon(stats.trend) === 'trending-down' && <TrendingDown className="h-4 w-4" />}
                                {getTrendIcon(stats.trend) === 'minus' && <Minus className="h-4 w-4" />}
                                {getTrendLabel(stats.trend)}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            {recipeName && `Grafik perubahan HPP untuk ${recipeName}`}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Multi-Select Product Selector */}
                {multiSelect && recipes.length > 0 && (
                    <ProductSelector
                        recipes={recipes}
                        selectedRecipeIds={selectedRecipeIds}
                        visibleProducts={visibleProducts}
                        onRecipeToggle={toggleRecipeSelection}
                        onVisibilityToggle={toggleProductVisibility}
                        canSelectMore={canSelectMore}
                    />
                )}

                {/* Period Filter */}
                <PeriodFilter
                    selectedPeriod={selectedPeriod}
                    onPeriodChange={handlePeriodChange}
                    options={PERIOD_OPTIONS}
                />

                {/* Chart */}
                <ChartRenderer
                    data={chartData}
                    multiSelect={multiSelect}
                    selectedRecipeIds={selectedRecipeIds}
                    visibleProducts={visibleProducts}
                    recipes={recipes}
                />

                {/* Statistics */}
                <StatisticsDisplay stats={stats} />
            </CardContent>
        </Card>
    )
}
