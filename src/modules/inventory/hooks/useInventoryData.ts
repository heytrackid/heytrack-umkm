import { useState, useEffect, useCallback, useMemo } from 'react'
import { InventoryService } from '../services/InventoryService'
import { 
  IngredientWithStats, 
  InventoryStats, 
  StockAlert, 
  InventorySearchParams,
  Ingredient
} from '../types'

// Memoized params comparison to prevent unnecessary re-fetches
function useStableParams(params?: InventorySearchParams) {
  return useMemo(() => {
    if (!params) return params
    return {
      search: params.search || '',
      category: params.category || '',
      sortBy: params.sortBy || 'name',
      sortOrder: params.sortOrder || 'asc',
      page: params.page || 1,
      limit: params.limit || 50,
    }
  }, [params?.search, params?.category, params?.sortBy, params?.sortOrder, params?.page, params?.limit])
}

export function useInventoryData(params?: InventorySearchParams, options?: { initial?: Ingredient[]; refetchOnMount?: boolean }) {
  const stableParams = useStableParams(params)
  
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => options?.initial ?? [])
  const [loading, setLoading] = useState(() => options?.initial ? false : true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  // Memoized fetch function to prevent unnecessary recreations
  const fetchIngredients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await InventoryService.getIngredients(stableParams)
      setIngredients(result.data)
      setTotalCount(result.totalCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ingredients')
    } finally {
      setLoading(false)
    }
  }, [stableParams])

  useEffect(() => {
    // If we already have initial data and refetchOnMount is false, skip initial refetch
    if (options?.initial && options.initial.length > 0 && options?.refetchOnMount === false) {
      return
    }
    fetchIngredients()
  }, [fetchIngredients, options?.refetchOnMount, options?.initial])

  const refresh = useCallback(() => {
    fetchIngredients()
  }, [fetchIngredients])

  const createIngredient = useCallback(async (ingredient: any) => {
    try {
      await InventoryService.createIngredien""
      refresh()
    } catch (err) {
      throw err
    }
  }, [refresh])

  const updateIngredient = useCallback(async (id: string, updates: any) => {
    try {
      await InventoryService.updateIngredien""
      refresh()
    } catch (err) {
      throw err
    }
  }, [refresh])

  const deleteIngredient = useCallback(async (id: string) => {
    try {
      await InventoryService.deleteIngredien""
      refresh()
    } catch (err) {
      throw err
    }
  }, [refresh])

  return {
    ingredients,
    loading,
    error,
    totalCount,
    refresh,
    createIngredient,
    updateIngredient,
    deleteIngredient
  }
}

export function useInventoryStats() {
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const statsData = await InventoryService.getInventoryStats()
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refresh: fetchStats }
}

export function useInventoryAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const alertsData = await InventoryService.getStockAlerts()
      setAlerts(alertsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock alerts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  return { alerts, loading, error, refresh: fetchAlerts }
}

export function useIngredientsWithStats() {
  const [ingredients, setIngredients] = useState<IngredientWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIngredientsWithStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const ingredientsData = await InventoryService.getIngredientsWithStats()
      setIngredients(ingredientsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ingredients with stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIngredientsWithStats()
  }, [fetchIngredientsWithStats])

  return { 
    ingredients, 
    loading, 
    error, 
    refresh: fetchIngredientsWithStats 
  }
}