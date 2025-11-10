// Export utilities for Profit Report
'use client'

import { saveAs } from 'file-saver'

import { HtmlEscaper } from '@/utils/security/index'

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

interface ExportToPDFProps {
    profitData: ProfitData
    dateRange: { start: string; end: string }
    formatCurrency: (amount: number) => string
}

export const exportToPDF = ({ profitData, dateRange, formatCurrency }: ExportToPDFProps) => {
    if (!profitData) {
        return
    }

    // Escape all dynamic content to prevent XSS
    const escapedTitle = HtmlEscaper.escape(`Profit Report - ${dateRange.start} to ${dateRange.end}`)
    const escapedStartDate = HtmlEscaper.escape(new Date(profitData.summary.period.start).toLocaleDateString('id-ID'))
    const escapedEndDate = HtmlEscaper.escape(new Date(profitData.summary.period.end).toLocaleDateString('id-ID'))
    const escapedRevenue = HtmlEscaper.escape(formatCurrency(profitData.summary.total_revenue))
    const escapedCogs = HtmlEscaper.escape(formatCurrency(profitData.summary.total_cogs))
    const escapedGrossProfit = HtmlEscaper.escape(formatCurrency(profitData.summary.gross_profit))
    const escapedNetProfit = HtmlEscaper.escape(formatCurrency(profitData.summary.net_profit))

    // PDF export styles - inline styles required for PDF generation
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${escapedTitle}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .summary { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            <h1>Laporan Profit & Loss</h1>
            <p>Periode: ${escapedStartDate} - ${escapedEndDate}</p>

            <div class="summary">
                <h2>Ringkasan</h2>
                <p>Total Revenue: ${escapedRevenue}</p>
                <p>COGS: ${escapedCogs}</p>
                <p>Gross Profit: ${escapedGrossProfit}</p>
                <p>Net Profit: ${escapedNetProfit}</p>
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
                            <td>${HtmlEscaper.escape(item.period)}</td>
                            <td>${HtmlEscaper.escape(formatCurrency(item.revenue))}</td>
                            <td>${HtmlEscaper.escape(formatCurrency(item.cogs))}</td>
                            <td>${HtmlEscaper.escape(formatCurrency(item.gross_profit))}</td>
                            <td>${HtmlEscaper.escape(item.gross_margin.toFixed(1))}%</td>
                            <td>${HtmlEscaper.escape(item.orders_count)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 1000);
                }
            </script>
        </body>
        </html>
    `

    // Use secure Blob approach instead of document.write
    const secureWindow = HtmlEscaper.openSecureWindow(htmlContent, '_blank')
    if (!secureWindow) {
        console.error('Failed to open export window')
    }
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
