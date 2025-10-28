import type { Database } from '@/types/supabase-generated'

type Tables = Database['public']['Tables']

export interface EnhancedCRUDOptions {
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessages?: {
    create?: string
    update?: string
    delete?: string
  }
  customErrorHandler?: (error: Error, operation: 'create' | 'update' | 'delete') => void
}

export interface BulkUpdateItem<T extends keyof Tables> {
  id: string
  data: Tables[T]['Update']
}

export interface AsyncOperationOptions {
  loadingMessage?: string
  successMessage?: string
  errorMessage?: string
  showToasts?: boolean
}

export type CRUDOperation = 'create' | 'update' | 'delete'
