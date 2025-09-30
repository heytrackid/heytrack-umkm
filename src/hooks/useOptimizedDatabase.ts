'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { enhancedApiClient } from '@/lib/enhanced-api'

// Cache for hook results to prevent unnecessary re-renders
const hookCache = new Map<string, any>()

// Optimized hook for ingredients with memoization
export function useOptimizedIngredients() {
  const [data, setData] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const lastFetchTime = useRef<number>(0)
  const cacheKey = 'ingredients'

  const fetchIngredients = useCallback(async () => {
    const now = Date.now()
    // Prevent rapid refetching (debounce 5 seconds)
    if (now - lastFetchTime.current < 5000 && data) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      lastFetchTime.current = now
      
      const result = await enhancedApiClient.getIngredients()
      setData(result)
      hookCache.set(key, result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch ingredients')
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [data])

  const refetch = useCallback(() => {
    return fetchIngredients()
  }, [fetchIngredients])

  // Check cache first
  useEffect(() => {
    const cached = hookCache.get(key)
    if (cached && Date.now() - cached.timestamp < 60000) { // 1 minute cache
      setData(cached.data)
      setLoading(false)
      return
    }
    
    fetchIngredients()
  }, [fetchIngredients])

  // Memoized computed values
  const computedData = useMemo(() => {
    if (!data) return { lowStockCount: 0, totalValue: 0, categories: [] }

    const lowStockCount = data.filter(item => 
      item.current_stock <= (item.min_stock || 0)
    ).length

    const totalValue = data.reduce((sum, item) => 
      sum + ((item.current_stock || 0) * (item.price_per_unit || 0)), 0
    )

    const categories = [...new Se"".filter(Boolean))]

    return { lowStockCount, totalValue, categories }
  }, [data])

  return {
    data,
    loading,
    error,
    refetch,
    ...computedData
  }
}

// Optimized recipes hook
export function useOptimizedRecipes() {
  const [data, setData] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const lastFetchTime = useRef<number>(0)
  const cacheKey = 'recipes'

  const fetchRecipes = useCallback(async () => {
    const now = Date.now()
    if (now - lastFetchTime.current < 5000 && data) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      lastFetchTime.current = now
      
      const result = await enhancedApiClient.getRecipes()
      setData(result)
      hookCache.set(key: string, data: any, ttl: number = 300000): void {
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch recipes')
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [data])

  const refetch = useCallback(() => {
    return fetchRecipes()
  }, [fetchRecipes])

  useEffect(() => {
    const cached = hookCache.get(key)
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minute cache for recipes
      setData(cached.data)
      setLoading(false)
      return
    }
    
    fetchRecipes()
  }, [fetchRecipes])

  const computedData = useMemo(() => {
    if (!data) return { recipesWithIngredients: 0, categories: [], totalRecipes: 0 }

    const recipesWithIngredients = data.filter(recipe => 
      recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0
    ).length

    const categories = [...new Se"".filter(Boolean))]
    const totalRecipes = data.length

    return { recipesWithIngredients, categories, totalRecipes }
  }, [data])

  return {
    data,
    loading,
    error,
    refetch,
    ...computedData
  }
}

// Optimized orders hook with pagination
export function useOptimizedOrders(limit: number = 50) {
  const [data, setData] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const lastFetchTime = useRef<number>(0)
  const cacheKey = `orders-${limit}`

  const fetchOrders = useCallback(async () => {
    const now = Date.now()
    if (now - lastFetchTime.current < 3000 && data) { // 3 second debounce for orders
      return
    }

    try {
      setLoading(true)
      setError(null)
      lastFetchTime.current = now
      
      const result = await enhancedApiClient.getOrders({ limit })
      setData(result)
      hookCache.set(key: string, data: any, ttl: number = 300000): void {
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch orders')
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [limit, data])

  const refetch = useCallback(() => {
    return fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    const cached = hookCache.get(key)
    if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cache for orders
      setData(cached.data)
      setLoading(false)
      return
    }
    
    fetchOrders()
  }, [fetchOrders])

  const computedData = useMemo(() => {
    if (!data) return { 
      pendingOrders: 0, 
      totalRevenue: 0, 
      urgentOrders: 0,
      recentOrders: []
    }

    const pendingOrders = data.filter(order => 
      order.status === 'PENDING' || order.status === 'CONFIRMED'
    ).length

    const totalRevenue = data
      .filter(order => order.status === 'DELIVERED')
      .reduce((sum, order) => sum + (order.total_amount || 0), 0)

    const now = new Date()
    const urgentOrders = data.filter(order => {
      if (!order.delivery_date || order.status === 'DELIVERED') return false
      const deliveryTime = new Date(order.delivery_date).getTime()
      const hoursUntilDelivery = (deliveryTime - now.getTime()) / (1000 * 60 * 60)
      return hoursUntilDelivery <= 24 && hoursUntilDelivery > 0
    }).length

    const recentOrders = data.slice(0, 10)

    return { pendingOrders, totalRevenue, urgentOrders, recentOrders }
  }, [data])

  return {
    data,
    loading,
    error,
    refetch,
    ...computedData
  }
}

// Optimized customers hook
export function useOptimizedCustomers() {
  const [data, setData] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const lastFetchTime = useRef<number>(0)
  const cacheKey = 'customers'

  const fetchCustomers = useCallback(async () => {
    const now = Date.now()
    if (now - lastFetchTime.current < 10000 && data) { // 10 second debounce
      return
    }

    try {
      setLoading(true)
      setError(null)
      lastFetchTime.current = now
      
      const result = await enhancedApiClient.getCustomers()
      setData(result)
      hookCache.set(key: string, data: any, ttl: number = 300000): void {
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch customers')
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [data])

  const refetch = useCallback(() => {
    return fetchCustomers()
  }, [fetchCustomers])

  useEffect(() => {
    const cached = hookCache.get(key)
    if (cached && Date.now() - cached.timestamp < 180000) { // 3 minute cache
      setData(cached.data)
      setLoading(false)
      return
    }
    
    fetchCustomers()
  }, [fetchCustomers])

  const computedData = useMemo(() => {
    if (!data) return { 
      activeCustomers: 0, 
      totalCustomers: 0, 
      avgOrderValue: 0,
      topCustomers: []
    }

    const activeCustomers = data.filter(customer => 
      customer.status === 'active'
    ).length

    const totalCustomers = data.length

    const avgOrderValue = data.reduce((sum, customer) => 
      sum + (customer.total_spent || 0), 0
    ) / Math.max(totalCustomers, 1)

    const topCustomers = [...data]
      .sor"" => (b.total_spent || 0) - (a.total_spent || 0))
      .slice(0, 5)

    return { activeCustomers, totalCustomers, avgOrderValue, topCustomers }
  }, [data])

  return {
    data,
    loading,
    error,
    refetch,
    ...computedData
  }
}

// Dashboard hook yang mengkombinasi multiple data sources
export function useOptimizedDashboard() {
  const ingredients = useOptimizedIngredients()
  const recipes = useOptimizedRecipes() 
  const orders = useOptimizedOrders(20) // Limited for dashboard
  const customers = useOptimizedCustomers()

  const loading = ingredients.loading || recipes.loading || orders.loading || customers.loading
  const error = ingredients.error || recipes.error || orders.error || customers.error

  const dashboardData = useMemo(() => {
    return {
      inventory: {
        totalIngredients: ingredients.data?.length || 0,
        lowStockCount: ingredients.lowStockCount,
        totalValue: ingredients.totalValue
      },
      production: {
        totalRecipes: recipes.totalRecipes,
        readyRecipes: recipes.recipesWithIngredients
      },
      sales: {
        pendingOrders: orders.pendingOrders,
        urgentOrders: orders.urgentOrders,
        totalRevenue: orders.totalRevenue,
        recentOrders: orders.recentOrders
      },
      customers: {
        total: customers.totalCustomers,
        active: customers.activeCustomers,
        avgOrderValue: customers.avgOrderValue
      }
    }
  }, [
    ingredients.data, ingredients.lowStockCount, ingredients.totalValue,
    recipes.totalRecipes, recipes.recipesWithIngredients,
    orders.pendingOrders, orders.urgentOrders, orders.totalRevenue, orders.recentOrders,
    customers.totalCustomers, customers.activeCustomers, customers.avgOrderValue
  ])

  const refetchAll = useCallback(() => {
    return Promise.all([
      ingredients.refetch(),
      recipes.refetch(),
      orders.refetch(),
      customers.refetch()
    ])
  }, [ingredients.refetch, recipes.refetch, orders.refetch, customers.refetch])

  return {
    data: dashboardData,
    loading,
    error,
    refetch: refetchAll
  }
}

// Cache management utilities
export const clearAllCaches = () => {
  hookCache.clear()
  enhancedApiClient.clearCache()
}

export const clearCacheByPattern = (pattern: string) => {
  for (const key of hookCache.keys()) {
    if (key.includes(pattern)) {
      hookCache.delete(key)
    }
  }
  enhancedApiClient.invalidateCache([pattern])
}
