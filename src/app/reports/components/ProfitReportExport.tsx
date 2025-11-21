// Export utilities for Profit Report
'use client'

import { useCallback, useState } from 'react'

import { createLogger } from '@/lib/logger'

import type { ProfitData } from '@/app/reports/components/ProfitReportTypes'

interface ExportToCSVProps {
    profitData: ProfitData
    dateRange: { start: string; end: string }
}

const logger = createLogger('ProfitReportExport')

// Native browser download function - no external dependencies
const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export const exportToCSV = async ({ profitData, dateRange }: ExportToCSVProps) => {
    if (!profitData || !dateRange?.start || !dateRange?.end) {
        logger.warn('Missing profit data or date range for CSV export')
        return
    }

    try {
        const profitByPeriod = profitData?.profit_by_period ?? []
        const csvData = [
            ['Periode', 'Pendapatan', 'HPP', 'Laba Kotor', 'Margin Laba Kotor', 'Jumlah Pesanan'],
            ...profitByPeriod.map(item => [
                item.period,
                item.revenue.toString(),
                item.cogs.toString(),
                item.gross_profit.toString(),
                `${item.gross_margin.toFixed(2)}%`,
                item.orders_count.toString()
            ])
        ]

        const csvContent = csvData.map(row => row.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

        downloadBlob(blob, `profit-report-${dateRange.start}-to-${dateRange.end}.csv`)
        logger.info('Profit report CSV exported successfully')
    } catch (error) {
        logger.error({ error }, 'Failed to export profit report CSV')
        throw error
    }
}

export const printReport = () => {
    if (typeof window === 'undefined' || typeof window.print !== 'function') {
        logger.warn('printReport called outside of browser environment')
        return
    }

    window.print()
}

// Combined export utility hook
interface ExportUtilitiesProps {
    profitData: ProfitData | null
    dateRange: { start?: string; end?: string }
}

export const useExportUtilities = ({
    profitData,
    dateRange
}: ExportUtilitiesProps) => {
    const [exporting, setExporting] = useState(false)
    const [printing, setPrinting] = useState(false)

    const handleExportCSV = useCallback(async () => {
        if (!profitData || !dateRange.start || !dateRange.end) {
            return
        }

        try {
            setExporting(true)
            await exportToCSV({ profitData, dateRange: { start: dateRange.start, end: dateRange.end } })
        } catch (error) {
            logger.error({ error }, 'Profit report CSV export failed')
        } finally {
            setExporting(false)
        }
    }, [profitData, dateRange.start, dateRange.end])

    const handlePrint = useCallback(() => {
        try {
            setPrinting(true)
            printReport()
        } catch (error) {
            logger.error({ error }, 'Profit report print failed')
        } finally {
            setPrinting(false)
        }
    }, [])

    return {
        handleExportCSV,
        handlePrint,
        exporting,
        printing
    }
}
