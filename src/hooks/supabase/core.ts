// @ts-nocheck
'use client'

import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/database'
import { useCallback, useEffect, useState } from 'react'
import type { UseSupabaseQueryOptions } from './types'

type TablesMap = Database['public']['Tables']

/**
 * Core hook for Supabase queries with real-time support
 */
export function useSupabaseQuery<T extends keyof TablesMap>(
  tableName: T,
  options: UseSupabaseQueryOptions<T> = {}
) {
  const [data, setData] = useState<Array<TablesMap[T]['Row']>>(options.initial ?? [])
  const [loading, setLoading] = useState(!options.initial)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      void setLoading(true)
      void setError(null)

      const supabase = createClient()
      let query = supabase.from(tableName).select(options.select || '*')

      // Apply filters
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          if (value === undefined) {return}
          const column = key as keyof TablesMap[T]['Row'] & string
          if (value === null) {
            query = query.is(column, null)
          } else {
            query = query.eq(column, value)
          }
        })
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        })
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data: result, error: queryError } = await query

      if (queryError) {throw queryError}
      void setData(result || [])
    } catch (_err) {
      void setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      void setLoading(false)
    }
  }, [tableName, JSON.stringify(options)])

  useEffect(() => {
    // Skip initial fetch if we have initial data and refetchOnMount is false
    if (options.initial && options.refetchOnMount === false) {
      return undefined
    }

    void fetchData()

    // Setup realtime subscription if enabled
    if (options.realtime !== false) {
      const supabase = createClient()
      const channel = supabase
        .channel(`${tableName}-changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
          },
          (payload: any) => {
            if (payload.eventType === 'INSERT') {
              setData((prev) => [payload.new as TablesMap[T]['Row'], ...prev])
            } else if (payload.eventType === 'UPDATE') {
              setData((prev) =>
                prev.map((item: TablesMap[T]['Row']) =>
                  item.id === (payload.new as TablesMap[T]['Row']).id ? payload.new as TablesMap[T]['Row'] : item
                )
              )
            } else if (payload.eventType === 'DELETE') {
              setData((prev) =>
                prev.filter((item: TablesMap[T]['Row']) => item.id !== (payload.old as TablesMap[T]['Row']).id)
              )
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [tableName, fetchData, options.realtime, options.refetchOnMount])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}
