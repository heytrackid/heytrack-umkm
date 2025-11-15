// Tabbed content components for Profit Report
'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'

import { COLORS, type ProfitData, type SelectedDataPoint } from '@/app/reports/components/ProfitReportTypes'

interface PartialProfitData {
    summary: {
        period: {
            start: string
            end: string
            type?: string
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
    product_profitability?: Array<{
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

interface ProfitReportTabsProps {
    // Data props
    profitData: PartialProfitData
    // State props
    selectedDataPoint: SelectedDataPoint | null
    setSelectedDataPoint: (dataPoint: SelectedDataPoint | null) => void
    compareMode: boolean
    comparisonData: PartialProfitData | null
}

// Trend tab content
const TrendTab: React.FC<{
    profitData: PartialProfitData
    selectedDataPoint: SelectedDataPoint | null
    setSelectedDataPoint: (dataPoint: SelectedDataPoint | null) => void
}> = ({ profitData, selectedDataPoint, setSelectedDataPoint }) => {
    const { formatCurrency } = useCurrency()

    const handleDataPointSelect = (dataPoint: SelectedDataPoint) => {
        setSelectedDataPoint(dataPoint)
    }

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
                <div className="space-y-4">
                    {profitData.profit_by_period.map((period, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                            <span className="font-medium">{period.period}</span>
                            <div className="text-right">
                                <p className="font-bold">{formatCurrency(period.revenue)}</p>
                                <p className="text-sm text-muted-foreground">
                                    Laba: {formatCurrency(period.gross_profit)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

// Products tab content
const ProductsTab: React.FC<{
    profitData: ProfitData
}> = ({ profitData }) => {
    const { formatCurrency } = useCurrency()

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
                    <div className="space-y-3">
                        {profitData.top_profitable_products.map((product: ProfitData['top_profitable_products'][0], index: number) => (
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
                        {profitData.least_profitable_products.map((product: ProfitData['least_profitable_products'][0], index: number) => (
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
    )
}

// Expenses tab content
const ExpensesTab: React.FC<{
    profitData: ProfitData
}> = ({ profitData }) => {
    const { formatCurrency } = useCurrency()

    return (
        <Card>
            <CardHeader>
                <CardTitle>Breakdown Biaya Operasional</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {profitData.operating_expenses_breakdown.map((expense: ProfitData['operating_expenses_breakdown'][0], index: number) => (
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

    if (compareMode && comparisonData) {
        return (
            <div className="space-y-6">
                {/* Period Comparison Summary */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Periode Saat Ini</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {new Date(profitData.summary.period.start).toLocaleDateString('id-ID')} - {new Date(profitData.summary.period.end).toLocaleDateString('id-ID')}
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
                                {new Date(comparisonData.summary.period.start).toLocaleDateString('id-ID')} - {new Date(comparisonData.summary.period.end).toLocaleDateString('id-ID')}
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
                                    {profitData.summary.total_revenue > comparisonData.summary.total_revenue ? '+' : ''}
                                    {(((profitData.summary.total_revenue - comparisonData.summary.total_revenue) / comparisonData.summary.total_revenue) * 100).toFixed(1)}%
                                </div>
                                <div className="text-sm text-muted-foreground">Pertumbuhan Pendapatan</div>
                                <div className="flex justify-center mt-2">
                                    {profitData.summary.total_revenue > comparisonData.summary.total_revenue ?
                                        <TrendingUp className="h-5 w-5 text-green-600" /> :
                                        <TrendingDown className="h-5 w-5 text-red-600" />
                                    }
                                </div>
                            </div>

                            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {profitData.summary.gross_profit > comparisonData.summary.gross_profit ? '+' : ''}
                                    {(((profitData.summary.gross_profit - comparisonData.summary.gross_profit) / comparisonData.summary.gross_profit) * 100).toFixed(1)}%
                                </div>
                                <div className="text-sm text-muted-foreground">Pertumbuhan Laba Kotor</div>
                                <div className="flex justify-center mt-2">
                                    {profitData.summary.gross_profit > comparisonData.summary.gross_profit ?
                                        <TrendingUp className="h-5 w-5 text-green-600" /> :
                                        <TrendingDown className="h-5 w-5 text-red-600" />
                                    }
                                </div>
                            </div>

                            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {profitData.summary.net_profit > comparisonData.summary.net_profit ? '+' : ''}
                                    {(((profitData.summary.net_profit - comparisonData.summary.net_profit) / comparisonData.summary.net_profit) * 100).toFixed(1)}%
                                </div>
                                <div className="text-sm text-muted-foreground">Pertumbuhan Laba Bersih</div>
                                <div className="flex justify-center mt-2">
                                    {profitData.summary.net_profit > comparisonData.summary.net_profit ?
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
