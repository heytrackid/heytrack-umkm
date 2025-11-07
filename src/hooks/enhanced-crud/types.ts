import type { Database, TablesUpdate } from '@/types/database'

type TablesMap = Database['public']['Tables']

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

export interface BulkUpdateItem<T extends keyof TablesMap> {
  id: string
  data: TablesUpdate<T>
}

export interface AsyncOperationOptions {
  loadingMessage?: string
  successMessage?: string
  errorMessage?: string
  showToasts?: boolean
}

export type CRUDOperation = 'create' | 'delete' | 'update'
