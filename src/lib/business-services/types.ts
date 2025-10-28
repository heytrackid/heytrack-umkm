/**
 * Business Services Types
 * Type definitions for business service operations
 */

export interface ExportData<T = Record<string, unknown>> {
  filename: string
  data: T[]
  headers?: string[]
  sheets?: Array<{ name: string; data: T[]; headers?: string[] }>
}

export interface ExcelExportOptions {
  filename?: string
  sheetName?: string
  includeHeaders?: boolean
  dateFormat?: string
}

export interface ProductionBatch {
  id: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  recipe_id: string
  quantity: number
  scheduled_date: string
  completed_date?: string
  notes?: string
}

export interface ReorderSummary {
  items: Array<{
    id: string
    name: string
    current_stock: number
    min_stock: number
    reorder_quantity: number
    urgency: 'low' | 'medium' | 'high'
  }>
  totalItems: number
  criticalItems: number
}
