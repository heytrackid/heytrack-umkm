import type { Database } from '@/types/supabase-generated'

export type Tables = Database['public']['Tables']

export interface UseSupabaseQueryOptions<T extends keyof Tables> {
  select?: string
  filter?: Partial<Record<keyof Tables[T]['Row'] & string, string | number | boolean | null>>
  orderBy?: { column: keyof Tables[T]['Row'] & string; ascending?: boolean }
  limit?: number
  initial?: Array<Tables[T]['Row']>
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
