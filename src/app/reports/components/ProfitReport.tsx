'use client'

import { TrendingUp, AlertCircle, RefreshCw } from '@/components/icons'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'

// Import our separated components
import { ProfitMetrics, ProfitBreakdown } from '@/app/reports/components/ProfitReportMetrics'
import { ProfitReportTabs } from '@/app/reports/components/ProfitReportTabs'

import type { ProfitReportProps, ProfitData, SelectedDataPoint } from '@/app/reports/components/ProfitReportTypes'

// Main component
export const ProfitReport = ({}: ProfitReportProps = {}) => {
    const { formatCurrency } = useCurrency()
    const [selectedDataPoint, setSelectedDataPoint] = useState<SelectedDataPoint | null>(null)
    const [compareMode] = useState(false)

    // Data fetching with React Query
    const {
        data: profitData,
        isLoading: loading,
        error,
        refetch
    } = useQuery({
        queryKey: ['profit-report'],
        queryFn: async (): Promise<ProfitData> => {
            const params = new URLSearchParams()
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

    // Comparison data query - compare with previous period
    const {
        data: comparisonData
    } = useQuery({
        queryKey: ['profit-report-comparison', compareMode],
        queryFn: async (): Promise<ProfitData | null> => {
            if (!compareMode) return null

            // Calculate previous period date range
            const now = new Date()
            const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1) // Start of current month
            const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0) // End of current month

            const previousPeriodStart = new Date(currentPeriodStart)
            previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
            const previousPeriodEnd = new Date(currentPeriodEnd)
            previousPeriodEnd.setMonth(previousPeriodEnd.getMonth() - 1)

            const params = new URLSearchParams()
            params.set('start_date', previousPeriodStart.toISOString().split('T')[0] || previousPeriodStart.toISOString().substring(0, 10))
            params.set('end_date', previousPeriodEnd.toISOString().split('T')[0] || previousPeriodEnd.toISOString().substring(0, 10))
            params.set('include_breakdown', 'true')

            const response = await fetch(`/api/reports/profit?${params.toString()}`)
            if (!response.ok) {
                throw new Error('Failed to fetch comparison data')
            }

            return (await response.json()) as unknown as ProfitData
        },
        enabled: compareMode,
        refetchInterval: 5 * 60 * 1000,
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false
    })

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

    const { summary, period } = profitData!
    const resolvedPeriodStart = period?.start ?? ''
    const resolvedPeriodEnd = period?.end ?? ''
    const safeFormatDate = (value: string | undefined) => {
        if (!value) { return null }
        const parsed = new Date(value)
        return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleDateString('id-ID')
    }
    const displayPeriodStart = safeFormatDate(resolvedPeriodStart)
    const displayPeriodEnd = safeFormatDate(resolvedPeriodEnd)

    return (
        <div className="space-y-6">
            {/* Header */}
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



            {/* Key Metrics Cards */}
            <ProfitMetrics summary={summary!} isMobile={false} />

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