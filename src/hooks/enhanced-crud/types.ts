import type { TableName, Row, Insert, Update } from '@/types/database'

export interface EnhancedCRUDOptions {
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessages?: {
    create?: string
    update?: string
    delete?: string
  }
  customErrorHandler?: (error: Error, operation: 'create' | 'delete' | 'update') => void
}

export interface BulkUpdateItem<T extends TableName> {
  id: string
  data: Update<T>
}

export interface AsyncOperationOptions {
  loadingMessage?: string
  successMessage?: string
  errorMessage?: string
  showToasts?: boolean
}

export type CRUDOperation = 'create' | 'delete' | 'update'

export interface EnhancedCRUDReturn<TTable extends TableName> {
  // Core CRUD operations
  create: (data: Insert<TTable>) => Promise<Row<TTable>>
  update: (id: string, data: Update<TTable>) => Promise<Row<TTable>>
  delete: (id: string) => Promise<void>

  // Bulk operations
  bulkCreate: (items: Array<Insert<TTable>>) => Promise<Array<Row<TTable>>>
  bulkUpdate: (updates: Array<BulkUpdateItem<TTable>>) => Promise<Array<Row<TTable>>>
  bulkDelete: (ids: string[]) => Promise<void>

  // State
  loading: boolean
  error: string | null

  // Utility
  clearError: () => void
}
