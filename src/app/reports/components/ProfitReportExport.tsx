// Export utilities for Profit Report
'use client'

import { saveAs } from 'file-saver'

import type { ProfitData } from './ProfitReportTypes'

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

interface ExportToPDFProps {
    profitData: ProfitData
    dateRange: { start: string; end: string }
    formatCurrency: (amount: number) => string
}

export const exportToPDF = ({ profitData, dateRange, formatCurrency }: ExportToPDFProps) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow || !profitData) {
        return
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Profit Report - ${dateRange.start} to ${dateRange.end}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .summary { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1>Laporan Profit & Loss</h1>
            <p>Periode: ${new Date(profitData.summary.period.start).toLocaleDateString('id-ID')} - ${new Date(profitData.summary.period.end).toLocaleDateString('id-ID')}</p>

            <div class="summary">
                <h2>Ringkasan</h2>
                <p>Total Revenue: ${formatCurrency(profitData.summary.total_revenue)}</p>
                <p>COGS: ${formatCurrency(profitData.summary.total_cogs)}</p>
                <p>Gross Profit: ${formatCurrency(profitData.summary.gross_profit)}</p>
                <p>Net Profit: ${formatCurrency(profitData.summary.net_profit)}</p>
            </div>

            <h2>Data per Periode</h2>
            <table>
                <thead>
                    <tr>
                        <th>Periode</th>
                        <th>Revenue</th>
                        <th>COGS</th>
                        <th>Gross Profit</th>
                        <th>Margin</th>
                        <th>Pesanan</th>
                    </tr>
                </thead>
                <tbody>
                    ${profitData.profit_by_period.map(item => `
                        <tr>
                            <td>${item.period}</td>
                            <td>${formatCurrency(item.revenue)}</td>
                            <td>${formatCurrency(item.cogs)}</td>
                            <td>${formatCurrency(item.gross_profit)}</td>
                            <td>${item.gross_margin.toFixed(1)}%</td>
                            <td>${item.orders_count}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.print()
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

    const handleExportPDF = () => {
        if (profitData) {
            exportToPDF({ profitData, dateRange, formatCurrency })
        }
    }

    const handlePrint = () => {
        printReport()
    }

    return {
        handleExportCSV,
        handleExportPDF,
        handlePrint
    }
}
