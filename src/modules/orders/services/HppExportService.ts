import { dbLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase-generated'

export interface ExportOptions {
  format: 'csv' | 'excel' | 'json' | 'pdf'
  recipeIds?: string[]
  dateRange?: {
    start: string
    end: string
  }
  metrics?: string[]
}

export class HppExportService {
  private logger = dbLogger
  private supabase = createClient()

  /**
   * Export HPP data in specified format
   */
  async exportHppData(options: ExportOptions): Promise<{
    data: string | Blob
    filename: string
    mimeType: string
  }> {
    try {
      this.logger.info({ format: options.format }, 'Exporting HPP data')

      // Get data based on options
      const data = await this.getExportData(options)

      // Format data based on requested format
      switch (options.format) {
        case 'csv':
          return this.exportAsCsv(data)
        case 'excel':
          return this.exportAsExcel(data)
        case 'json':
          return this.exportAsJson(data)
        case 'pdf':
          return this.exportAsPdf(data)
        default:
          throw new Error(`Unsupported export format: ${options.format}`)
      }

    } catch (err: unknown) {
      this.logger.error({ error: err }, `Failed to export HPP data`)
      throw err
    }
  }

  /**
   * Get data for export based on options
   */
  private async getExportData(options: ExportOptions): Promise<{
    calculations: Array<{
      recipes?: { name?: string; category?: string; selling_price?: number }
      calculation_date: string
      total_hpp?: number
      material_cost?: number
      labor_cost?: number
      overhead_cost?: number
    }>
    snapshots: unknown[]
    alerts: unknown[]
    metadata: {
      exportDate: string
      options: ExportOptions
      totalRecords: number
    }
  }> {
    const { recipeIds, dateRange, metrics = ['hpp', 'margin', 'cost_breakdown'] } = options

    // Build query for HPP data
    let query = supabase
      .from('hpp_calculations')
      .select(`
        *,
        recipes (
          id,
          name,
          category,
          selling_price
        )
      `)

    if (recipeIds && recipeIds.length > 0) {
      query = query.in('recipe_id', recipeIds)
    }

    if (dateRange) {
      query = query
        .gte('calculation_date', dateRange.start)
        .lte('calculation_date', dateRange.end)
    }

    const { data: calculations, error } = await query

    if (error) {
      throw new Error(`Failed to fetch calculations: ${error.message}`)
    }

    // Get snapshots data if needed
    let snapshots = []
    if (metrics.includes('trends') || metrics.includes('alerts')) {
      const snapshotQuery = supabase
        .from('hpp_snapshots')
        .select('*')

      if (recipeIds && recipeIds.length > 0) {
        snapshotQuery.in('recipe_id', recipeIds)
      }

      if (dateRange) {
        snapshotQuery
          .gte('snapshot_date', dateRange.start)
          .lte('snapshot_date', dateRange.end)
      }

      const { data: snapshotData } = await snapshotQuery
      snapshots = snapshotData || []
    }

    // Get alerts data if needed
    let alerts = []
    if (metrics.includes('alerts')) {
      const alertQuery = supabase
        .from('hpp_alerts')
        .select(`
          *,
          recipes (
            id,
            name
          )
        `)

      if (recipeIds && recipeIds.length > 0) {
        alertQuery.in('recipe_id', recipeIds)
      }

      const { data: alertData } = await alertQuery
      alerts = alertData || []
    }

    return {
      calculations: calculations || [],
      snapshots,
      alerts,
      metadata: {
        exportDate: new Date().toISOString(),
        options,
        totalRecords: (calculations || []).length
      }
    }
  }

  /**
   * Export as CSV format
   */
  private exportAsCsv(data: ReturnType<typeof this.getExportData> extends Promise<infer T> ? T : never): { data: string; filename: string; mimeType: string } {
    const headers = [
      'Recipe Name',
      'Category',
      'Calculation Date',
      'HPP Value',
      'Material Cost',
      'Labor Cost',
      'Overhead Cost',
      'Selling Price',
      'Margin',
      'Margin %'
    ]

    const rows = data.calculations.map((calc) => [
      calc.recipes?.name || 'Unknown',
      calc.recipes?.category || 'General',
      calc.calculation_date,
      calc.total_hpp || 0,
      calc.material_cost || 0,
      calc.labor_cost || 0,
      calc.overhead_cost || 0,
      calc.recipes?.selling_price || 0,
      (calc.recipes?.selling_price || 0) - (calc.total_hpp || 0),
      calc.recipes?.selling_price
        ? (((calc.recipes.selling_price - (calc.total_hpp || 0)) / calc.recipes.selling_price) * 100).toFixed(2)
        : '0'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row: (string | number)[]) => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return {
      data: csvContent,
      filename: `hpp-data-${new Date().toISOString().split('T')[0]}.csv`,
      mimeType: 'text/csv'
    }
  }

  /**
   * Export as Excel format (simplified - would need exceljs in production)
   */
  private exportAsExcel(data: ReturnType<typeof this.getExportData> extends Promise<infer T> ? T : never): { data: string; filename: string; mimeType: string } {
    // For now, return CSV as Excel (would need proper Excel library)
    const csvExport = this.exportAsCsv(data)

    return {
      data: csvExport.data,
      filename: csvExport.filename.replace('.csv', '.xlsx'),
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  }

  /**
   * Export as JSON format
   */
  private exportAsJson(data: ReturnType<typeof this.getExportData> extends Promise<infer T> ? T : never): { data: string; filename: string; mimeType: string } {
    return {
      data: JSON.stringify(data, null, 2),
      filename: `hpp-data-${new Date().toISOString().split('T')[0]}.json`,
      mimeType: 'application/json'
    }
  }

  /**
   * Export as PDF format (simplified - would need pdf library)
   */
  private exportAsPdf(data: ReturnType<typeof this.getExportData> extends Promise<infer T> ? T : never): { data: string; filename: string; mimeType: string } {
    // Simplified PDF export - would need proper PDF generation library
    const pdfContent = this.generatePdfContent(data)

    return {
      data: pdfContent,
      filename: `hpp-report-${new Date().toISOString().split('T')[0]}.pdf`,
      mimeType: 'application/pdf'
    }
  }

  /**
   * Generate simple PDF content (placeholder)
   */
  private generatePdfContent(data: ReturnType<typeof this.getExportData> extends Promise<infer T> ? T : never): string {
    const lines = [
      'HPP Cost Analysis Report',
      `Generated: ${new Date().toLocaleString()}`,
      `Total Calculations: ${data.calculations.length}`,
      '',
      'Summary:',
      ...data.calculations.slice(0, 10).map((calc) =>
        `${calc.recipes?.name || 'Unknown'}: HPP ${calc.total_hpp || 0}`
      ),
      '',
      data.calculations.length > 10 ? `... and ${data.calculations.length - 10} more recipes` : ''
    ]

    return lines.join('\n')
  }

  /**
   * Download file helper
   */
  static downloadFile(data: string | Blob, filename: string, mimeType: string) {
    const blob = new Blob([data], { type: mimeType })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  /**
   * Get available export formats
   */
  static getExportFormats() {
    return [
      { value: 'csv', label: 'CSV', description: 'Comma-separated values' },
      { value: 'excel', label: 'Excel', description: 'Microsoft Excel format' },
      { value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
      { value: 'pdf', label: 'PDF', description: 'Portable Document Format' }
    ]
  }
}
