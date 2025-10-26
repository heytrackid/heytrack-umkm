/**
 * Excel Export Service
 * Service for exporting data to Excel format
 */

import ExcelJS from 'exceljs'
import type { ExportData, ExcelExportOptions } from './types'

export class ExcelExportService {
  private static instance: ExcelExportService

  private constructor() {}

  static getInstance(): ExcelExportService {
    if (!ExcelExportService.instance) {
      ExcelExportService.instance = new ExcelExportService()
    }
    return ExcelExportService.instance
  }

  async exportToExcel(data: ExportData, options: ExcelExportOptions = {}): Promise<Blob> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(options.sheetName || 'Sheet1')

    // Add headers if provided
    if (options.includeHeaders !== false && data.headers) {
      worksheet.addRow(data.headers)
    }

    // Add data rows
    data.data.forEach(row => {
      worksheet.addRow(Array.isArray(row) ? row : Object.values(row))
    })

    // Handle multiple sheets if provided
    if (data.sheets) {
      data.sheets.forEach((sheet, index) => {
        if (index === 0) return // Skip first sheet as it's already created

        const ws = workbook.addWorksheet(sheet.name)

        if (sheet.headers && options.includeHeaders !== false) {
          ws.addRow(sheet.headers)
        }

        sheet.data.forEach(row => {
          ws.addRow(Array.isArray(row) ? row : Object.values(row))
        })
      })
    }

    const buffer = await workbook.xlsx.writeBuffer()
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
  }

  exportToCSV(data: ExportData, options: ExcelExportOptions = {}): string {
    const lines: string[] = []

    // Add headers
    if (options.includeHeaders !== false && data.headers) {
      lines.push(data.headers.join(','))
    }

    // Add data rows
    data.data.forEach(row => {
      const values = Array.isArray(row) ? row : Object.values(row)
      const csvRow = values.map(value => {
        // Escape commas and quotes in CSV
        const stringValue = String(value || '')
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }).join(',')
      lines.push(csvRow)
    })

    return lines.join('\n')
  }
}
