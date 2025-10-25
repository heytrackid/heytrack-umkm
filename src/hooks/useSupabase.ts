/**
 * Unified Supabase Hooks
 * Single source of truth untuk semua operasi database
 * Menggabungkan fungsionalitas dari useDatabase, useSupabaseCRUD, dan useSupabaseData
 */

'use client'
import * as React from 'react'

import { createSupabaseClient } from '@/lib/supabase'
import { Database } from '@/types'
import { useCallback, useEffect, useState } from 'react'

type Tables = Database['public']['Tables']

// ============================================================================
// CORE HOOK: useSupabaseQuery
// ============================================================================

interface UseSupabaseQueryOptions<T extends keyof Tables> {
  select?: string
  filter?: Record<string, unknown>
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
  initial?: unknown[]
  refetchOnMount?: boolean
  realtime?: boolean
}

export function useSupabaseQuery<T extends keyof Tables>(
  tableName: T,
  options: UseSupabaseQueryOptions<T> = {}
) {
  const [data, setData] = useState<any[]>(options.initial ?? [])
  const [loading, setLoading] = useState(!options.initial)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createSupabaseClient()
      let query = supabase.from(tableName as any).select(options.select || '*')

      // Apply filters
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = (query as any).eq(key, value)
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

      if (queryError) throw queryError
      setData(result || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [tableName, JSON.stringify(options)])

  useEffect(() => {
    // Skip initial fetch if we have initial data and refetchOnMount is false
    if (options.initial && options.refetchOnMount === false) {
      return
    }

    fetchData()

    // Setup realtime subscription if enabled
    if (options.realtime !== false) {
      const supabase = createSupabaseClient()
      const channel = supabase
        .channel(`${tableName}-changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setData((prev) => [payload.new as any, ...prev])
            } else if (payload.eventType === 'UPDATE') {
              setData((prev) =>
                prev.map((item) =>
                  (item as any).id === (payload.new as any).id
                    ? (payload.new as any)
                    : item
                )
              )
            } else if (payload.eventType === 'DELETE') {
              setData((prev) =>
                prev.filter((item) => (item as any).id !== (payload.old as any).id)
              )
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchData, options.realtime, tableName])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

interface UseSupabaseMutationOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useSupabaseMutation<T extends keyof Tables>(
  tableName: T,
  options: UseSupabaseMutationOptions = {}
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (data: any) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createSupabaseClient()
      const { data: result, error: createError } = await supabase
        .from(tableName as any)
        .insert(data)
        .select('*')
        .single()

      if (createError) throw createError

      options.onSuccess?.()
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Create failed'
      setError(errorMsg)
      options.onError?.(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const update = async (id: string, data: any) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createSupabaseClient()
      const { data: result, error: updateError } = await supabase
        .from(tableName as any)
        .update(data)
        .eq('id', id)
        .select('*')
        .single()

      if (updateError) throw updateError

      options.onSuccess?.()
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Update failed'
      setError(errorMsg)
      options.onError?.(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createSupabaseClient()
      const { error: deleteError } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      options.onSuccess?.()
      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Delete failed'
      setError(errorMsg)
      options.onError?.(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    create,
    update,
    remove,
    loading,
    error,
  }
}

// ============================================================================
// COMBINED CRUD HOOK
// ============================================================================

export function useSupabaseCRUD<T extends keyof Tables>(
  tableName: T,
  queryOptions: UseSupabaseQueryOptions<T> = {}
) {
  const query = useSupabaseQuery(tableName, queryOptions)
  const mutation = useSupabaseMutation(tableName, {
    onSuccess: query.refetch,
  })

  return {
    ...query,
    ...mutation,
    refresh: query.refetch,
  }
}

// ============================================================================
// SPECIFIC ENTITY HOOKS
// ============================================================================

// Convenience hooks now defined at the end of file using useSupabaseQuery

// ============================================================================
// COMPLEX QUERY HOOKS
// ============================================================================

export const useRecipesWithIngredients = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createSupabaseClient()
      const { data: result, error: queryError } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients(
            quantity,
            unit,
            ingredient:ingredients(*)
          )
        `)
        .eq('is_active', true)
        .order('name')

      if (queryError) throw queryError
      setData(result || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export const useOrdersWithItems = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createSupabaseClient()
      const { data: result, error: queryError } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(name, phone),
          order_items(
            *,
            recipe:recipes(name, selling_price)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (queryError) throw queryError
      setData(result || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================

export const useHPPCalculations = () => {
  const { data: recipes, loading: recipesLoading } = useRecipesWithIngredients()

  const calculateHPP = useCallback((recipe: any) => {
    if (!recipe.recipe_ingredients) return 0

    return recipe.recipe_ingredients.reduce((total: number, recipeIngredient: any) => {
      const ingredient = recipeIngredient.ingredient
      if (!ingredient) return total

      const cost = ingredient.price_per_unit * recipeIngredient.quantity
      return total + cost
    }, 0)
  }, [])

  const recipesWithHPP = recipes.map((recipe) => {
    const hpp = calculateHPP(recipe)
    const sellingPrice = recipe.selling_price || 0
    const margin = sellingPrice > 0 ? ((sellingPrice - hpp) / sellingPrice) * 100 : 0

    return {
      ...recipe,
      hpp,
      margin,
      profit: sellingPrice - hpp,
    }
  })

  return {
    recipes: recipesWithHPP,
    loading: recipesLoading,
    calculateHPP,
  }
}

export const useFinancialAnalytics = (startDate?: string, endDate?: string) => {
  const { data: records, loading } = useFinancialRecords()

  const analytics = {
    totalIncome: records.filter((r) => r.type === 'INCOME').reduce((sum, r) => sum + r.amount, 0),
    totalExpense: records
      .filter((r) => r.type === 'EXPENSE')
      .reduce((sum, r) => sum + r.amount, 0),
    totalTransactions: records.length,
    netProfit: 0,
    profitMargin: 0,
    categoryBreakdown: {} as Record<string, number>,
  }

  analytics.netProfit = analytics.totalIncome - analytics.totalExpense
  analytics.profitMargin =
    analytics.totalIncome > 0 ? (analytics.netProfit / analytics.totalIncome) * 100 : 0

  // Category breakdown
  records.forEach((record) => {
    if (!analytics.categoryBreakdown[record.category]) {
      analytics.categoryBreakdown[record.category] = 0
    }
    analytics.categoryBreakdown[record.category] += record.amount
  })

  return { analytics, loading, records }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export function useSupabaseBulkOperations<T extends keyof Tables>(
  tableName: T,
  options: UseSupabaseMutationOptions = {}
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bulkCreate = async (items: unknown[]) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createSupabaseClient()
      const { data, error: bulkError } = await supabase
        .from(tableName as any)
        .insert(items as any)
        .select('*')

      if (bulkError) throw bulkError

      options.onSuccess?.()
      return data
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Bulk create failed'
      setError(errorMsg)
      options.onError?.(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const bulkDelete = async (ids: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createSupabaseClient()
      const { error: bulkError } = await supabase.from(tableName as any).delete().in('id', ids)

      if (bulkError) throw bulkError

      options.onSuccess?.()
      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Bulk delete failed'
      setError(errorMsg)
      options.onError?.(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    bulkCreate,
    bulkDelete,
    loading,
    error,
  }
}

// ============================================================================
// CONVENIENCE HOOKS FOR SPECIFIC TABLES
// ============================================================================

/**
 * Hook for fetching ingredients
 */
export function useIngredients(options?: { realtime?: boolean }) {
  return useSupabaseQuery('ingredients', {
    filter: { is_active: true },
    orderBy: { column: 'name' },
    realtime: options?.realtime,
  })
}

/**
 * Hook for fetching recipes
 */
export function useRecipes(options?: { realtime?: boolean }) {
  return useSupabaseQuery('recipes', {
    filter: { is_active: true },
    orderBy: { column: 'name' },
    realtime: options?.realtime,
  })
}

/**
 * Hook for fetching orders
 */
export function useOrders(options?: { realtime?: boolean }) {
  return useSupabaseQuery('orders', {
    orderBy: { column: 'created_at', ascending: false },
    realtime: options?.realtime,
  })
}

/**
 * Hook for fetching customers
 */
export function useCustomers(options?: { realtime?: boolean }) {
  return useSupabaseQuery('customers', {
    orderBy: { column: 'name' },
    realtime: options?.realtime,
  })
}

/**
 * Hook for fetching financial records
 */
export function useFinancialRecords(options?: {
  startDate?: string
  endDate?: string
  type?: 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'WITHDRAWAL'
  realtime?: boolean
}) {
  const filter: Record<string, unknown> = {}
  if (options?.type) filter.type = options.type

  return useSupabaseQuery('financial_records', {
    filter,
    orderBy: { column: 'date', ascending: false },
    realtime: options?.realtime,
  })
}

/**
 * Hook for fetching productions
 */
export function useProductions(options?: { realtime?: boolean }) {
  return useSupabaseQuery('productions', {
    orderBy: { column: 'created_at', ascending: false },
    realtime: options?.realtime,
  })
}
