'use client'

import { TrendingUp, AlertCircle, Download, RefreshCw, FileText, Printer, BarChart3 } from '@/components/icons'
import { useState, useEffect, useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useCurrency } from '@/hooks/useCurrency'
import { useResponsive } from '@/hooks/useResponsive'
import { apiLogger } from '@/lib/logger'

// Import our separated components
import { exportToCSV, printReport } from '@/app/reports/components/ProfitReportExport'
import { ProfitMetrics, ProfitBreakdown } from '@/app/reports/components/ProfitReportMetrics'
import { ProfitReportTabs } from '@/app/reports/components/ProfitReportTabs'

import type { ProfitReportProps, ProfitData, PeriodType, ChartType, SelectedDataPoint } from '@/app/reports/components/ProfitReportTypes'

// Main component
export const ProfitReport = ({ dateRange }: ProfitReportProps) => {
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
            const params = new URLSearchParams()
            if (dateRange.start) {params.set('start_date', dateRange.start)}
            if (dateRange.end) {params.set('end_date', dateRange.end)}
            params.set('period', period)
            params.set('include_breakdown', 'true')

            const response = await fetch(`/api/reports/profit?${params.toString()}`)
            if (!response.ok) {
                throw new Error('Failed to fetch profit data')
            }

            const data = await response.json() as ProfitData
            setProfitData(data)
        } catch (error) {
            apiLogger.error({ error }, 'Error fetching profit data')
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
            if (!dateRange.start || !dateRange.end) {return}
            const startDate = new Date(dateRange.start)
            const endDate = new Date(dateRange.end)
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            const prevEndDate = new Date(startDate)
            prevEndDate.setDate(prevEndDate.getDate() - 1)
            const prevStartDate = new Date(prevEndDate)
            prevStartDate.setDate(prevStartDate.getDate() - diffDays + 1)

            const params = new URLSearchParams()
            if (prevStartDate) {params.set('start_date', prevStartDate.toISOString().split('T')[0] as string)}
            if (prevEndDate) {params.set('end_date', prevEndDate.toISOString().split('T')[0] as string)}
            params.set('period', period)
            params.set('include_breakdown', 'true')

            const response = await fetch(`/api/reports/profit?${params.toString()}`)
            if (!response.ok) {
                throw new Error('Failed to fetch comparison data')
            }

            const data = await response.json() as ProfitData
            setComparisonData(data)
        } catch (error) {
            apiLogger.error({ error }, 'Error fetching comparison data')
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
                {Array.from({ length: 4 }, (_, i) => (
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

    // Additional check for summary data structure
    if (!summary || !summary.period || !summary.period.start || !summary.period.end) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Data laporan tidak lengkap</p>
                    <Button onClick={fetchProfitData} className="mt-4">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Muat Ulang
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                        Laporan Laba Rugi
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
                            <DropdownMenuItem onClick={() => exportToCSV({ profitData, dateRange: { start: dateRange.start as string, end: dateRange.end as string } })}>
                                <FileText className="h-4 w-4 mr-2" />
                                Ekspor CSV
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
                selectedDataPoint={selectedDataPoint}
                setSelectedDataPoint={setSelectedDataPoint}
                compareMode={compareMode}
                comparisonData={comparisonData}
            />
        </div>
    )
}