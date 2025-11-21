'use client'

import { TrendingUp, AlertCircle, Download, RefreshCw, FileText, Printer, BarChart3 } from '@/components/icons'
import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useCurrency } from '@/hooks/useCurrency'
import { useResponsive } from '@/hooks/useResponsive'
import { apiLogger } from '@/lib/logger'

// Import our separated components
import { useExportUtilities } from '@/app/reports/components/ProfitReportExport'
import { ProfitMetrics, ProfitBreakdown } from '@/app/reports/components/ProfitReportMetrics'
import { ProfitReportTabs } from '@/app/reports/components/ProfitReportTabs'

import type { ProfitReportProps, ProfitData, PeriodType, ChartType, SelectedDataPoint } from '@/app/reports/components/ProfitReportTypes'

// Main component
export const ProfitReport = ({ dateRange }: ProfitReportProps = {}) => {
    const { formatCurrency } = useCurrency()
    const { isMobile } = useResponsive()
    const [period, setPeriod] = useState<PeriodType>('monthly')
    const [chartType, setChartType] = useState<ChartType>('line')
    const [selectedDataPoint, setSelectedDataPoint] = useState<SelectedDataPoint | null>(null)
    const [compareMode, setCompareMode] = useState(false)

    // Data fetching with React Query
    const {
        data: profitData,
        isLoading: loading,
        error,
        refetch
    } = useQuery({
        queryKey: ['profit-report', period],
        queryFn: async (): Promise<ProfitData> => {
            const params = new URLSearchParams()
            params.set('period', period)
            params.set('include_breakdown', 'true')

            const response = await fetch(`/api/reports/profit?${params.toString()}`)
            if (!response.ok) {
                throw new Error('Failed to fetch profit data')
            }

            return (await response.json()) as unknown as ProfitData
        },
        refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
        staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
        refetchOnWindowFocus: false
    })

    // Comparison data query
    const {
        data: comparisonData,
        isLoading: comparisonLoading
    } = useQuery({
        queryKey: ['profit-report-comparison', period, compareMode],
        queryFn: async (): Promise<ProfitData | null> => {
            // Since date filtering is removed, comparison is disabled
            return null
        },
        enabled: compareMode,
        refetchInterval: 5 * 60 * 1000,
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false
    })

    const { handleExportCSV, handlePrint, exporting, printing } = useExportUtilities({
        profitData: profitData ?? null,
        dateRange: { start: '', end: '' }
    })

    // Safe export handlers with error boundaries
    const safeHandleExportCSV = useCallback(async () => {
        try {
            await handleExportCSV()
        } catch (error) {
            apiLogger.error({ error }, 'Export CSV failed')
            // Could show a toast notification here if needed
        }
    }, [handleExportCSV])

    const safeHandlePrint = useCallback(() => {
        try {
            handlePrint()
        } catch (error) {
            apiLogger.error({ error }, 'Print failed')
            // Could show a toast notification here if needed
        }
    }, [handlePrint])

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
    if (error) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Terjadi kesalahan saat memuat data profit</p>
                    <Button onClick={() => refetch()} className="mt-4">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Coba Lagi
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // No data state
    if (!profitData) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Tidak ada data profit untuk periode ini</p>
                </CardContent>
            </Card>
        )
    }

    const { summary } = profitData!
    const resolvedPeriodStart = summary?.period?.start ?? ''
    const resolvedPeriodEnd = summary?.period?.end ?? ''
    const safeFormatDate = (value: string | undefined) => {
        if (!value) { return null }
        const parsed = new Date(value)
        return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleDateString('id-ID')
    }
    const displayPeriodStart = safeFormatDate(resolvedPeriodStart)
    const displayPeriodEnd = safeFormatDate(resolvedPeriodEnd)

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
                        {displayPeriodStart && displayPeriodEnd
                            ? `${displayPeriodStart} - ${displayPeriodEnd}`
                            : displayPeriodStart || displayPeriodEnd || 'Periode tidak tersedia'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
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
                             <DropdownMenuItem
                                  disabled={exporting || !profitData}
                                 onClick={() => { void safeHandleExportCSV() }}
                             >
                                <FileText className="h-4 w-4 mr-2" />
                                Ekspor CSV
                            </DropdownMenuItem>

                             <DropdownMenuItem
                                 disabled={printing}
                                 onClick={() => { safeHandlePrint() }}
                             >
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
            <ProfitMetrics summary={summary!} isMobile={isMobile} />

            {/* Profit Breakdown */}
            <ProfitBreakdown summary={summary!} formatCurrency={formatCurrency} />

            {/* Tabbed Content */}
            <ProfitReportTabs
                profitData={profitData!}
                selectedDataPoint={selectedDataPoint}
                setSelectedDataPoint={setSelectedDataPoint}
                compareMode={compareMode}
                comparisonData={comparisonData ?? null}
            />
        </div>
    )
}