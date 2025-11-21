// Tabbed content components for Profit Report
'use client'

import { TrendingDown, TrendingUp } from '@/components/icons'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'

import { COLORS, type ProfitData, type SelectedDataPoint } from '@/app/reports/components/ProfitReportTypes'

type PartialProfitData = Pick<ProfitData,
    'summary' |
    'profit_by_period' |
    'product_profitability' |
    'top_profitable_products' |
    'least_profitable_products' |
    'operating_expenses_breakdown'
>

interface ProfitReportTabsProps {
    // Data props
    profitData: ProfitData
    // State props
    selectedDataPoint: SelectedDataPoint | null
    setSelectedDataPoint: (dataPoint: SelectedDataPoint | null) => void
    compareMode: boolean
    comparisonData: ProfitData | null
}

// Trend tab content
const TrendTab: React.FC<{
    profitData: PartialProfitData
    selectedDataPoint: SelectedDataPoint | null
    setSelectedDataPoint: (dataPoint: SelectedDataPoint | null) => void
}> = ({ profitData, selectedDataPoint, setSelectedDataPoint }) => {
    const { formatCurrency } = useCurrency()
    const periods = profitData.profit_by_period ?? []

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle>Trend Laba</CardTitle>
                    {selectedDataPoint && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDataPoint(null)}
                            className="text-xs"
                        >
                            Clear Selection
                        </Button>
                    )}
                </div>
                {selectedDataPoint && (
                    <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-md mt-2">
                        <strong>{selectedDataPoint.period}:</strong> Pendapatan {formatCurrency(selectedDataPoint.revenue)},
                        HPP {formatCurrency(selectedDataPoint.cogs)},
                        Laba Kotor {formatCurrency(selectedDataPoint.gross_profit)}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {periods.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">Belum ada data periode untuk rentang tanggal ini.</p>
                ) : (
                    <div className="space-y-4">
                        {periods.map((period, index) => {
                            const isSelected = selectedDataPoint?.period === period.period
                            return (
                                <div
                                    key={index}
                                    className={`flex justify-between items-center p-3 border rounded-lg cursor-pointer transition ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : ''}`}
                                    onClick={() => setSelectedDataPoint(period)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault()
                                            setSelectedDataPoint(period)
                                        }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <span className="font-medium">{period.period}</span>
                                    <div className="text-right">
                                        <p className="font-bold">{formatCurrency(period.revenue)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Laba: {formatCurrency(period.gross_profit)}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// Products tab content
const ProductsTab: React.FC<{
    profitData: ProfitData
}> = ({ profitData }) => {
    const { formatCurrency } = useCurrency()
    const topProducts = profitData.top_profitable_products ?? []
    const leastProducts = profitData.least_profitable_products ?? []

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                        Top 5 Produk Paling Menguntungkan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {topProducts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Belum ada produk yang terjual pada periode ini.</p>
                    ) : (
                        <div className="space-y-3">
                            {topProducts.map((product, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-muted dark:bg-green-950 rounded-lg">
                                    <div>
                                        <p className="font-medium">{product.product_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Margin: {product.gross_margin.toFixed(1)}%
                                        </p>
                                    </div>
                                    <p className="font-bold text-muted-foreground">
                                        {formatCurrency(product.gross_profit)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
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
                    {leastProducts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Tidak ada produk dengan margin rendah pada periode ini.</p>
                    ) : (
                        <div className="space-y-3">
                            {leastProducts.map((product, index) => (
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
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

// Expenses tab content
const ExpensesTab: React.FC<{
    profitData: ProfitData
}> = ({ profitData }) => {
    const { formatCurrency } = useCurrency()
    const breakdown = profitData.operating_expenses_breakdown ?? []

    return (
        <Card>
            <CardHeader>
                <CardTitle>Breakdown Biaya Operasional</CardTitle>
            </CardHeader>
            <CardContent>
                {breakdown.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">Belum ada data biaya operasional.</p>
                ) : (
                    <div className="space-y-3">
                        {breakdown.map((expense, index) => (
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
                )}
            </CardContent>
        </Card>
    )
}

// Comparison tab content
const ComparisonTab: React.FC<{
    profitData: PartialProfitData
    compareMode: boolean
    comparisonData: PartialProfitData | null
}> = ({ profitData, compareMode, comparisonData }) => {
    const { formatCurrency } = useCurrency()
    const formatDateLabel = (value?: string) => {
        if (!value) { return null }
        const parsed = new Date(value)
        return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleDateString('id-ID')
    }
    const formatPeriodRange = (period?: { start: string; end: string }) => {
        if (!period) { return 'Periode tidak tersedia' }
        const startLabel = formatDateLabel(period.start)
        const endLabel = formatDateLabel(period.end)
        if (startLabel && endLabel) { return `${startLabel} - ${endLabel}` }
        return startLabel || endLabel || 'Periode tidak tersedia'
    }
    const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) { return current > 0 ? 100 : 0 }
        return ((current - previous) / previous) * 100
    }

    if (compareMode && comparisonData) {
        const revenueGrowth = calculateGrowth(profitData.summary.total_revenue, comparisonData.summary.total_revenue)
        const grossGrowth = calculateGrowth(profitData.summary.gross_profit, comparisonData.summary.gross_profit)
        const netGrowth = calculateGrowth(profitData.summary.net_profit, comparisonData.summary.net_profit)
        return (
            <div className="space-y-6">
                {/* Period Comparison Summary */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Periode Saat Ini</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {formatPeriodRange(profitData.summary.period)}
                            </p>
                        </CardHeader>
                         <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span>Pendapatan:</span>
                                <span className="font-semibold">{formatCurrency(Number(profitData.summary.total_revenue ?? 0))}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Laba Kotor:</span>
                                <span className="font-semibold text-green-600">{formatCurrency(profitData.summary.gross_profit)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Laba Bersih:</span>
                                <span className="font-semibold text-green-600">{formatCurrency(profitData.summary.net_profit)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Periode Sebelumnya</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {formatPeriodRange(comparisonData.summary.period)}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span>Pendapatan:</span>
                                <span className="font-semibold">{formatCurrency(comparisonData.summary.total_revenue)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Laba Kotor:</span>
                                <span className="font-semibold text-green-600">{formatCurrency(comparisonData.summary.gross_profit)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Laba Bersih:</span>
                                <span className="font-semibold text-green-600">{formatCurrency(comparisonData.summary.net_profit)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Growth Indicators */}
                <Card>
                    <CardHeader>
                        <CardTitle>Perubahan & Tren</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                                </div>
                                <div className="text-sm text-muted-foreground">Pertumbuhan Pendapatan</div>
                                <div className="flex justify-center mt-2">
                                    {revenueGrowth > 0 ?
                                        <TrendingUp className="h-5 w-5 text-green-600" /> :
                                        <TrendingDown className="h-5 w-5 text-red-600" />
                                    }
                                </div>
                            </div>

                            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {grossGrowth > 0 ? '+' : ''}{grossGrowth.toFixed(1)}%
                                </div>
                                <div className="text-sm text-muted-foreground">Pertumbuhan Laba Kotor</div>
                                <div className="flex justify-center mt-2">
                                    {grossGrowth > 0 ?
                                        <TrendingUp className="h-5 w-5 text-green-600" /> :
                                        <TrendingDown className="h-5 w-5 text-red-600" />
                                    }
                                </div>
                            </div>

                            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {netGrowth > 0 ? '+' : ''}{netGrowth.toFixed(1)}%
                                </div>
                                <div className="text-sm text-muted-foreground">Pertumbuhan Laba Bersih</div>
                                <div className="flex justify-center mt-2">
                                    {netGrowth > 0 ?
                                        <TrendingUp className="h-5 w-5 text-green-600" /> :
                                        <TrendingDown className="h-5 w-5 text-red-600" />
                                    }
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (compareMode) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Perbandingan Pendapatan vs HPP vs Laba</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center">Data perbandingan sedang dimuat atau tidak tersedia.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Perbandingan Pendapatan vs HPP vs Laba</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Aktifkan &#34;Compare Periods&#34; untuk melihat perbandingan dengan periode sebelumnya
                </p>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Aktifkan mode perbandingan untuk melihat data.</p>
            </CardContent>
        </Card>
    )
}

// Main tabbed content component
export const ProfitReportTabs: React.FC<ProfitReportTabsProps> = ({
    profitData,
    selectedDataPoint,
    setSelectedDataPoint,
    compareMode,
    comparisonData
}) => {
    const [activeTab, setActiveTab] = React.useState('trend')

    const renderTabContent = () => {
        switch (activeTab) {
            case 'trend':
                return (
                    <TrendTab
                        profitData={profitData}
                        selectedDataPoint={selectedDataPoint}
                        setSelectedDataPoint={setSelectedDataPoint}
                    />
                )
            case 'products':
                return <ProductsTab profitData={profitData} />
            case 'expenses':
                return <ExpensesTab profitData={profitData} />
            case 'comparison':
                return (
                    <ComparisonTab
                        profitData={profitData}
                        compareMode={compareMode}
                        comparisonData={comparisonData}
                    />
                )
            default:
                return null
        }
    }

    return (
        <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="flex space-x-1 rounded-lg bg-muted p-1">
                <button
                    onClick={() => setActiveTab('trend')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'trend'
                            ? 'bg-background text-foreground '
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Trend
                </button>
                <button
                    onClick={() => setActiveTab('products')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'products'
                            ? 'bg-background text-foreground '
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Produk
                </button>
                <button
                    onClick={() => setActiveTab('expenses')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'expenses'
                            ? 'bg-background text-foreground '
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Biaya
                </button>
                <button
                    onClick={() => setActiveTab('comparison')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'comparison'
                            ? 'bg-background text-foreground '
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Perbandingan
                </button>
            </div>

            {/* Tab Content */}
            {renderTabContent()}
        </div>
    )
}
