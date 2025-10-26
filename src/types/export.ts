// Export and data transformation types

/**
 * Generic export data structure
 */
export interface ExportData<T = Record<string, unknown>> {
  headers?: string[]
  data: T[]
  filename?: string
  metadata?: ExportMetadata
}

/**
 * Export metadata
 */
export interface ExportMetadata {
  exported_at: string
  exported_by?: string
  total_records: number
  filters_applied?: Record<string, unknown>
  source: string
}

/**
 * Export options for customizing output
 */
export interface ExportOptions {
  format?: ExportFormat
  includeHeaders?: boolean
  dateFormat?: string
  numberFormat?: string
  encoding?: 'utf-8' | 'utf-16' | 'iso-8859-1'
  delimiter?: string
  columns?: string[]
  excludeColumns?: string[]
  transformers?: Record<string, (value: unknown) => unknown>
}

/**
 * Supported export formats
 */
export type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf'

/**
 * CSV export options
 */
export interface CSVExportOptions extends ExportOptions {
  format: 'csv'
  delimiter?: ',' | ';' | '\t' | '|'
  quoteChar?: string
  escapeChar?: string
  lineTerminator?: '\n' | '\r\n'
}

/**
 * Excel export options
 */
export interface ExcelExportOptions extends ExportOptions {
  format: 'excel'
  sheetName?: string
  includeFormulas?: boolean
  autoFilter?: boolean
  freezeHeader?: boolean
  columnWidths?: Record<string, number>
  styles?: ExcelStyles
}

/**
 * Excel styling options
 */
export interface ExcelStyles {
  headerStyle?: CellStyle
  dataStyle?: CellStyle
  alternateRowStyle?: CellStyle
}

/**
 * Cell style for Excel
 */
export interface CellStyle {
  font?: {
    bold?: boolean
    italic?: boolean
    size?: number
    color?: string
  }
  fill?: {
    type?: 'solid' | 'pattern'
    color?: string
  }
  alignment?: {
    horizontal?: 'left' | 'center' | 'right'
    vertical?: 'top' | 'middle' | 'bottom'
  }
  border?: {
    top?: BorderStyle
    right?: BorderStyle
    bottom?: BorderStyle
    left?: BorderStyle
  }
}

/**
 * Border style for Excel cells
 */
export interface BorderStyle {
  style?: 'thin' | 'medium' | 'thick' | 'double'
  color?: string
}

/**
 * Export result
 */
export interface ExportResult {
  success: boolean
  blob?: Blob
  url?: string
  filename: string
  size?: number
  error?: string
}

/**
 * Batch export configuration
 */
export interface BatchExportConfig<T = Record<string, unknown>> {
  exports: Array<{
    name: string
    data: T[]
    options?: ExportOptions
  }>
  format: ExportFormat
  zipFilename?: string
}

/**
 * Export template for reusable configurations
 */
export interface ExportTemplate {
  id: string
  name: string
  description?: string
  format: ExportFormat
  options: ExportOptions
  columns: ColumnConfig[]
  created_at: string
  updated_at: string
}

/**
 * Column configuration for exports
 */
export interface ColumnConfig {
  key: string
  label: string
  type?: 'string' | 'number' | 'date' | 'boolean' | 'currency'
  format?: string
  width?: number
  transformer?: (value: unknown) => unknown
  visible?: boolean
}

/**
 * Import data structure (reverse of export)
 */
export interface ImportData<T = Record<string, unknown>> {
  data: T[]
  errors: ImportError[]
  warnings: ImportWarning[]
  metadata: ImportMetadata
}

/**
 * Import error
 */
export interface ImportError {
  row: number
  column?: string
  message: string
  value?: unknown
}

/**
 * Import warning
 */
export interface ImportWarning {
  row: number
  column?: string
  message: string
  suggestion?: string
}

/**
 * Import metadata
 */
export interface ImportMetadata {
  imported_at: string
  imported_by?: string
  total_rows: number
  successful_rows: number
  failed_rows: number
  source_filename: string
  format: ExportFormat
}

/**
 * Import options
 */
export interface ImportOptions {
  skipHeader?: boolean
  validateData?: boolean
  transformData?: boolean
  stopOnError?: boolean
  batchSize?: number
  columnMapping?: Record<string, string>
}
