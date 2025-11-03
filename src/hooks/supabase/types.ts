import type { Database, TablesUpdate } from '@/types/database'


type TablesMap = Database['public']['Tables']

export interface UseSupabaseQueryOptions<T extends keyof TablesMap> {
  select?: string
  filter?: Partial<Record<keyof TablesMap[T]['Row'] & string, string | number | boolean | null>>
  orderBy?: { column: keyof TablesMap[T]['Row'] & string; ascending?: boolean }
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
  customErrorHandler?: (error: Error, operation: 'create' | 'update' | 'delete') => void
}

export interface BulkUpdateItem<T extends keyof TablesMap> {
  id: string
  data: TablesUpdate<T>
}
