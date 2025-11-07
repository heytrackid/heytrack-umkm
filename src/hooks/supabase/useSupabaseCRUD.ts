'use client'

import { useCallback, useEffect, useState } from 'react'
import useSWR, { type SWRConfiguration } from 'swr'

import { createClientLogger } from '@/lib/client-logger'
import { getErrorMessage } from '@/lib/type-guards'
import { useSupabase } from '@/providers/SupabaseProvider'

import type { Database } from '@/types/database'

import type { RealtimeChannel } from '@supabase/supabase-js'

const logger = createClientLogger('Hook')

/**
 * Supabase CRUD Hook
 * Generic hook for CRUD operations with Supabase
 */


type TableKey = keyof Database['public']['Tables']

type TableRow<TTable extends TableKey> = Database['public']['Tables'][TTable]['Row']
type TableInsert<TTable extends TableKey> = Database['public']['Tables'][TTable]['Insert']
type TableUpdate<TTable extends TableKey> = Database['public']['Tables'][TTable]['Update']

type TableFilters<TTable extends TableKey> = Partial<{
  [K in keyof TableRow<TTable>]: TableRow<TTable>[K] | null
}>

export interface UseSupabaseCRUDOptions<TTable extends TableKey> {
  select?: string
  filter?: TableFilters<TTable>
  orderBy?: { column: string & keyof TableRow<TTable>; ascending?: boolean }
  strategy?: 'local' | 'swr'
  swrConfig?: SWRConfiguration<Array<TableRow<TTable>>>
  realtime?: boolean
}

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
  options?: UseSupabaseCRUDOptions<TTable>
): UseSupabaseCRUDReturn<TableRow<TTable>, TableInsert<TTable>, TableUpdate<TTable>> {
  const [localData, setLocalData] = useState<Array<TableRow<TTable>> | null>(null)
  const [localLoading, setLocalLoading] = useState((options?.strategy ?? 'local') === 'local')
  const [localError, setLocalError] = useState<Error | null>(null)
  const { supabase } = useSupabase()
  const strategy = options?.strategy ?? 'local'
  const enableRealtime = options?.realtime ?? true
  const queryKey = [table, options?.select, options?.filter, options?.orderBy] as const

  const runQuery = useCallback(async (): Promise<Array<TableRow<TTable>>> => {
    const { data: { user } } = await supabase.auth.getUser()

    let _query = supabase.from(table).select(options?.select ?? '*')

    if (user) {
      _query = _query.eq('user_id' as never, user['id'] as never)
    }

    if (options?.filter) {
      Object.entries(options.filter).forEach(([column, value]) => {
        if (value === undefined) { return }
        const typedColumn = column as keyof TableRow<TTable>
        if (value === null) {
          _query = _query.is(typedColumn as string, null)
        } else {
          _query = _query.eq(typedColumn as string, value as never)
        }
      })
    }

    if (options?.orderBy) {
      _query = _query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true
      })
    }

    const { data: result, error: queryError } = await _query as {
      data: Array<TableRow<TTable>> | null
      error: Error | null
    }

    if (queryError) {
      logger.error({ table, error: queryError }, 'Error fetching from table')
      throw queryError
    }

    logger.debug({ table, rowCount: result?.length ?? 0 }, `Fetched rows from ${table}`)
    return result ?? []
  }, [table, options?.select, options?.filter, options?.orderBy, supabase])

  const {
    data: swrData,
    error: swrError,
    isLoading: swrLoading,
    mutate
  } = useSWR(strategy === 'swr' ? queryKey : null, runQuery, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    errorRetryCount: 3,
    ...options?.swrConfig
  })

  const fetchData = useCallback(async (): Promise<void> => {
    if (strategy === 'swr') {
      await mutate()
      return
    }

    try {
      setLocalLoading(true)
      setLocalError(null)
      const result = await runQuery()
      setLocalData(result)
    } catch (error) {
      const normalizedError = new Error(getErrorMessage(error))
      setLocalError(normalizedError)
      throw normalizedError
    } finally {
      setLocalLoading(false)
    }
  }, [strategy, mutate, runQuery])

  const refreshAfterChange = useCallback(async (): Promise<void> => {
    if (strategy === 'swr') {
      await mutate()
    } else {
      await fetchData()
    }
  }, [strategy, mutate, fetchData])

  const read = async (id: string): Promise<TableRow<TTable> | null> => {
    try {
      
      // Get authenticated user for RLS
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const {
        data: result,
        error: readError
      } = await supabase
        .from(table)
        .select(options?.select ?? '*')
        .eq('id' as never, id as never)
        .eq('user_id' as never, user['id'] as never) // RLS filter
        .single() as { data: TableRow<TTable> | null; error: Error | null }

      if (readError) {
        if (process['env'].NODE_ENV === 'development') {
          logger.error({ table, error: readError }, 'Read error')
        }
        throw readError
      }

      return result
    } catch (error) {
      if (process['env'].NODE_ENV === 'development') {
        logger.error({ error, table }, 'Error in read')
      }
      const normalizedError = new Error(getErrorMessage(error))
      setLocalError(normalizedError)
      throw normalizedError
    }
  }

  const remove = async (id: string): Promise<void> => {
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
        .eq('user_id' as never, user['id'] as never) // RLS filter

      if (deleteError) {
        if (process['env'].NODE_ENV === 'development') {
          logger.error({ table, error: deleteError }, 'Delete error')
        }
        throw deleteError
      }

      await refreshAfterChange()
    } catch (error) {
      if (process['env'].NODE_ENV === 'development') {
        logger.error({ error, table }, 'Error in remove')
      }
      const normalizedError = new Error(getErrorMessage(error))
      setLocalError(normalizedError)
      throw normalizedError
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
        user_id: user['id']
      }

      const {
        data: result,
        error: createError
      } = await supabase
        .from(table)
        .insert([dataWithUser] as never)
        .select()
        .single() as { data: TableRow<TTable> | null; error: Error | null }

      if (createError) {
        if (process['env'].NODE_ENV === 'development') {
          logger.error({ table, error: createError }, 'Create error')
        }
        throw createError
      }

      await refreshAfterChange()
      return result
    } catch (error) {
      if (process['env'].NODE_ENV === 'development') {
        logger.error({ error, table }, 'Error in create')
      }
      const normalizedError = new Error(getErrorMessage(error))
      setLocalError(normalizedError)
      throw normalizedError
    }
  }

  const update = async (id: string, updateData: Partial<TableUpdate<TTable>>): Promise<TableRow<TTable> | null> => {
    try {
      
      // Get authenticated user for RLS
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const {
        data: result,
        error: updateError
      } = await supabase
        .from(table)
        .update(updateData as never)
        .eq('id' as never, id as never)
        .eq('user_id' as never, user['id'] as never) // RLS filter
        .select()
        .single() as { data: TableRow<TTable> | null; error: Error | null }

      if (updateError) {
        if (process['env'].NODE_ENV === 'development') {
          logger.error({ table, error: updateError }, 'Update error')
        }
        throw updateError
      }

      await refreshAfterChange()
      return result
    } catch (error) {
      if (process['env'].NODE_ENV === 'development') {
        logger.error({ error, table }, 'Error in update')
      }
      const normalizedError = new Error(getErrorMessage(error))
      setLocalError(normalizedError)
      throw normalizedError
    }
  }

  const clearError = (): void => {
    setLocalError(null)
  }

  useEffect(() => {
    if (strategy === 'local') {
      void fetchData()
    }
  }, [fetchData, strategy])

  // Realtime subscription setup
  useEffect(() => {
    if (!enableRealtime) {
      return
    }

    let realtimeChannel: RealtimeChannel | null = null

    const setupRealtime = async (): Promise<void> => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          return
        }

        realtimeChannel = supabase
          .channel(`${table}_realtime_${user['id']}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table,
              filter: `user_id=eq.${user['id']}`
            },
            (payload) => {
              logger.debug({ table, event: payload.eventType }, 'Realtime event received')

              if (strategy === 'swr') {
                void mutate()
                return
              }

              setLocalData((currentData) => {
                if (!currentData) {
                  return currentData
                }

                switch (payload.eventType) {
                  case 'INSERT': {
                    const newRecord = payload.new as TableRow<TTable>
                    const exists = currentData.some((item) => item.id === newRecord.id)
                    if (!exists) {
                      return [...currentData, newRecord]
                    }
                    return currentData
                  }
                  case 'UPDATE': {
                    const updatedRecord = payload.new as TableRow<TTable>
                    return currentData.map((item) =>
                      item.id === updatedRecord.id ? updatedRecord : item
                    )
                  }
                  case 'DELETE': {
                    const deletedRecord = payload.old as TableRow<TTable>
                    return currentData.filter((item) => item.id !== deletedRecord.id)
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

      } catch (error) {
        logger.error({ error, table }, 'Error setting up realtime')
      }
    }

    void setupRealtime()

    return (): void => {
      if (realtimeChannel) {
        void supabase.removeChannel(realtimeChannel)
      }
    }
  }, [table, supabase, strategy, mutate, enableRealtime])

  const resolvedData = strategy === 'swr' ? swrData ?? null : localData
  const resolvedLoading = strategy === 'swr' ? (swrLoading ?? false) : localLoading
  let resolvedError: Error | null
  if (strategy === 'swr') {
    resolvedError = swrError ? new Error(getErrorMessage(swrError)) : null
  } else {
    resolvedError = localError
  }

  return {
    data: resolvedData,
    loading: resolvedLoading,
    error: resolvedError,
    refetch: fetchData,
    read,
    remove,
    create,
    update,
    clearError
  }
}
