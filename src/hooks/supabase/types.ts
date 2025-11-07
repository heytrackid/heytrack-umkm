import type { Database, TablesUpdate } from '@/types/database'

type TablesMap = Database['public']['Tables']

export interface UseSupabaseQueryOptions<T extends keyof TablesMap> {
  select?: string
  filter?: Partial<Record<string & keyof TablesMap[T]['Row'], boolean | number | string | null>>
  orderBy?: { column: string & keyof TablesMap[T]['Row']; ascending?: boolean }
  limit?: number
  initial?: Array<TablesMap[T]['Row']>
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
  customErrorHandler?: (error: Error, operation: 'create' | 'delete' | 'update') => void
}

export interface BulkUpdateItem<T extends keyof TablesMap> {
  id: string
  data: TablesUpdate<T>
}
