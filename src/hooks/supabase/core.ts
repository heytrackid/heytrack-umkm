'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useSupabase } from '@/providers/SupabaseProvider'

import type { Row, TableName } from '@/types/database'

import type { UseSupabaseQueryOptions, UseSupabaseQueryResult } from '@/hooks/supabase/types'

interface RealtimePayload<T extends TableName> {
  eventType: 'DELETE' | 'INSERT' | 'UPDATE'
  new: Row<T>
  old: Row<T>
}

/**
 * Core hook for Supabase queries with real-time support
 */
export function useSupabaseQuery<T extends TableName>(
  tableName: T,
  options: UseSupabaseQueryOptions<T & TableName> = {}
): UseSupabaseQueryResult<T & TableName> {
  const { supabase } = useSupabase()
  const [data, setData] = useState<Array<Row<T>>>((options.initial ?? []) as Array<Row<T>>)
  const [loading, setLoading] = useState(!options.initial)
  const [error, setError] = useState<string | null>(null)

  const optionsRef = useRef(options)
  const fetchIdRef = useRef<symbol | null>(null)
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const fetchData = useCallback(async (): Promise<void> => {
    const currentFetchId = Symbol('supabase-query')
    fetchIdRef.current = currentFetchId
    
    try {
      setLoading(true)
      setError(null)

      const currentOptions = optionsRef.current
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let _query = supabase.from(tableName as any).select(currentOptions.select ?? '*')

      // Apply filters
      if (currentOptions.filter) {
        Object.entries(currentOptions.filter).forEach(([key, value]) => {
          if (value === undefined) {
            return
          }
          const column = key
          if (value === null) {
            _query = _query.is(column, null)
          } else {
            _query = _query.eq(column, value)
          }
        })
      }

      // Apply ordering
      if (currentOptions.orderBy) {
        _query = _query.order(currentOptions.orderBy.column, {
          ascending: currentOptions.orderBy.ascending ?? true,
        })
      }

      // Apply limit
      if (currentOptions.limit) {
        _query = _query.limit(currentOptions.limit)
      }

      const { data: result, error: queryError } = await _query

      if (fetchIdRef.current !== currentFetchId) {
        return
      }

      if (queryError) {
        throw queryError
      }
      const typedResult = (result ?? []) as unknown as Row<T>[]
      setData(typedResult as Array<Row<T>>)
    } catch (error) {
      if (fetchIdRef.current !== currentFetchId) {
        return
      }
      const normalizedError = error instanceof Error ? error.message : 'An error occurred'
      setError(normalizedError)
    } finally {
      if (fetchIdRef.current === currentFetchId) {
        fetchIdRef.current = null
        setLoading(false)
      }
    }
  }, [tableName, supabase])

  useEffect(() => {
    // Skip initial fetch if we have initial data and refetchOnMount is false
    if (options.initial && options.refetchOnMount === false) {
      return undefined
    }

    void fetchData()

    // Setup realtime subscription if enabled
    if (options.realtime === true) {
      const channel = supabase
        .channel(`${tableName}-changes`)
        .on(
          'postgres_changes' as const,
          {
            event: '*',
            schema: 'public',
            table: tableName,
          },
          (payload: unknown) => {
            const typedPayload = payload as RealtimePayload<T>
            if (typedPayload.eventType === 'INSERT') {
              setData((prev) => [typedPayload.new, ...prev] as Array<Row<T>>)
            } else if (typedPayload.eventType === 'UPDATE') {
              setData((prev) =>
                prev.map((item: Row<T>) =>
                  (item as { id: string })['id'] === (typedPayload.new as { id: string })['id'] ? typedPayload.new : item
                ) as Array<Row<T>>
              )
            } else if (typedPayload.eventType === 'DELETE') {
              setData((prev) =>
                prev.filter((item: Row<T>) => (item as { id: string })['id'] !== (typedPayload.old as { id: string })['id']) as Array<Row<T>>
              )
            }
          }
        )
        .subscribe((status: string) => {
          // Suppress WebSocket errors in console - they're handled by Supabase internally
          if (status === 'CHANNEL_ERROR') {
            // Silently handle channel errors without logging to console
            // The subscription will automatically retry
          }
        })

      return (): void => {
        fetchIdRef.current = null
        void supabase.removeChannel(channel)
      }
    }
    
    return (): void => {
      fetchIdRef.current = null
    }
  }, [tableName, fetchData, options.realtime, options.refetchOnMount, options.initial, supabase])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}
