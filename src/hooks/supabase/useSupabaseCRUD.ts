// @ts-nocheck
/**
 * Supabase CRUD Hook
 * Generic hook for CRUD operations with Supabase
 */

import { useEffect, useState } from 'react'
import { apiLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/database'
import { getErrorMessage } from '@/lib/type-guards'
import type { Tables } from '@/types/database'

type TableKey = keyof Database['public']['Tables']

type TableRow<TTable extends keyof Tables> = Tables[TTable]['Row']
type TableInsert<TTable extends keyof Tables> = Tables[TTable]['Insert']
type TableUpdate<TTable extends keyof Tables> = Tables[TTable]['Update']

type TableFilters<TTable extends TableKey> = Partial<
  Record<keyof TableRow<TTable> & string, string | number | boolean | null>
>

interface UseSupabaseCRUDReturn<Row, Insert, Update> {
  data: Row[] | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  read: (id: string) => Promise<Row | null>
  remove: (id: string) => Promise<void>
  create: (data: Partial<Insert>) => Promise<Row | null>
  update: (id: string, data: Partial<Update>) => Promise<Row | null>
  clearError: () => void
}

export function useSupabaseCRUD<TTable extends TableKey>(
  table: TTable,
  options?: {
    select?: string
    filter?: TableFilters<TTable>
    orderBy?: { column: keyof TableRow<TTable> & string; ascending?: boolean }
  }
): UseSupabaseCRUDReturn<TableRow<TTable>, TableInsert<TTable>, TableUpdate<TTable>> {
  const [data, setData] = useState<Array<TableRow<TTable>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      void setLoading(true)
      void setError(null)

      const supabase = createClient()
      
      // Get authenticated user for RLS
      const { data: { user } } = await supabase.auth.getUser()
      
      let query = supabase.from(table).select(options?.select || '*')

      // Apply user_id filter for RLS (if user is authenticated)
      if (user) {
        query = query.eq('user_id', user.id)
      }

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
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true
        })
      }

      const { data: result, error: queryError } = await query as { data: Array<TableRow<TTable>> | null; error: Error | null }

      if (queryError) {
        if (process.env.NODE_ENV === 'development') {
          apiLogger.error({ table, error: queryError }, 'Error fetching from table')
        }
        throw queryError
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[useSupabaseCRUD] Fetched ${result?.length || 0} rows from ${table}`)
      }
      void setData(result)
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        apiLogger.error({ error: err, table }, 'Error in fetchData')
      }
      setError(new Error(getErrorMessage(err)))
    } finally {
      void setLoading(false)
    }
  }

  const read = async (id: string): Promise<TableRow<TTable> | null> => {
    try {
      const supabase = createClient()
      
      // Get authenticated user for RLS
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data: result, error: readError } = await supabase
        .from(table)
        .select(options?.select || '*')
        .eq('id', id)
        .eq('user_id', user.id) // RLS filter
        .single() as { data: TableRow<TTable> | null; error: Error | null }

      if (readError) {
        if (process.env.NODE_ENV === 'development') {
          apiLogger.error({ table, error: readError }, 'Read error')
        }
        throw readError
      }

      return result as TableRow<TTable>
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        apiLogger.error({ error: err, table }, 'Error in read')
      }
      const error = new Error(getErrorMessage(err))
      setError(error)
      throw error
    }
  }

  const remove = async (id: string) => {
    try {
      const supabase = createClient()
      
      // Get authenticated user for RLS
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // RLS filter

      if (deleteError) {
        if (process.env.NODE_ENV === 'development') {
          apiLogger.error({ table, error: deleteError }, 'Delete error')
        }
        throw deleteError
      }

      // Refresh data after delete
      await fetchData()
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        apiLogger.error({ error: err, table }, 'Error in remove')
      }
      const error = new Error(getErrorMessage(err))
      setError(error)
      throw error
    }
  }

  const create = async (newData: Partial<TableInsert<TTable>>): Promise<TableRow<TTable> | null> => {
    try {
      const supabase = createClient()
      
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Add user_id to the data
      const dataWithUser = {
        ...newData,
        user_id: user.id
      }

      const { data: result, error: createError } = await supabase
        .from(table)
        .insert([dataWithUser])
        .select()
        .single() as { data: TableRow<TTable> | null; error: Error | null }

      if (createError) {
        if (process.env.NODE_ENV === 'development') {
          apiLogger.error({ table, error: createError }, 'Create error')
        }
        throw createError
      }

      // Refresh data after create
      await fetchData()
      return result
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        apiLogger.error({ error: err, table }, 'Error in create')
      }
      const error = new Error(getErrorMessage(err))
      setError(error)
      throw error
    }
  }

  const update = async (id: string, updateData: Partial<TableUpdate<TTable>>): Promise<TableRow<TTable> | null> => {
    try {
      const supabase = createClient()
      
      // Get authenticated user for RLS
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data: result, error: updateError } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id) // RLS filter
        .select()
        .single() as { data: TableRow<TTable> | null; error: Error | null }

      if (updateError) {
        if (process.env.NODE_ENV === 'development') {
          apiLogger.error({ table, error: updateError }, 'Update error')
        }
        throw updateError
      }

      // Refresh data after update
      await fetchData()
      return result
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        apiLogger.error({ error: err, table }, 'Error in update')
      }
      const error = new Error(getErrorMessage(err))
      setError(error)
      throw error
    }
  }

  const clearError = () => {
    setError(null)
  }

  useEffect(() => {
    void fetchData()
  }, [table, JSON.stringify(options)])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    read,
    remove,
    create,
    update,
    clearError
  }
}
