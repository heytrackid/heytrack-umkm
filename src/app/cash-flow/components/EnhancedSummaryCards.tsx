'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/components/ui/tooltip'
import type { CashFlowSummary } from '../constants'

interface EnhancedSummaryCardsProps {
    summary: CashFlowSummary | null
    comparison?: {
        income: number
        expense: number
        net: number
    } | null
    formatCurrency: (amount: number) => string
    isMobile: boolean
}

const EnhancedSummaryCards = ({
    summary,
    comparison,
    formatCurrency,
    isMobile
}: EnhancedSummaryCardsProps) => {
    if (!summary) {
        return null
    }

    const scrollToTransactions = () => {
        const element = document.getElementById('transaction-list')
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const getHealthStatus = () => {
        const ratio = summary.total_income > 0
            ? (summary.total_expenses / summary.total_income) * 100
            : 0

        if (ratio < 50) { return { status: 'excellent', color: 'text-muted-foreground', label: 'Sangat Baik' } }
        if (ratio < 70) { return { status: 'good', color: 'text-muted-foreground', label: 'Baik' } }
        if (ratio < 90) { return { status: 'warning', color: 'text-amber-600', label: 'Perhatian' } }
        return { status: 'danger', color: 'text-destructive', label: 'Bahaya' }
    }

    const health = getHealthStatus()
    const expenseRatio = summary.total_income > 0
        ? (summary.total_expenses / summary.total_income) * 100
        : 0

    const renderTrendBadge = (value: number | undefined) => {
        if (!value || value === 0) { return null }

        const isPositive = value > 0
        return (
            <Badge
                variant="secondary"
                className={`${isPositive
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-destructive/10 text-destructive'
                    }`}
            >
                {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {isPositive ? '+' : ''}{value.toFixed(1)}%
            </Badge>
        )
    }

    return (
        <div className="space-y-4">
            {/* Main Summary Cards */}
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                {/* Total Income */}
                <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <div className="p-2 bg-muted rounded-lg">
                                    <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
                                </div>
                                Total Pemasukan
                            </span>
                            {renderTrendBadge(comparison?.income)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-foreground mb-2">
                            {formatCurrency(summary.total_income)}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                                {Object.keys(summary.income_by_category).length} kategori
                            </span>
                            <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs hover:text-gray-600"
                                onClick={scrollToTransactions}
                            >
                                Lihat detail →
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Expenses */}
                <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-destructive/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <div className="p-2 bg-muted rounded-lg">
                                    <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
                                </div>
                                Total Pengeluaran
                            </span>
                            {renderTrendBadge(comparison?.expense)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-foreground mb-2">
                            {formatCurrency(summary.total_expenses)}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                                {Object.keys(summary.expenses_by_category).length} kategori
                            </span>
                            <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs hover:text-red-600"
                                onClick={scrollToTransactions}
                            >
                                Lihat detail →
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Net Cash Flow */}
                <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-secondary/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <div className="p-2 bg-muted rounded-lg">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </div>
                                Arus Kas Bersih
                            </span>
                            {renderTrendBadge(comparison?.net)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-foreground mb-2">
                            {formatCurrency(summary.net_cash_flow)}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                            <Badge variant={summary.net_cash_flow >= 0 ? 'default' : 'destructive'}>
                                {summary.net_cash_flow >= 0 ? 'Surplus' : 'Defisit'}
                            </Badge>
                            <span className="text-muted-foreground">periode ini</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Health Indicator */}
            <Card className="bg-muted/10 border-muted">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-muted rounded-full">
                            {health.status === 'danger' || health.status === 'warning' ? (
                                <AlertCircle className="h-6 w-6 text-muted-foreground" />
                            ) : (
                                <TrendingUp className="h-6 w-6 text-muted-foreground" />
                            )}
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">Kesehatan Keuangan</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Rasio pengeluaran terhadap pemasukan
                                    </p>
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge className={health.color} variant="outline">
                                                {health.label}
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="space-y-1 text-xs">
                                                <p><strong>Sangat Baik:</strong> &lt; 50%</p>
                                                <p><strong>Baik:</strong> 50-70%</p>
                                                <p><strong>Perhatian:</strong> 70-90%</p>
                                                <p><strong>Bahaya:</strong> &gt; 90%</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Rasio Pengeluaran</span>
                                    <span className={`font-semibold ${health.color}`}>
                                        {expenseRatio.toFixed(1)}%
                                    </span>
                                </div>
                                <Progress
                                    value={Math.min(expenseRatio, 100)}
                                    className="h-2"
                                />
                            </div>
                            {health.status === 'danger' && (
                                <p className="text-xs text-destructive flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Pengeluaran mendekati atau melebihi pemasukan. Pertimbangkan untuk mengurangi biaya.
                                </p>
                            )}
                            {health.status === 'warning' && (
                                <p className="text-xs text-amber-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Pengeluaran cukup tinggi. Monitor cashflow dengan cermat.
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default EnhancedSummaryCards
