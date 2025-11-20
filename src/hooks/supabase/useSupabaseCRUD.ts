import { createClientLogger } from '@/lib/client-logger'
import type { Database } from '@/types/database'
import { createClient } from '@/utils/supabase/client'
import { useCallback, useEffect, useMemo, useState } from 'react'

type TablesMap = Database['public']['Tables']
type TableName = keyof TablesMap

export interface UseSupabaseCRUDOptions {
  strategy?: 'swr' | 'query'
  orderBy?: { column: string; ascending?: boolean }
  filters?: Record<string, unknown>
  columns?: string
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
  
  // Memoize supabase client and logger to prevent recreation on every render
  const supabase = useMemo(() => createClient(), [])
  const logger = useMemo(() => createClientLogger(`useSupabaseCRUD:${tableName}`), [tableName])
  
  // Stabilize object dependencies to prevent infinite loops
  // Serialize objects to compare by value instead of reference
  const filtersKey = JSON.stringify(options?.filters)
  const orderByKey = JSON.stringify(options?.orderBy)
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filters = useMemo(() => options?.filters, [filtersKey])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const orderBy = useMemo(() => options?.orderBy, [orderByKey])
   
  const columns = useMemo(() => options?.columns, [options?.columns])

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase.from(tableName).select(columns ?? '*')

       // Apply filters
       if (filters) {
         Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key as never, value as never) // Type assertion for RLS
         })
       }

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, {
          ascending: orderBy.ascending ?? true
        })
      }

      const { data: result, error: fetchError } = await query

      if (fetchError) throw fetchError

      setData(result as unknown as RowType[])
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error')
      setError(errorObj)
      logger.error({ error: errorObj }, 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
   }, [tableName, filters, orderBy, columns, supabase, logger])

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
      logger.error({ error: errorObj }, 'Failed to create record')
      return null
    }
  }, [tableName, fetchData, supabase, logger])

  // Update
  const update = useCallback(async (id: string, updateData: Partial<RowType>): Promise<RowType | null> => {
    try {
        const { data: result, error: updateError } = await supabase
          .from(tableName)
          .update(updateData as never)
          .eq('id' as never, id as never)
          .select()
          .single()

      if (updateError) throw updateError

      // Refresh data
      await fetchData()

      return result as unknown as RowType
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error')
      setError(errorObj)
      logger.error({ error: errorObj }, 'Failed to update record')
      return null
    }
  }, [tableName, fetchData, supabase, logger])

  // Delete
  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
       const { error: deleteError } = await supabase
         .from(tableName)
         .delete()
          .eq('id' as never, id as never) // Type assertion for RLS

      if (deleteError) throw deleteError

      // Refresh data
      await fetchData()

      return true
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error')
      setError(errorObj)
      logger.error({ error: errorObj }, 'Failed to delete record')
      return false
    }
  }, [tableName, fetchData, supabase, logger])

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
