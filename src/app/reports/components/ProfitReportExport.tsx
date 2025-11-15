// Export utilities for Profit Report
'use client'

import { saveAs } from 'file-saver'


import { createLogger } from '@/lib/logger'

import type { ProfitData } from '@/app/reports/components/ProfitReportTypes'

interface ExportToCSVProps {
    profitData: ProfitData
    dateRange: { start: string; end: string }
}

export const exportToCSV = ({ profitData, dateRange }: ExportToCSVProps) => {
    if (!profitData) {
        return
    }

    const csvData = [
        ['Period', 'Revenue', 'COGS', 'Gross Profit', 'Gross Margin', 'Orders Count'],
        ...profitData.profit_by_period.map(item => [
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
    saveAs(blob, `profit-report-${dateRange.start}-to-${dateRange.end}.csv`)
}



export const printReport = () => {
    window.print()
}

// Combined export utility hook
interface ExportUtilitiesProps {
    profitData: ProfitData | null
    dateRange: { start: string; end: string }
    formatCurrency: (amount: number) => string
}

export const useExportUtilities = ({
    profitData,
    dateRange,
    formatCurrency
}: ExportUtilitiesProps) => {
    const handleExportCSV = () => {
        if (profitData) {
            exportToCSV({ profitData, dateRange })
        }
    }



    const handlePrint = () => {
        printReport()
    }

    return {
        handleExportCSV,
        handlePrint
    }
}
