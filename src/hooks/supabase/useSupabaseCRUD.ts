/**
 * Supabase CRUD Hook
 * Generic hook for CRUD operations with Supabase
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase-generated'

type TablesMap = Database['public']['Tables']
type TableKey = keyof TablesMap

type TableRow<TTable extends string> = TTable extends TableKey
  ? TablesMap[TTable]['Row']
  : Record<string, unknown>

type TableInsert<TTable extends string> = TTable extends TableKey
  ? TablesMap[TTable]['Insert']
  : Record<string, unknown>

type TableUpdate<TTable extends string> = TTable extends TableKey
  ? TablesMap[TTable]['Update']
  : Record<string, unknown>

type TableFilters<TTable extends string> = Partial<
  Record<keyof TableRow<TTable> & string, string | number | boolean | null>
>

interface UseSupabaseCRUDReturn<Row, Insert, Update> {
  data: Row[] | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  remove: (id: string) => Promise<void>
  create: (data: Partial<Insert>) => Promise<Row | null>
  update: (id: string, data: Partial<Update>) => Promise<Row | null>
}

export function useSupabaseCRUD<TTable extends string>(
  table: TTable,
  options?: {
    select?: string
    filter?: TableFilters<TTable>
    orderBy?: { column: keyof TableRow<TTable> & string; ascending?: boolean }
  }
): UseSupabaseCRUDReturn<TableRow<TTable>, TableInsert<TTable>, TableUpdate<TTable>> {
  const [data, setData] = useState<TableRow<TTable>[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      void setLoading(true)
      void setError(null)

      const supabase = createClient()
      let query = supabase.from(table).select(options?.select || '*')

      // Apply filters
      if (options?.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          if (value === undefined) {return}
          const column = key as keyof TableRow<TTable> & string
          if (value === null) {
            query = query.is(column, null)
          } else {
            query = query.eq(column, value)
          }
        })
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column as never, {
          ascending: options.orderBy.ascending ?? true
        })
      }

      const { data: result, error: queryError } = await query

      if (queryError) {throw queryError}

      void setData((result as unknown as TableRow<TTable>[]) ?? null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      void setLoading(false)
    }
  }

  const remove = async (id: string) => {
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (deleteError) {throw deleteError}

      // Refresh data after delete
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Delete failed'))
      throw err
    }
  }

  const create = async (newData: Partial<TableInsert<TTable>>): Promise<TableRow<TTable> | null> => {
    try {
      const supabase = createClient()
      const { data: result, error: createError } = await supabase
        .from(table)
        .insert(newData as never)
        .select()
        .single()

      if (createError) {throw createError}

      // Refresh data after create
      await fetchData()
      return result as unknown as TableRow<TTable>
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Create failed'))
      throw err
    }
  }

  const update = async (id: string, updateData: Partial<TableUpdate<TTable>>): Promise<TableRow<TTable> | null> => {
    try {
      const supabase = createClient()
      const { data: result, error: updateError } = await supabase
        .from(table)
        .update(updateData as never)
        .eq('id', id as never)
        .select()
        .single()

      if (updateError) {throw updateError}

      // Refresh data after update
      await fetchData()
      return result as unknown as TableRow<TTable>
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Update failed'))
      throw err
    }
  }

  useEffect(() => {
    void fetchData()
  }, [table, JSON.stringify(options)])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    remove,
    create,
    update
  }
}
