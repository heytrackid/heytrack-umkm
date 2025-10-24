'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CardSkeleton } from '@/components/ui'
import { useCurrency } from '@/hooks/useCurrency'
import { cn } from '@/lib/utils'
import { HPPComparison } from '@/types/hpp-tracking'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'

interface HPPComparisonCardProps {
    comparison: HPPComparison | null
    loading?: boolean
    recipeName?: string
    period?: string
}

export default function HPPComparisonCard({
    comparison,
    loading = false,
    recipeName,
    period = '30d'
}: HPPComparisonCardProps) {
    const { formatCurrency } = useCurrency()

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Perbandingan Periode</CardTitle>
                    <CardDescription>Membandingkan HPP periode saat ini dengan periode sebelumnya</CardDescription>
                </CardHeader>
                <CardContent>
                    <CardSkeleton rows={4} />
                </CardContent>
            </Card>
        )
    }

    if (!comparison) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Perbandingan Periode</CardTitle>
                    <CardDescription>Membandingkan HPP periode saat ini dengan periode sebelumnya</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Data perbandingan tidak tersedia. Pastikan ada data snapshot untuk periode yang dipilih.
                    </p>
                </CardContent>
            </Card>
        )
    }

    const { current_period, previous_period, change } = comparison

    // Determine trend indicator properties
    const getTrendIndicator = () => {
        if (change.trend === 'up') {
            return {
                icon: ArrowUp,
                color: 'text-red-600 dark:text-red-500',
                bgColor: 'bg-red-50 dark:bg-red-950/30',
                borderColor: 'border-red-200 dark:border-red-900',
                label: 'Naik'
            }
        } else if (change.trend === 'down') {
            return {
                icon: ArrowDown,
                color: 'text-green-600 dark:text-green-500',
                bgColor: 'bg-green-50 dark:bg-green-950/30',
                borderColor: 'border-green-200 dark:border-green-900',
                label: 'Turun'
            }
        } else {
            return {
                icon: Minus,
                color: 'text-gray-600 dark:text-gray-400',
                bgColor: 'bg-gray-50 dark:bg-gray-950/30',
                borderColor: 'border-gray-200 dark:border-gray-800',
                label: 'Stabil'
            }
        }
    }

    const trendIndicator = getTrendIndicator()
    const TrendIcon = trendIndicator.icon

    // Use utility function for period label
    const periodLabel = getUtilPeriodLabel(period)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Perbandingan Periode</CardTitle>
                <CardDescription>
                    {recipeName ? `HPP ${recipeName} - ` : ''}
                    Periode {periodLabel}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current vs Previous Period */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Current Period */}
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Periode Saat Ini</p>
                        <p className="text-2xl font-bold">
                            {formatCurrency(current_period.avg_hpp)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Rata-rata HPP
                        </p>
                    </div>

                    {/* Previous Period */}
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Periode Sebelumnya</p>
                        <p className="text-2xl font-bold">
                            {formatCurrency(previous_period.avg_hpp)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Rata-rata HPP
                        </p>
                    </div>
                </div>

                {/* Trend Indicator */}
                <div
                    className={cn(
                        'flex items-center justify-between p-4 rounded-lg border transition-all duration-300',
                        trendIndicator.bgColor,
                        trendIndicator.borderColor
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                'flex items-center justify-center w-10 h-10 rounded-full',
                                trendIndicator.bgColor,
                                'ring-2 ring-offset-2',
                                trendIndicator.borderColor.replace('border-', 'ring-')
                            )}
                        >
                            <TrendIcon className={cn('h-5 w-5', trendIndicator.color)} />
                        </div>
                        <div>
                            <p className={cn('text-sm font-medium', trendIndicator.color)}>
                                {trendIndicator.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Perubahan HPP
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className={cn('text-xl font-bold', trendIndicator.color)}>
                            {change.percentage >= 0 ? '+' : ''}
                            {change.percentage.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {change.absolute >= 0 ? '+' : ''}
                            {formatCurrency(change.absolute)}
                        </p>
                    </div>
                </div>

                {/* Min/Max Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Min</span>
                            <span className="text-sm font-medium">
                                {formatCurrency(current_period.min_hpp)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Max</span>
                            <span className="text-sm font-medium">
                                {formatCurrency(current_period.max_hpp)}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Min</span>
                            <span className="text-sm font-medium">
                                {formatCurrency(previous_period.min_hpp)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Max</span>
                            <span className="text-sm font-medium">
                                {formatCurrency(previous_period.max_hpp)}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
