import type { Database } from '@/types'

export type Tables = Database['public']['Tables']

export interface UseSupabaseQueryOptions<T extends keyof Tables> {
  select?: string
  filter?: Record<string, unknown>
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
  initial?: unknown[]
  refetchOnMount?: boolean
  realtime?: boolean
}

export interface CRUDOptions {
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
