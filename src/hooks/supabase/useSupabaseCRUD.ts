'use client'

import { useCallback, useEffect, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClientLogger } from '@/lib/client-logger'
import { useSupabase } from '@/providers/SupabaseProvider'
import type { Database } from '@/types/database'

const logger = createClientLogger('Hook')
import { getErrorMessage } from '@/lib/type-guards'

/**
 * Supabase CRUD Hook
 * Generic hook for CRUD operations with Supabase
 */


type TableKey = keyof Database['public']['Tables'] & string

type TableRow<TTable extends TableKey> = Database['public']['Tables'][TTable]['Row']
type TableInsert<TTable extends TableKey> = Database['public']['Tables'][TTable]['Insert']
type TableUpdate<TTable extends TableKey> = Database['public']['Tables'][TTable]['Update']

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
  const { supabase } = useSupabase()

  const fetchData = useCallback(async () => {
    try {
      void setLoading(true)
      void setError(null)
      
      // Get authenticated user for RLS
      const { data: { user } } = await supabase.auth.getUser()
      
      let query = supabase.from(table).select(options?.select ?? '*')

      // Apply user_id filter for RLS (if user is authenticated)
      if (user) {
        query = query.eq('user_id' as never, user.id as never)
      }

      // Apply filters
      if (options?.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          if (value === undefined) {return}
          const column = key
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
          logger.error({ table, error: queryError }, 'Error fetching from table')
        }
        throw queryError
      }

      logger.debug({ 
        table, 
        rowCount: result?.length ?? 0 
      }, `Fetched rows from ${table}`)
      void setData(result)
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        logger.error({ error: err, table }, 'Error in fetchData')
      }
      setError(new Error(getErrorMessage(err)))
     } finally {
       void setLoading(false)
     }
   }, [table, options?.select, options?.filter, options?.orderBy, supabase])

  const read = async (id: string): Promise<TableRow<TTable> | null> => {
    try {
      
      // Get authenticated user for RLS
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data: result, error: readError } = await supabase
        .from(table)
        .select(options?.select ?? '*')
        .eq('id' as never, id as never)
        .eq('user_id' as never, user.id as never) // RLS filter
        .single() as { data: TableRow<TTable> | null; error: Error | null }

      if (readError) {
        if (process.env.NODE_ENV === 'development') {
          logger.error({ table, error: readError }, 'Read error')
        }
        throw readError
      }

      return result
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        logger.error({ error: err, table }, 'Error in read')
      }
      const error = new Error(getErrorMessage(err))
      setError(error)
      throw error
    }
  }

  const remove = async (id: string) => {
    try {
      
      // Get authenticated user for RLS
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id' as never, id as never)
        .eq('user_id' as never, user.id as never) // RLS filter

      if (deleteError) {
        if (process.env.NODE_ENV === 'development') {
          logger.error({ table, error: deleteError }, 'Delete error')
        }
        throw deleteError
      }

      // Refresh data after delete
      await fetchData()
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        logger.error({ error: err, table }, 'Error in remove')
      }
      const error = new Error(getErrorMessage(err))
      setError(error)
      throw error
    }
  }

  const create = async (newData: Partial<TableInsert<TTable>>): Promise<TableRow<TTable> | null> => {
    try {
      
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
        .insert([dataWithUser] as never)
        .select()
        .single() as { data: TableRow<TTable> | null; error: Error | null }

      if (createError) {
        if (process.env.NODE_ENV === 'development') {
          logger.error({ table, error: createError }, 'Create error')
        }
        throw createError
      }

      // Refresh data after create
      await fetchData()
      return result
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        logger.error({ error: err, table }, 'Error in create')
      }
      const error = new Error(getErrorMessage(err))
      setError(error)
      throw error
    }
  }

  const update = async (id: string, updateData: Partial<TableUpdate<TTable>>): Promise<TableRow<TTable> | null> => {
    try {
      
      // Get authenticated user for RLS
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data: result, error: updateError } = await supabase
        .from(table)
        .update(updateData as never)
        .eq('id' as never, id as never)
        .eq('user_id' as never, user.id as never) // RLS filter
        .select()
        .single() as { data: TableRow<TTable> | null; error: Error | null }

      if (updateError) {
        if (process.env.NODE_ENV === 'development') {
          logger.error({ table, error: updateError }, 'Update error')
        }
        throw updateError
      }

      // Refresh data after update
      await fetchData()
      return result
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        logger.error({ error: err, table }, 'Error in update')
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
  }, [fetchData])

  // Realtime subscription setup
  useEffect(() => {
    let realtimeChannel: RealtimeChannel | null = null

    const setupRealtime = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          return
        }

        realtimeChannel = supabase
          .channel(`${table}_realtime_${user.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table,
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              logger.debug({ table, event: payload.eventType }, 'Realtime event received')

              setData((currentData) => {
                if (!currentData) {
                  return currentData
                }

                switch (payload.eventType) {
                  case 'INSERT': {
                    const newRecord = payload.new as TableRow<TTable>
                    // Check if already exists
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const exists = currentData.some((item: any) => item.id === (newRecord as any).id)
                    if (!exists) {
                      return [...currentData, newRecord]
                    }
                    return currentData
                  }
                  case 'UPDATE': {
                    const updatedRecord = payload.new as TableRow<TTable>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return currentData.map((item: any) =>
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      item.id === (updatedRecord as any).id ? updatedRecord : item
                    )
                  }
                  case 'DELETE': {
                    const deletedRecord = payload.old as TableRow<TTable>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return currentData.filter((item: any) => item.id !== (deletedRecord as any).id)
                  }
                  default:
                    return currentData
                }
              })
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              logger.debug({ table }, 'Realtime subscription active')
            } else if (status === 'CHANNEL_ERROR') {
              logger.error({ table }, 'Realtime subscription error')
            }
          })

      } catch (err) {
        logger.error({ error: err, table }, 'Error setting up realtime')
      }
    }

    void setupRealtime()

    return () => {
      if (realtimeChannel) {
        void supabase.removeChannel(realtimeChannel)
      }
    }
  }, [table, supabase])

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
