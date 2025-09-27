import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface CRUDOptions {
  table: string
  idField?: string
}

export function useSupabaseCRUD<T = any>(options: CRUDOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (data: Omit<T, 'id'>) => {
    setLoading(true)
    setError(null)
    try {
      const { data: result, error } = await supabase
        .from(options.table)
        .insert(data)
        .select()
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
  }, [options.table])

  const read = useCallback(async (id: string | number) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from(options.table)
        .select('*')
        .eq(options.idField || 'id', id)
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
  }, [options.table, options.idField])

  const update = useCallback(async (id: string | number, data: Partial<T>) => {
    setLoading(true)
    setError(null)
    try {
      const { data: result, error } = await supabase
        .from(options.table)
        .update(data)
        .eq(options.idField || 'id', id)
        .select()
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
  }, [options.table, options.idField])

  const remove = useCallback(async (id: string | number) => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase
        .from(options.table)
        .delete()
        .eq(options.idField || 'id', id)
      
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
      let query = supabase.from(options.table).select('*')
      
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
  }, [options.table])

  return {
    create,
    read,
    update,
    remove,
    list,
    loading,
    error
  }
}