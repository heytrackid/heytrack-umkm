/**
 * @deprecated This file is deprecated. Use @/hooks/useSupabase instead.
 * See MIGRATION_GUIDE.md for migration instructions.
 */

'use client'

import { dbService, supabase } from '@/lib/supabase'
import { Database } from '@/types'
import { useEffect, useState } from 'react'

type Tables = Database['public']['Tables']

/**
 * @deprecated Use useSupabaseCRUD from @/hooks/useSupabase instead
 */
export function useTable<T extends keyof Tables>(
  tableName: T,
  options: {
    select?: string
    filter?: Record<string, any>
    orderBy?: { column: string; ascending?: boolean }
    realtime?: boolean
  } = {}
) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      let query = supabase.from(tableName).select('*')

      // Apply filters
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        })
      }

      const { data: result, error } = await query

      if (error) throw error
      setData(result || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const insert = async (values: any) => {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select('*')
        .single()

      if (error) throw error
      
      await fetchData() // Refetch to update local state
      return result
    } catch (err) {
      throw err instanceof Error ? err : new Error('Insert failed')
    }
  }

  const update = async (id: string, values: any) => {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(values as any)
        .eq('id', id as any)
        .select('*')
        .single()

      if (error) throw error
      
      await fetchData() // Refetch to update local state
      return result
    } catch (err) {
      throw err instanceof Error ? err : new Error('Update failed')
    }
  }

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id as any)

      if (error) throw error
      
      await fetchData() // Refetch to update local state
      return true
    } catch (err) {
      throw err instanceof Error ? err : new Error('Delete failed')
    }
  }

  useEffect(() => {
    fetchData()

    // Setup realtime subscription if enabled
    if (options.realtime) {
      const channel = supabase
        .channel(`realtime_${tableName}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: tableName },
          () => {
            fetchData() // Refetch on any change
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [tableName, JSON.stringify(options)])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    insert,
    update,
    remove,
  }
}

// Specific hooks for each table
export const useIngredients = (options?: { realtime?: boolean }) =>
  useTable('ingredients', {
    filter: { is_active: true },
    orderBy: { column: 'name' },
    ...options,
  })

export const useRecipes = (options?: { realtime?: boolean }) =>
  useTable('recipes', {
    filter: { is_active: true },
    orderBy: { column: 'name' },
    ...options,
  })

export const useOrders = (options?: { realtime?: boolean }) =>
  useTable('orders', {
    orderBy: { column: 'created_at', ascending: false },
    ...options,
  })

export const useCustomers = (options?: { realtime?: boolean }) =>
  useTable('customers', {
    orderBy: { column: 'name' },
    ...options,
  })

export const useFinancialRecords = (options?: { 
  startDate?: string
  endDate?: string
  type?: 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'WITHDRAWAL'
  realtime?: boolean 
}) => {
  const filter: Record<string, any> = {}
  if (options?.type) filter.type = options.type

  return useTable('financial_records', {
    filter,
    orderBy: { column: 'date', ascending: false },
    realtime: options?.realtime,
  })
}

export const useProductions = (options?: { realtime?: boolean }) =>
  useTable('productions', {
    orderBy: { column: 'created_at', ascending: false },
    ...options,
  })

// Hook for recipes with ingredients (complex query)
export const useRecipesWithIngredients = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await dbService.getRecipesWithIngredients()
      setData(result || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, error, refetch: fetchData }
}

// Hook for orders with items (complex query)
export const useOrdersWithItems = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await dbService.getOrdersWithItems()
      setData(result || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, error, refetch: fetchData }
}

// Hook for HPP calculations
export const useHPPCalculations = () => {
  const { data: recipes, loading: recipesLoading } = useRecipesWithIngredients()
  
  const calculateHPP = (recipe: any) => {
    if (!recipe.recipe_ingredients) return 0
    
    return recipe.recipe_ingredients.reduce((total: number, recipeIngredient: any) => {
      const ingredient = recipeIngredient.ingredient
      if (!ingredient) return total
      
      const cost = (ingredient.price_per_unit * recipeIngredient.quantity)
      return total + cost
    }, 0)
  }

  const recipesWithHPP = recipes.map(recipe => {
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

// Hook for financial analytics
export const useFinancialAnalytics = (startDate?: string, endDate?: string) => {
  const { data: records, loading } = useFinancialRecords({ startDate, endDate })
  
  const analytics = {
    totalIncome: records.filter(r => r.type === 'INCOME').reduce((sum, r) => sum + r.amount, 0),
    totalExpense: records.filter(r => r.type === 'EXPENSE').reduce((sum, r) => sum + r.amount, 0),
    totalTransactions: records.length,
    netProfit: 0,
    profitMargin: 0,
    categoryBreakdown: {} as Record<string, number>,
  }
  
  analytics.netProfit = analytics.totalIncome - analytics.totalExpense
  analytics.profitMargin = analytics.totalIncome > 0 ? (analytics.netProfit / analytics.totalIncome) * 100 : 0
  
  // Category breakdown
  records.forEach(record => {
    if (!analytics.categoryBreakdown[record.category]) {
      analytics.categoryBreakdown[record.category] = 0
    }
    analytics.categoryBreakdown[record.category] += record.amount
  })
  
  return { analytics, loading, records }
}

// HPP Review Analysis Hook
export function useHPPReview() {
  const { data: recipes, loading: recipesLoading } = useRecipesWithIngredients()
  const { data: orders } = useOrders()
  const { data: ingredients } = useIngredients()
  const [reviewData, setReviewData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!recipes || recipesLoading || !ingredients) {
      setLoading(true)
      return
    }

    const calculateReview = () => {
      const reviewItems = recipes.map(recipe => {
        // Calculate current HPP
        const currentHPP = recipe.recipe_ingredients?.reduce((total: number, ri: any) => {
          const ingredient = ingredients.find(ing => ing.id === ri.ingredient_id)
          if (!ingredient) return total
          return total + (ri.quantity * ingredient.price_per_unit)
        }, 0) || 0

        // Calculate suggested HPP (simulate market changes)
        const marketFluctuation = Math.random() * 0.3 - 0.15 // -15% to +15%
        const suggestedHPP = Math.max(currentHPP * (1 + marketFluctuation), currentHPP * 0.8)
        
        const currentPrice = recipe.selling_price || (currentHPP * 1.5) // Default 50% margin
        const currentMargin = currentPrice > 0 ? ((currentPrice - currentHPP) / currentPrice) * 100 : 0
        
        // Calculate suggested price based on target margin
        const targetMargin = 0.4 // 40% target margin
        const suggestedPrice = suggestedHPP / (1 - targetMargin)
        const suggestedMargin = ((suggestedPrice - suggestedHPP) / suggestedPrice) * 100
        
        // Determine status
        let status = 'maintain'
        const reasons: string[] = []
        
        if (suggestedHPP < currentHPP * 0.9) {
          status = 'optimize'
          reasons.push('Efisiensi bahan baku memungkinkan pengurangan HPP')
          reasons.push('Optimasi proses produksi')
        } else if (suggestedHPP > currentHPP * 1.1) {
          status = 'adjust'
          reasons.push('Kenaikan harga bahan baku')
          reasons.push('Inflasi biaya produksi')
        } else if (currentMargin < 30) {
          status = 'opportunity'
          reasons.push('Margin profit masih bisa ditingkatkan')
          reasons.push('Potensi kenaikan harga jual')
        } else {
          reasons.push('HPP sudah optimal')
          reasons.push('Margin sesuai target')
        }
        
        return {
          id: recipe.id,
          productName: recipe.name,
          currentHPP: Math.round(currentHPP),
          currentPrice: Math.round(currentPrice),
          currentMargin: Number(currentMargin.toFixed(1)),
          suggestedHPP: Math.round(suggestedHPP),
          suggestedPrice: Math.round(suggestedPrice),
          suggestedMargin: Number(suggestedMargin.toFixed(1)),
          status,
          reasons
        }
      })
      
      setReviewData(reviewItems)
      setLoading(false)
    }

    calculateReview()
  }, [recipes, recipesLoading, ingredients])

  return {
    reviewData,
    loading,
    summaryStats: {
      totalProducts: reviewData.length,
      needAdjustment: reviewData.filter(item => item.status === 'adjust').length,
      canOptimize: reviewData.filter(item => item.status === 'optimize').length,
      opportunities: reviewData.filter(item => item.status === 'opportunity').length,
    }
  }
}