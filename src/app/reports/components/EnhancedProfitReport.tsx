'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useCurrency } from '@/hooks/useCurrency'
import { useResponsive } from '@/hooks/useResponsive'
import { apiLogger } from '@/lib/logger'
import { TrendingUp, AlertCircle, Download, RefreshCw, FileText, Printer, BarChart3 } from 'lucide-react'

// Import our separated components
import type { ProfitReportProps, ProfitData, PeriodType, ChartType, SelectedDataPoint } from './ProfitReportTypes'
import { ProfitMetrics, ProfitBreakdown } from './ProfitReportMetrics'
import { ProfitReportTabs } from './ProfitReportTabs'
import { exportToCSV, exportToPDF, printReport } from './ProfitReportExport'

// Main component
const EnhancedProfitReport = ({ dateRange }: ProfitReportProps) => {
    const { formatCurrency } = useCurrency()
    const { isMobile } = useResponsive()
    const [loading, setLoading] = useState(true)
    const [profitData, setProfitData] = useState<ProfitData | null>(null)
    const [period, setPeriod] = useState<PeriodType>('monthly')
    const [chartType, setChartType] = useState<ChartType>('line')
    const [selectedDataPoint, setSelectedDataPoint] = useState<SelectedDataPoint | null>(null)
    const [compareMode, setCompareMode] = useState(false)
    const [comparisonData, setComparisonData] = useState<ProfitData | null>(null)

    // Data fetching logic
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

    const fetchComparisonData = useCallback(async () => {
        if (!compareMode) {
            return
        }

        try {
            // Calculate previous period dates
            const startDate = new Date(dateRange.start)
            const endDate = new Date(dateRange.end)
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            const prevEndDate = new Date(startDate)
            prevEndDate.setDate(prevEndDate.getDate() - 1)
            const prevStartDate = new Date(prevEndDate)
            prevStartDate.setDate(prevStartDate.getDate() - diffDays + 1)

            const params = new URLSearchParams({
                start_date: prevStartDate.toISOString().split('T')[0],
                end_date: prevEndDate.toISOString().split('T')[0],
                period,
                include_breakdown: 'true'
            })

            const response = await fetch(`/api/reports/profit?${params.toString()}`)
            if (!response.ok) {
                throw new Error('Failed to fetch comparison data')
            }

            const data = await response.json()
            setComparisonData(data)
        } catch (err) {
            apiLogger.error({ err }, 'Error fetching comparison data')
            setComparisonData(null)
        }
    }, [dateRange, period, compareMode])

    // Load data on mount and when dependencies change
    useEffect(() => {
        void fetchProfitData()
    }, [fetchProfitData])

    // Load comparison data when compare mode changes
    useEffect(() => {
        void fetchComparisonData()
    }, [fetchComparisonData])

    // Loading state
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

    // Error state
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

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                        Laporan Profit & Loss
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {new Date(summary.period.start).toLocaleDateString('id-ID')} - {new Date(summary.period.end).toLocaleDateString('id-ID')}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={fetchProfitData}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button
                        variant={compareMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCompareMode(!compareMode)}
                    >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Bandingkan
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Ekspor
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => exportToCSV({ profitData, dateRange })}>
                                <FileText className="h-4 w-4 mr-2" />
                                Ekspor CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportToPDF({ profitData, dateRange, formatCurrency })}>
                                <FileText className="h-4 w-4 mr-2" />
                                Ekspor PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={printReport}>
                                <Printer className="h-4 w-4 mr-2" />
                                Cetak
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Period and Chart Type Selectors */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2">
                    <span className="text-sm font-medium self-center mr-2">Periode:</span>
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

                <div className="flex gap-2">
                    <span className="text-sm font-medium self-center mr-2">Tipe Chart:</span>
                    <Button
                        variant={chartType === 'line' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChartType('line')}
                    >
                        Line
                    </Button>
                    <Button
                        variant={chartType === 'bar' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChartType('bar')}
                    >
                        Bar
                    </Button>
                    <Button
                        variant={chartType === 'area' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChartType('area')}
                    >
                        Area
                    </Button>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <ProfitMetrics summary={summary} isMobile={isMobile} />

            {/* Profit Breakdown */}
            <ProfitBreakdown summary={summary} formatCurrency={formatCurrency} />

            {/* Tabbed Content */}
            <ProfitReportTabs
                profitData={profitData}
                chartType={chartType}
                selectedDataPoint={selectedDataPoint}
                setSelectedDataPoint={setSelectedDataPoint}
                compareMode={compareMode}
                comparisonData={comparisonData}
            />
        </div>
    )
}

export default EnhancedProfitReport
