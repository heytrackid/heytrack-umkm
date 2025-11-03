'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { useCurrency } from '@/hooks/useCurrency'
import { useResponsive } from '@/hooks/useResponsive'
import { apiLogger } from '@/lib/logger'
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, AlertCircle, Download, RefreshCw, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
// ✅ OPTIMIZED: Lazy load charts to reduce initial bundle
import {
    LazyLineChart,
    LazyBarChart,
    LazyPieChart,
    Line,
    Bar,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ChartLegend as Legend,
    ResponsiveContainer
} from '@/components/charts/LazyCharts'

interface ProfitReportProps {
    dateRange: {
        start: string
        end: string
    }
}

interface ProfitData {
    summary: {
        period: {
            start: string
            end: string
            type: string
        }
        total_revenue: number
        total_cogs: number
        gross_profit: number
        gross_profit_margin: number
        total_operating_expenses: number
        net_profit: number
        net_profit_margin: number
        orders_count: number
    }
    profit_by_period: Array<{
        period: string
        revenue: number
        cogs: number
        gross_profit: number
        gross_margin: number
        orders_count: number
    }>
    product_profitability: Array<{
        product_name: string
        total_revenue: number
        total_cogs: number
        gross_profit: number
        gross_margin: number
        total_quantity: number
    }>
    top_profitable_products: Array<{
        product_name: string
        gross_profit: number
        gross_margin: number
    }>
    least_profitable_products: Array<{
        product_name: string
        gross_profit: number
        gross_margin: number
    }>
    operating_expenses_breakdown: Array<{
        category: string
        total: number
        percentage: number
    }>
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const EnhancedProfitReport = ({ dateRange }: ProfitReportProps) => {
    const { formatCurrency } = useCurrency()
    const { isMobile } = useResponsive()
    const [loading, setLoading] = useState(true)
    const [profitData, setProfitData] = useState<ProfitData | null>(null)
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly')

    useEffect(() => {
        void fetchProfitData()
    }, [dateRange, period, fetchProfitData])

    const fetchProfitData = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                start_date: dateRange.start,
                end_date: dateRange.end,
                period,
                include_breakdown: 'true'
            })

            const response = await fetch(`/api/reports/profit?${params.toString()}`)
            if (!response.ok) {
                throw new Error('Failed to fetch profit data')
            }

            const data = await response.json()
            setProfitData(data)
        } catch (err) {
            apiLogger.error({ err }, 'Error fetching profit data')
        } finally {
            setLoading(false)
        }
    }, [dateRange, period])

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="h-32" />
                    </Card>
                ))}
            </div>
        )
    }

    if (!profitData) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Tidak ada data profit untuk periode ini</p>
                    <Button onClick={fetchProfitData} className="mt-4">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Coba Lagi
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const { summary } = profitData

    const getTrendIcon = (value: number) => {
        if (value > 0) { return <ArrowUpRight className="h-4 w-4 text-green-600" /> }
        if (value < 0) { return <ArrowDownRight className="h-4 w-4 text-red-600" /> }
        return <Minus className="h-4 w-4 text-gray-400" />
    }

    const getTrendColor = (value: number) => {
        if (value > 0) { return 'text-green-600' }
        if (value < 0) { return 'text-red-600' }
        return 'text-gray-600'
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Laporan Profit & Loss</h2>
                    <p className="text-sm text-muted-foreground">
                        {new Date(summary.period.start).toLocaleDateString('id-ID')} - {new Date(summary.period.end).toLocaleDateString('id-ID')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchProfitData}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Period Selector */}
            <div className="flex gap-2">
                <Button
                    variant={period === 'daily' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPeriod('daily')}
                >
                    Harian
                </Button>
                <Button
                    variant={period === 'weekly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPeriod('weekly')}
                >
                    Mingguan
                </Button>
                <Button
                    variant={period === 'monthly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPeriod('monthly')}
                >
                    Bulanan
                </Button>
            </div>

            {/* Key Metrics Cards */}
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Revenue
                            </CardTitle>
                            <DollarSign className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">
                                {formatCurrency(summary.total_revenue)}
                            </p>
                            <div className="flex items-center gap-1 text-sm">
                                {getTrendIcon(summary.total_revenue)}
                                <span className={getTrendColor(summary.total_revenue)}>
                                    {summary.orders_count} pesanan
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                COGS (Biaya Produksi)
                            </CardTitle>
                            <Package className="h-5 w-5 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold text-orange-600">
                                {formatCurrency(summary.total_cogs)}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <span>
                                    {summary.total_revenue > 0
                                        ? ((summary.total_cogs / summary.total_revenue) * 100).toFixed(1)
                                        : 0}% dari revenue
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Gross Profit
                            </CardTitle>
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <p className={`text-2xl font-bold ${summary.gross_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(summary.gross_profit)}
                            </p>
                            <div className="flex items-center gap-1">
                                <Badge variant={summary.gross_profit_margin >= 30 ? 'default' : 'secondary'}>
                                    Margin: {summary.gross_profit_margin.toFixed(1)}%
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Net Profit
                            </CardTitle>
                            <ShoppingCart className="h-5 w-5 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <p className={`text-2xl font-bold ${summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(summary.net_profit)}
                            </p>
                            <div className="flex items-center gap-1">
                                <Badge variant={summary.net_profit >= 0 ? 'default' : 'destructive'}>
                                    Margin: {summary.net_profit_margin.toFixed(1)}%
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Profit Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Breakdown Profit</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <span className="font-medium">Total Revenue</span>
                            <span className="text-lg font-bold">{formatCurrency(summary.total_revenue)}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                            <span className="font-medium">- COGS (Cost of Goods Sold)</span>
                            <span className="text-lg font-bold text-orange-600">
                                ({formatCurrency(summary.total_cogs)})
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-200">
                            <span className="font-medium">= Gross Profit</span>
                            <span className="text-lg font-bold text-green-600">
                                {formatCurrency(summary.gross_profit)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                            <span className="font-medium">- Operating Expenses</span>
                            <span className="text-lg font-bold text-red-600">
                                ({formatCurrency(summary.total_operating_expenses)})
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border-2 border-purple-200">
                            <span className="font-bold">= Net Profit</span>
                            <span className={`text-xl font-bold ${summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(summary.net_profit)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Charts and Details */}
            <SwipeableTabs defaultValue="trend" className="space-y-4">
                <SwipeableTabsList>
                    <SwipeableTabsTrigger value="trend">Trend</SwipeableTabsTrigger>
                    <SwipeableTabsTrigger value="products">Produk</SwipeableTabsTrigger>
                    <SwipeableTabsTrigger value="expenses">Biaya</SwipeableTabsTrigger>
                    <SwipeableTabsTrigger value="comparison">Perbandingan</SwipeableTabsTrigger>
                </SwipeableTabsList>

                <SwipeableTabsContent value="trend">
                    <Card>
                        <CardHeader>
                            <CardTitle>Trend Profit</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LazyLineChart data={profitData.profit_by_period}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue" />
                                    <Line type="monotone" dataKey="cogs" stroke="#f59e0b" name="COGS" />
                                    <Line type="monotone" dataKey="gross_profit" stroke="#10b981" name="Gross Profit" strokeWidth={2} />
                                </LazyLineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </SwipeableTabsContent>

                <SwipeableTabsContent value="products">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    Top 5 Produk Paling Menguntungkan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {profitData.top_profitable_products.map((product, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                            <div>
                                                <p className="font-medium">{product.product_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Margin: {product.gross_margin.toFixed(1)}%
                                                </p>
                                            </div>
                                            <p className="font-bold text-green-600">
                                                {formatCurrency(product.gross_profit)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                    5 Produk Kurang Menguntungkan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {profitData.least_profitable_products.map((product, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                                            <div>
                                                <p className="font-medium">{product.product_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Margin: {product.gross_margin.toFixed(1)}%
                                                </p>
                                            </div>
                                            <p className="font-bold text-red-600">
                                                {formatCurrency(product.gross_profit)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </SwipeableTabsContent>

                <SwipeableTabsContent value="expenses">
                    <Card>
                        <CardHeader>
                            <CardTitle>Breakdown Biaya Operasional</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                <ResponsiveContainer width="100%" height={300}>
                                    <LazyPieChart>
                                        <Pie
                                            data={profitData.operating_expenses_breakdown}
                                            dataKey="total"
                                            nameKey="category"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={(entry) => `${entry.category}: ${(entry.percentage as number).toFixed(1)}%`}
                                        >
                                            {profitData.operating_expenses_breakdown.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                    </LazyPieChart>
                                </ResponsiveContainer>

                                <div className="space-y-3">
                                    {profitData.operating_expenses_breakdown.map((expense, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                />
                                                <span className="font-medium">{expense.category}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">{formatCurrency(expense.total)}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {expense.percentage.toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </SwipeableTabsContent>

                <SwipeableTabsContent value="comparison">
                    <Card>
                        <CardHeader>
                            <CardTitle>Perbandingan Revenue vs COGS vs Profit</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LazyBarChart data={profitData.profit_by_period}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                                    <Bar dataKey="cogs" fill="#f59e0b" name="COGS" />
                                    <Bar dataKey="gross_profit" fill="#10b981" name="Gross Profit" />
                                </LazyBarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </SwipeableTabsContent>
            </SwipeableTabs>
        </div>
    )
}

export default EnhancedProfitReport
