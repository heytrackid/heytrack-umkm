import { createServerSupabaseAdmin } from '@/lib/supabase'
import { getErrorMessage } from '@/lib/type-guards'
import { CostBreakdown, HPPSnapshot, TimePeriod } from '@/types/hpp-tracking'
import { NextRequest, NextResponse } from 'next/server'
import { HPPExportQuerySchema } from '@/lib/validations'

import { apiLogger } from '@/lib/logger'
// GET /api/hpp/export - Export HPP data to Excel
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        // Validate query parameters
        const queryValidation = HPPExportQuerySchema.safeParse({
            recipe_id: searchParams.get('recipe_id'),
            period: searchParams.get('period'),
            format: searchParams.get('format'),
        })

        if (!queryValidation.success) {
            return NextResponse.json(
                {
                    error: 'Invalid query parameters',
                    details: queryValidation.error.issues
                },
                { status: 400 }
            )
        }

        const { recipe_id, period, format } = queryValidation.data

        const supabase = createServerSupabaseAdmin()

        // Get recipe details
        const { data: recipe, error: recipeError } = await supabase
            .from('recipes')
            .select('name')
            .eq('id', recipe_id)
            .single()

        if (recipeError || !recipe) {
            return NextResponse.json(
                { error: 'Recipe not found' },
                { status: 404 }
            )
        }

        // Calculate date range
        const dateRange = calculateDateRange(period)

        // Fetch snapshots
        const { data: snapshots, error: snapshotsError } = await supabase
            .from('hpp_snapshots')
            .select('*')
            .eq('recipe_id', recipe_id)
            .gte('snapshot_date', dateRange.start)
            .lte('snapshot_date', dateRange.end)
            .order('snapshot_date', { ascending: true })

        if (snapshotsError) {
            apiLogger.error({ error: snapshotsError }, 'Error fetching snapshots:')
            return NextResponse.json(
                { error: 'Failed to fetch snapshots', details: (snapshotsError as any).message },
                { status: 500 }
            )
        }

        if (!snapshots || snapshots.length === 0) {
            return NextResponse.json(
                { error: 'No data available for export' },
                { status: 404 }
            )
        }

        // Type cast snapshots to HPPSnapshot[]
        const typedSnapshots = snapshots as any as HPPSnapshot[]

        // Calculate summary statistics
        const hppValues = typedSnapshots.map(s => s.hpp_value)
        const summary = {
            min: Math.min(...hppValues),
            max: Math.max(...hppValues),
            avg: hppValues.reduce((sum, val) => sum + val, 0) / hppValues.length,
            trend: determineTrend(typedSnapshots),
            total_change: hppValues[hppValues.length - 1] - hppValues[0],
            total_change_percentage: ((hppValues[hppValues.length - 1] - hppValues[0]) / hppValues[0]) * 100
        }

        // Prepare export data
        const exportData = {
            recipe_name: recipe.name,
            period,
            date_range: dateRange,
            snapshots: typedSnapshots.map(snapshot => ({
                date: formatDate(snapshot.snapshot_date),
                hpp_value: snapshot.hpp_value,
                material_cost: snapshot.material_cost,
                operational_cost: snapshot.operational_cost,
                selling_price: snapshot.selling_price || 0,
                margin_percentage: snapshot.margin_percentage || 0,
                cost_breakdown: snapshot.cost_breakdown
            })),
            summary
        }

        // Generate Excel file using ExcelJS
        const ExcelJS = await import('exceljs')
        const workbook = new ExcelJS.Workbook()

        // Sheet 1: Snapshot Data
        const snapshotSheet = workbook.addWorksheet('HPP History')
        snapshotSheet.columns = [
            { header: 'Tanggal', key: 'date', width: 20 },
            { header: 'HPP', key: 'hpp_value', width: 18 },
            { header: 'Biaya Bahan', key: 'material_cost', width: 18 },
            { header: 'Biaya Operasional', key: 'operational_cost', width: 20 },
            { header: 'Harga Jual', key: 'selling_price', width: 18 },
            { header: 'Margin (%)', key: 'margin_percentage', width: 15 }
        ]

        exportData.snapshots.forEach(snapshot => {
            snapshotSheet.addRow({
                date: snapshot.date,
                hpp_value: snapshot.hpp_value,
                material_cost: snapshot.material_cost,
                operational_cost: snapshot.operational_cost,
                selling_price: snapshot.selling_price,
                margin_percentage: snapshot.margin_percentage
            })
        })

        // Format currency columns with Indonesian Rupiah format
        snapshotSheet.getColumn('hpp_value').numFmt = 'Rp #,##0'
        snapshotSheet.getColumn('material_cost').numFmt = 'Rp #,##0'
        snapshotSheet.getColumn('operational_cost').numFmt = 'Rp #,##0'
        snapshotSheet.getColumn('selling_price').numFmt = 'Rp #,##0'
        snapshotSheet.getColumn('margin_percentage').numFmt = '0.00"%"'

        // Style header row
        snapshotSheet.getRow(1).font = { bold: true, size: 12 }
        snapshotSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        }
        ;(snapshotSheet.getRow(1).font as any).color = { argb: 'FFFFFFFF' }
        snapshotSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

        // Add borders to all cells
        snapshotSheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }
            })
        })

        // Sheet 2: Summary Statistics
        const summarySheet = workbook.addWorksheet('Ringkasan')
        summarySheet.columns = [
            { header: 'Metrik', key: 'metric', width: 30 },
            { header: 'Nilai', key: 'value', width: 25 }
        ]

        // Add title
        summarySheet.mergeCells('A1:B1')
        summarySheet.getCell('A1').value = 'RINGKASAN DATA HPP'
        summarySheet.getCell('A1').font = { bold: true, size: 14 }
        summarySheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
        summarySheet.getCell('A1').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        }
        summarySheet.getCell('A1').font = { bold: true, size: 14 }
        summarySheet.getCell('A1').font.color = { argb: 'FFFFFFFF' }
        summarySheet.getRow(1).height = 25

        // Add data starting from row 3
        summarySheet.addRow({})
        summarySheet.addRow({ metric: 'Nama Produk', value: exportData.recipe_name })
        summarySheet.addRow({ metric: 'Periode', value: getPeriodLabel(period) })
        summarySheet.addRow({ metric: 'Tanggal Mulai', value: formatDate(dateRange.start) })
        summarySheet.addRow({ metric: 'Tanggal Akhir', value: formatDate(dateRange.end) })
        summarySheet.addRow({ metric: '', value: '' })
        summarySheet.addRow({ metric: 'HPP Minimum', value: formatCurrency(summary.min) })
        summarySheet.addRow({ metric: 'HPP Maksimum', value: formatCurrency(summary.max) })
        summarySheet.addRow({ metric: 'HPP Rata-rata', value: formatCurrency(summary.avg) })
        summarySheet.addRow({ metric: 'Trend', value: summary.trend })
        summarySheet.addRow({ metric: 'Total Perubahan', value: formatCurrency(summary.total_change) })
        summarySheet.addRow({ metric: 'Perubahan (%)', value: summary.total_change_percentage.toFixed(2) + '%' })

        // Style metric column
        summarySheet.getColumn('metric').font = { bold: true }
        summarySheet.getColumn('metric').alignment = { horizontal: 'left' }

        // Add borders
        summarySheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    }
                })
            }
        })

        // Sheet 3: Cost Breakdown (Latest)
        const latestSnapshot = typedSnapshots[typedSnapshots.length - 1]
        const breakdown = latestSnapshot.cost_breakdown as CostBreakdown

        const breakdownSheet = workbook.addWorksheet('Rincian Biaya')
        breakdownSheet.columns = [
            { header: 'Komponen', key: 'component', width: 35 },
            { header: 'Biaya', key: 'cost', width: 20 },
            { header: 'Persentase (%)', key: 'percentage', width: 18 }
        ]

        // Style header
        breakdownSheet.getRow(1).font = { bold: true, size: 12 }
        breakdownSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        }
        ;(breakdownSheet.getRow(1).font as any).color = { argb: 'FFFFFFFF' }
        breakdownSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

        // Add ingredients section
        const ingredientsHeaderRow = breakdownSheet.addRow({ component: 'BAHAN BAKU', cost: '', percentage: '' })
        ingredientsHeaderRow.font = { bold: true, size: 11 }
        ingredientsHeaderRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9E1F2' }
        }

        breakdown.ingredients.forEach(ingredient => {
            breakdownSheet.addRow({
                component: '  ' + ingredient.name,
                cost: ingredient.cost,
                percentage: ingredient.percentage.toFixed(2)
            })
        })

        // Add operational costs section
        breakdownSheet.addRow({ component: '', cost: '', percentage: '' })
        const operationalHeaderRow = breakdownSheet.addRow({ component: 'BIAYA OPERASIONAL', cost: '', percentage: '' })
        operationalHeaderRow.font = { bold: true, size: 11 }
        operationalHeaderRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9E1F2' }
        }

        ;(breakdown.operational || breakdown.operational_costs || []).forEach(opCost => {
            breakdownSheet.addRow({
                component: '  ' + opCost.category,
                cost: opCost.cost,
                percentage: opCost.percentage.toFixed(2)
            })
        })

        // Add total row
        breakdownSheet.addRow({ component: '', cost: '', percentage: '' })
        const totalRow = breakdownSheet.addRow({
            component: 'TOTAL HPP',
            cost: latestSnapshot.hpp_value,
            percentage: '100.00'
        })
        totalRow.font = { bold: true, size: 11 }
        totalRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFC000' }
        }

        // Format breakdown sheet
        breakdownSheet.getColumn('cost').numFmt = 'Rp #,##0'
        breakdownSheet.getColumn('percentage').numFmt = '0.00"%"'

        // Add borders
        breakdownSheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }
            })
        })

        // Sheet 4: Chart Data (for easy charting in Excel)
        const chartDataSheet = workbook.addWorksheet('Data Grafik')
        chartDataSheet.columns = [
            { header: 'Tanggal', key: 'date', width: 20 },
            { header: 'HPP', key: 'hpp', width: 18 },
            { header: 'Biaya Bahan', key: 'material', width: 18 },
            { header: 'Biaya Operasional', key: 'operational', width: 20 }
        ]

        // Style header
        chartDataSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        }
        chartDataSheet.getRow(1).font = { bold: true, size: 12 }
        ;(chartDataSheet.getRow(1).font as any).color = { argb: 'FFFFFFFF' }
        chartDataSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

        // Add chart data
        exportData.snapshots.forEach(snapshot => {
            chartDataSheet.addRow({
                date: snapshot.date,
                hpp: snapshot.hpp_value,
                material: snapshot.material_cost,
                operational: snapshot.operational_cost
            })
        })

        // Format number columns
        chartDataSheet.getColumn('hpp').numFmt = '#,##0'
        chartDataSheet.getColumn('material').numFmt = '#,##0'
        chartDataSheet.getColumn('operational').numFmt = '#,##0'

        // Add borders
        chartDataSheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }
            })
        })

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer()

        // Create filename
        const filename = `HPP_History_${recipe.name.replace(/[^a-z0-9]/gi, '_')}_${formatDate(new Date().toISOString())}.xlsx`

        // Return file as download
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        })

    } catch (error: unknown) {
        apiLogger.error({ error: error }, 'Error in export endpoint:')
        return NextResponse.json(
            { error: 'Export failed', details: getErrorMessage(error) },
            { status: 500 }
        )
    }
}

// Helper function to calculate date range
function calculateDateRange(period: TimePeriod): { start: string; end: string } {
    const end = new Date()
    const start = new Date(end)

    switch (period) {
        case '7d':
            start.setDate(start.getDate() - 7)
            break
        case '30d':
            start.setDate(start.getDate() - 30)
            break
        case '90d':
            start.setDate(start.getDate() - 90)
            break
        case '1y':
            start.setFullYear(start.getFullYear() - 1)
            break
        default:
            start.setDate(start.getDate() - 30)
    }

    return {
        start: start.toISOString(),
        end: end.toISOString()
    }
}

// Helper function to format date in user's locale
function formatDate(dateString: string): string {
    const date = new Date(dateString)
    // Use Indonesian locale for consistency
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

// Helper function to format currency values
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value)
}

// Helper function to get period label
function getPeriodLabel(period: TimePeriod): string {
    const labels: Record<TimePeriod, string> = {
        '7d': '7 Hari Terakhir',
        '30d': '30 Hari Terakhir',
        '90d': '90 Hari Terakhir',
        '1y': '1 Tahun Terakhir',
        'all': 'Semua Data'
    }
    return labels[period] || period
}

// Helper function to determine trend
function determineTrend(snapshots: HPPSnapshot[]): string {
    if (snapshots.length < 2) return 'Stable'

    const firstValue = snapshots[0].hpp_value
    const lastValue = snapshots[snapshots.length - 1].hpp_value
    const changePercentage = ((lastValue - firstValue) / firstValue) * 100

    if (changePercentage > 5) return 'Naik'
    if (changePercentage < -5) return 'Turun'
    return 'Stabil'
}
