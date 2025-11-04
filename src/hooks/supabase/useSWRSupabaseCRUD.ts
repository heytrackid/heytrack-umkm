'use client'

import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/database'
import { getErrorMessage } from '@/lib/type-guards'
import { createClientLogger } from '@/lib/client-logger'
import useSWR, { type SWRConfiguration } from 'swr'

const logger = createClientLogger('SWR')

type TableKey = keyof Database['public']['Tables'] & string

type TableRow<TTable extends TableKey> = Database['public']['Tables'][TTable]['Row']
type TableInsert<TTable extends TableKey> = Database['public']['Tables'][TTable]['Insert']
type TableUpdate<TTable extends TableKey> = Database['public']['Tables'][TTable]['Update']

interface UseSWRSupabaseCRUDReturn<Row, Insert, Update> {
  data: Row[] | null
  loading: boolean
  error: Error | null
  mutate: () => Promise<void>
  create: (data: Partial<Insert>) => Promise<Row | null>
  update: (id: string, data: Partial<Update>) => Promise<Row | null>
  remove: (id: string) => Promise<void>
}

export function useSWRSupabaseCRUD<TTable extends TableKey>(
  table: TTable,
  options?: {
    select?: string
    filter?: Partial<Record<keyof TableRow<TTable> & string, string | number | boolean | null>>
    orderBy?: { column: keyof TableRow<TTable> & string; ascending?: boolean }
  },
  config?: SWRConfiguration
): UseSWRSupabaseCRUDReturn<TableRow<TTable>, TableInsert<TTable>, TableUpdate<TTable>> {
  const queryKey = [table, options?.select, options?.filter, options?.orderBy]

  const { data, error, mutate: _mutate } = useSWR<Array<TableRow<TTable>>>(
    queryKey,
    async (): Promise<Array<TableRow<TTable>>> => {
      try {
        const supabase = createClient()
        
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
          logger.error({ table, error: queryError }, 'Error fetching from table')
          throw queryError
        }

        logger.debug({ 
          table, 
          rowCount: result?.length ?? 0 
        }, `Fetched rows from ${table}`)
        
        return result ?? []
      } catch (err) {
        logger.error({ error: err, table }, 'Error in fetcher')
        throw new Error(getErrorMessage(err))
      }
    },
    {
      ...config,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
    }
  )

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
        .insert([dataWithUser] as never)
        .select()
        .single() as { data: TableRow<TTable> | null; error: Error | null }

      if (createError) {
        logger.error({ table, error: createError }, 'Create error')
        throw createError
      }

      // Optimistically update the cache
      if (result) {
        await _mutate([...(data ?? []), result], false)
      }
      
      logger.debug({ table, recordId: result?.id }, 'Record created')
      return result
    } catch (err) {
      logger.error({ error: err, table }, 'Error in create')
      throw new Error(getErrorMessage(err))
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
        .update(updateData as never)
        .eq('id' as never, id as never)
        .eq('user_id' as never, user.id as never) // RLS filter
        .select()
        .single() as { data: TableRow<TTable> | null; error: Error | null }

      if (updateError) {
        logger.error({ table, error: updateError }, 'Update error')
        throw updateError
      }

      // Optimistically update the cache
      if (result && data) {
        const updatedData = data.map((item: TableRow<TTable>) =>
          item.id === id ? result : item
        )
        await _mutate(updatedData, false)
      }
      
      logger.debug({ table, recordId: id }, 'Record updated')
      return result
    } catch (err) {
      logger.error({ error: err, table }, 'Error in update')
      throw new Error(getErrorMessage(err))
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
        .eq('id' as never, id as never)
        .eq('user_id' as never, user.id as never) // RLS filter

      if (deleteError) {
        logger.error({ table, error: deleteError }, 'Delete error')
        throw deleteError
      }

      // Optimistically update the cache
      if (data) {
        const updatedData = data.filter((item: TableRow<TTable>) => item.id !== id)
        await _mutate(updatedData, false)
      }
      
      logger.debug({ table, recordId: id }, 'Record deleted')
    } catch (err) {
      logger.error({ error: err, table }, 'Error in remove')
      throw new Error(getErrorMessage(err))
    }
  }

  return {
    data: data ?? null,
    loading: !error && data === undefined,
    error: error ?? null,
    mutate: async () => { await _mutate();  },
    create,
    update,
    remove
  }
}