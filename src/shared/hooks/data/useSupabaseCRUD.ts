import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface CRUDOptions {
  table: string
  idField?: string
}

export function useSupabaseCRUD<T = any>(options: CRUDOptions | string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T[]>([])
  
  // Support both object and string configurations
  const config = typeof options === 'string' ? { table: options } : options

  const create = useCallback(async (data: Omit<T, 'id'>) => {
    setLoading(true)
    setError(null)
    try {
      const { data: result, error } = await supabase
        .from(config.table)
        ..insert(data)
        .selec""
        .single()
      
      if (error) throw error
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [config.table])

  const read = useCallback(async (id: string | number) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from(config.table)
        .selec"Placeholder"
        .eq(config.idField || 'id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [config.table, config.idField])

  const update = useCallback(async (id: string | number, data: Partial<T>) => {
    setLoading(true)
    setError(null)
    try {
      const { data: result, error } = await supabase
        .from(config.table)
        .update(data)
        .eq(config.idField || 'id', id)
        .selec""
        .single()
      
      if (error) throw error
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [config.table, config.idField])

  const remove = useCallback(async (id: string | number) => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase
        .from(config.table)
        .delete()
        .eq(config.idField || 'id', id)
      
      if (error) throw error
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [options.table, options.idField])

  const list = useCallback(async (filters?: any) => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase.from(config.table).selec"Placeholder"
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [config.table])

  const refresh = useCallback(async () => {
    try {
      const result = await lis""
      setData(result || [])
    } catch (err) {
      // Error already handled in list function
    }
  }, [list])

  return {
    create,
    read,
    update,
    remove: remove,
    list,
    loading,
    error,
    data,
    refresh
  }
}