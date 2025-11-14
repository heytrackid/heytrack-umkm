import { createClientLogger } from '@/lib/client-logger'
import type { Database } from '@/types/supabase-generated'
import { createClient } from '@/utils/supabase/client'
import { useCallback, useEffect, useState } from 'react'

type TablesMap = Database['public']['Tables']
type TableName = keyof TablesMap

export interface UseSupabaseCRUDOptions {
  strategy?: 'swr' | 'query'
  orderBy?: { column: string; ascending?: boolean }
  filters?: Record<string, unknown>
}

export interface UseSupabaseCRUDResult<T> {
  data: T[] | null
  loading: boolean
  error: Error | null
  create: (data: Partial<T>) => Promise<T | null>
  update: (id: string, data: Partial<T>) => Promise<T | null>
  remove: (id: string) => Promise<boolean>
  refetch: () => Promise<void>
  clearError: () => void
}

export function useSupabaseCRUD<TTable extends TableName>(
  tableName: TTable,
  options?: UseSupabaseCRUDOptions
): UseSupabaseCRUDResult<TablesMap[TTable]['Row']> {
  type RowType = TablesMap[TTable]['Row']
  
  const [data, setData] = useState<RowType[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const supabase = createClient()
  const logger = createClientLogger(`useSupabaseCRUD:${tableName}`)

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase.from(tableName).select('*')

      // Apply filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value as any) // Type assertion for RLS
        })
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true
        })
      }

      const { data: result, error: fetchError } = await query

      if (fetchError) throw fetchError

      setData(result as unknown as RowType[])
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error')
      setError(errorObj)
      logger.error('Failed to fetch data', { error: errorObj })
    } finally {
      setLoading(false)
    }
  }, [tableName, options?.filters, options?.orderBy])

  // Create
  const create = useCallback(async (newData: Partial<RowType>): Promise<RowType | null> => {
    try {
      const { data: result, error: createError } = await supabase
        .from(tableName)
        .insert(newData as never)
        .select()
        .single()

      if (createError) throw createError

      // Refresh data
      await fetchData()

      return result as unknown as RowType
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error')
      setError(errorObj)
      logger.error('Failed to create record', { error: errorObj })
      return null
    }
  }, [tableName, fetchData])

  // Update
  const update = useCallback(async (id: string, updateData: Partial<RowType>): Promise<RowType | null> => {
    try {
      const { data: result, error: updateError } = await supabase
        .from(tableName)
        .update(updateData as never)
        .eq('id', id as any)
        .select()
        .single()

      if (updateError) throw updateError

      // Refresh data
      await fetchData()

      return result as unknown as RowType
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error')
      setError(errorObj)
      logger.error('Failed to update record', { error: errorObj })
      return null
    }
  }, [tableName, fetchData])

  // Delete
  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id as any) // Type assertion for RLS

      if (deleteError) throw deleteError

      // Refresh data
      await fetchData()

      return true
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error')
      setError(errorObj)
      logger.error('Failed to delete record', { error: errorObj })
      return false
    }
  }, [tableName, fetchData])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    create,
    update,
    remove,
    refetch: fetchData,
    clearError
  }
}
