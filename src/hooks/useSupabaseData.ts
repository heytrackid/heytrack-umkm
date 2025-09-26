'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, dbService, subscribeToTable } from '@/lib/supabase'
import { 
  Ingredient, 
  RecipeWithIngredients, 
  OrderWithItems, 
  Customer, 
  ProductionWithRecipe, 
  FinancialRecord,
  Database
} from '@/types/database'

// Generic hook for real-time data
export function useRealtimeData<T>(
  tableName: keyof Database['public']['Tables'],
  initialData: T[] = [],
  fetchFunction?: () => Promise<T[]>
) {
  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!fetchFunction) return
    
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFunction()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [fetchFunction])

  useEffect(() => {
    fetchData()

    // Subscribe to real-time changes
    const unsubscribe = subscribeToTable(
      tableName,
      (payload) => {
        console.log('Realtime update:', payload)
        // Refetch data when changes occur
        fetchData()
      }
    )

    return () => {
      unsubscribe()
    }
  }, [fetchData, tableName])

  return { data, loading, error, refetch: fetchData }
}

// Hook for ingredients
export function useIngredients() {
  return useRealtimeData<Ingredient>(
    'ingredients',
    [],
    dbService.getIngredients
  )
}

// Hook for recipes with ingredients
export function useRecipesWithIngredients() {
  return useRealtimeData<RecipeWithIngredients>(
    'recipes',
    [],
    dbService.getRecipesWithIngredients
  )
}

// Hook for orders with items
export function useOrdersWithItems() {
  return useRealtimeData<OrderWithItems>(
    'orders',
    [],
    dbService.getOrdersWithItems
  )
}

// Hook for customers
export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (error) throw error
        setCustomers(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch customers')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()

    // Subscribe to real-time changes
    const unsubscribe = subscribeToTable('customers', () => {
      fetchCustomers()
    })

    return () => unsubscribe()
  }, [])

  return { customers, loading, error }
}

// Hook for productions
export function useProductions() {
  return useRealtimeData<ProductionWithRecipe>(
    'productions',
    [],
    dbService.getProductions
  )
}

// Hook for financial records
export function useFinancialRecords(startDate?: string, endDate?: string) {
  const [records, setRecords] = useState<FinancialRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true)
        const data = await dbService.getFinancialRecords(startDate, endDate)
        setRecords(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch financial records')
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()

    // Subscribe to real-time changes
    const unsubscribe = subscribeToTable('financial_records', () => {
      fetchRecords()
    })

    return () => unsubscribe()
  }, [startDate, endDate])

  return { records, loading, error }
}

// Hook for creating/updating data
export function useSupabaseMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeWithLoading = async <T>(operation: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await operation()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }

  const addIngredient = (ingredient: Database['public']['Tables']['ingredients']['Insert']) =>
    executeWithLoading(() => dbService.addIngredient(ingredient))

  const updateIngredient = (id: string, updates: Database['public']['Tables']['ingredients']['Update']) =>
    executeWithLoading(() => dbService.updateIngredient(id, updates))

  const addCustomer = (customer: Database['public']['Tables']['customers']['Insert']) =>
    executeWithLoading(async () => {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single()
      
      if (error) throw error
      return data
    })

  const updateCustomer = (id: string, updates: Database['public']['Tables']['customers']['Update']) =>
    executeWithLoading(async () => {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    })

  const addOrder = (order: Database['public']['Tables']['orders']['Insert']) =>
    executeWithLoading(async () => {
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single()
      
      if (error) throw error
      return data
    })

  const updateOrderStatus = (id: string, status: Database['public']['Enums']['order_status']) =>
    executeWithLoading(async () => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    })

  const addProduction = (production: Database['public']['Tables']['productions']['Insert']) =>
    executeWithLoading(async () => {
      const { data, error } = await supabase
        .from('productions')
        .insert(production)
        .select()
        .single()
      
      if (error) throw error
      return data
    })

  const updateProductionStatus = (id: string, status: Database['public']['Enums']['production_status']) =>
    executeWithLoading(async () => {
      const { data, error } = await supabase
        .from('productions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    })

  const addFinancialRecord = (record: Database['public']['Tables']['financial_records']['Insert']) =>
    executeWithLoading(async () => {
      const { data, error } = await supabase
        .from('financial_records')
        .insert(record)
        .select()
        .single()
      
      if (error) throw error
      return data
    })

  const updateStock = (ingredientId: string, quantity: number, type: Database['public']['Enums']['transaction_type'], reference?: string) =>
    executeWithLoading(async () => {
      // First, update ingredient stock
      const { data: ingredient, error: ingredientError } = await supabase
        .from('ingredients')
        .select('current_stock, unit')
        .eq('id', ingredientId)
        .single()

      if (ingredientError) throw ingredientError

      const newStock = type === 'USAGE' || type === 'WASTE' 
        ? ingredient.current_stock - quantity 
        : ingredient.current_stock + quantity

      const { error: updateError } = await supabase
        .from('ingredients')
        .update({ current_stock: newStock })
        .eq('id', ingredientId)

      if (updateError) throw updateError

      // Then, record the transaction
      const { data, error } = await supabase
        .from('stock_transactions')
        .insert({
          ingredient_id: ingredientId,
          type,
          quantity,
          unit: ingredient.unit,
          reference,
          notes: `Stock ${type.toLowerCase()}: ${reference || 'Manual adjustment'}`
        })
        .select()
        .single()

      if (error) throw error
      return data
    })

  return {
    loading,
    error,
    addIngredient,
    updateIngredient,
    addCustomer,
    updateCustomer,
    addOrder,
    updateOrderStatus,
    addProduction,
    updateProductionStatus,
    addFinancialRecord,
    updateStock
  }
}