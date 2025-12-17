// Metric cards component for Profit Report
'use client'

import { ArrowDownRight, ArrowUpRight, DollarSign, Minus, Package, ShoppingCart, TrendingUp } from '@/components/icons'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCards as UiStatsCards, type StatCardData } from '@/components/ui/stats-cards'
import { useCurrency } from '@/hooks/useCurrency'

interface ProfitMetricsProps {
    summary: {
        totalRevenue: number
        totalCOGS: number
        grossProfit: number
        profitMargin: number
        totalOperatingExpenses: number
        netProfit: number
    }
    isMobile?: boolean
}

// Helper functions for trend display
const getTrendIcon = (value: number) => {
    if (value > 0) { return <ArrowUpRight className="h-4 w-4 text-muted-foreground" /> }
    if (value < 0) { return <ArrowDownRight className="h-4 w-4 text-red-600" /> }
    return <Minus className="h-4 w-4 text-muted-foreground" />
}

const getTrendColor = (value: number) => {
    if (value > 0) { return 'text-muted-foreground' }
    if (value < 0) { return 'text-red-600' }
    return 'text-muted-foreground'
}

// Metric cards component
export const ProfitMetrics = ({ summary, isMobile = false }: ProfitMetricsProps) => {
    const { formatCurrency } = useCurrency()

    // Early return if summary is undefined
    if (!summary) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }, (_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                            <div className="h-4 bg-muted rounded w-24" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-muted rounded w-32 mb-2" />
                            <div className="h-3 bg-muted rounded w-20" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    const gridClass = isMobile ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'

    const cards: StatCardData[] = [
        {
            title: 'Total Pendapatan',
            value: formatCurrency(summary.totalRevenue),
            icon: DollarSign,
            footer: (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-sm">
                    {getTrendIcon(summary.totalRevenue)}
                    <span className={getTrendColor(summary.totalRevenue)}>
                        Data tersedia
                    </span>
                </div>
            ),
        },
        {
            title: 'COGS (Biaya Produksi)',
            value: formatCurrency(summary.totalCOGS),
            icon: Package,
            valueClassName: 'text-orange-600',
            footer: (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-sm text-muted-foreground">
                    <span>
                        {summary.totalRevenue > 0
                            ? ((summary.totalCOGS / summary.totalRevenue) * 100).toFixed(1)
                            : 0}% dari revenue
                    </span>
                </div>
            ),
        },
        {
            title: 'Laba Kotor',
            value: formatCurrency(summary.grossProfit),
            icon: TrendingUp,
            valueClassName: summary.grossProfit >= 0 ? 'text-green-600' : 'text-red-600',
            footer: (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <Badge variant={((summary.grossProfit / summary.totalRevenue) * 100) >= 30 ? 'default' : 'secondary'}>
                        Margin: {((summary.grossProfit / summary.totalRevenue) * 100).toFixed(1)}%
                    </Badge>
                </div>
            ),
        },
        {
            title: 'Laba Bersih',
            value: formatCurrency(summary.netProfit),
            icon: ShoppingCart,
            valueClassName: summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600',
            footer: (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <Badge variant={summary.netProfit >= 0 ? 'default' : 'destructive'}>
                        Margin: {summary.profitMargin.toFixed(1)}%
                    </Badge>
                </div>
            ),
        },
    ]

    return (
        <UiStatsCards stats={cards} gridClassName={`grid gap-4 ${gridClass}`} />
    )
}

// Profit breakdown component
interface ProfitBreakdownProps {
    summary: {
        totalRevenue: number
        totalCOGS: number
        grossProfit: number
        totalOperatingExpenses: number
        netProfit: number
    }
    formatCurrency: (amount: number) => string
}

export const ProfitBreakdown = ({ summary, formatCurrency }: ProfitBreakdownProps) => {
    // Early return if summary is undefined
    if (!summary) {
        return (
            <Card className="border-0">
                <CardHeader>
                    <div className="h-6 bg-muted rounded w-32 animate-pulse" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 5 }, (_, i) => (
                            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-0 ">
            <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Rincian Laba
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border">
                        <span className="font-medium">Total Pendapatan</span>
                        <span className="text-lg font-bold">{formatCurrency(summary.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border">
                        <span className="font-medium">- HPP (Harga Pokok Penjualan)</span>
                        <span className="text-lg font-bold text-orange-600">
                            ({formatCurrency(summary.totalCOGS)})
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200">
                        <span className="font-medium">= Laba Kotor</span>
                        <span className="text-lg font-bold text-blue-600">
                            {formatCurrency(summary.grossProfit)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-950 rounded-lg border">
                        <span className="font-medium">- Biaya Operasional</span>
                        <span className="text-lg font-bold text-red-600">
                            ({formatCurrency(summary.totalOperatingExpenses)})
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-muted rounded-lg border-2 border-border/20">
                        <span className="font-bold text-lg">= Laba Bersih</span>
                        <span className={`text-xl font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(summary.netProfit)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
