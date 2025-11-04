// Metric cards component for Profit Report
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, DollarSign, ShoppingCart, Package, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

interface ProfitMetricsProps {
    summary: {
        total_revenue: number
        total_cogs: number
        gross_profit: number
        gross_profit_margin: number
        total_operating_expenses: number
        net_profit: number
        net_profit_margin: number
        orders_count: number
    }
    isMobile?: boolean
}

// Helper functions for trend display
const getTrendIcon = (value: number) => {
    if (value > 0) { return <ArrowUpRight className="h-4 w-4 text-gray-600" /> }
    if (value < 0) { return <ArrowDownRight className="h-4 w-4 text-red-600" /> }
    return <Minus className="h-4 w-4 text-gray-400" />
}

const getTrendColor = (value: number) => {
    if (value > 0) { return 'text-gray-600' }
    if (value < 0) { return 'text-red-600' }
    return 'text-gray-600'
}

// Metric cards component
export const ProfitMetrics: React.FC<ProfitMetricsProps> = ({ summary, isMobile = false }) => {
    const { formatCurrency } = useCurrency()

    const gridClass = isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4'

    return (
        <div className={`grid gap-4 ${gridClass}`}>
            {/* Total Revenue Card */}
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Revenue
                    </CardTitle>
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatCurrency(summary.total_revenue)}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                        {getTrendIcon(summary.total_revenue)}
                        <span className={getTrendColor(summary.total_revenue)}>
                            {summary.orders_count} pesanan
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* COGS Card */}
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        COGS (Biaya Produksi)
                    </CardTitle>
                    <Package className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(summary.total_cogs)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>
                            {summary.total_revenue > 0
                                ? ((summary.total_cogs / summary.total_revenue) * 100).toFixed(1)
                                : 0}% dari revenue
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Gross Profit Card */}
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Gross Profit
                    </CardTitle>
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${summary.gross_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(summary.gross_profit)}
                    </div>
                    <div className="flex items-center gap-1">
                        <Badge variant={summary.gross_profit_margin >= 30 ? 'default' : 'secondary'}>
                            Margin: {summary.gross_profit_margin.toFixed(1)}%
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Net Profit Card */}
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Net Profit
                    </CardTitle>
                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(summary.net_profit)}
                    </div>
                    <div className="flex items-center gap-1">
                        <Badge variant={summary.net_profit >= 0 ? 'default' : 'destructive'}>
                            Margin: {summary.net_profit_margin.toFixed(1)}%
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Profit breakdown component
interface ProfitBreakdownProps {
    summary: {
        total_revenue: number
        total_cogs: number
        gross_profit: number
        total_operating_expenses: number
        net_profit: number
    }
    formatCurrency: (amount: number) => string
}

export const ProfitBreakdown = ({ summary, formatCurrency }: ProfitBreakdownProps) => (
        <Card className="border-0 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Breakdown Profit
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border">
                        <span className="font-medium">Total Revenue</span>
                        <span className="text-lg font-bold">{formatCurrency(summary.total_revenue)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border">
                        <span className="font-medium">- COGS (Cost of Goods Sold)</span>
                        <span className="text-lg font-bold text-orange-600">
                            ({formatCurrency(summary.total_cogs)})
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200">
                        <span className="font-medium">= Gross Profit</span>
                        <span className="text-lg font-bold text-blue-600">
                            {formatCurrency(summary.gross_profit)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-950 rounded-lg border">
                        <span className="font-medium">- Operating Expenses</span>
                        <span className="text-lg font-bold text-red-600">
                            ({formatCurrency(summary.total_operating_expenses)})
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-950 rounded-lg border-2 border-gray-300">
                        <span className="font-bold text-lg">= Net Profit</span>
                        <span className={`text-xl font-bold ${summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(summary.net_profit)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
)
