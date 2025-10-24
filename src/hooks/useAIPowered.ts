/**
 * React Hook for AI-Powered Business Intelligence
 * Provides intelligent insights powered by OpenRouter AI
 */

import { useCallback, useState } from 'react'

import { apiLogger } from '@/lib/logger'
interface AIAnalysisState<T = unknown > {
  data: T | null
  loading: boolean
  error: string | null
  confidence: number
  lastUpdated: string | null
}

interface PricingAnalysisRequest {
  productName: string
  ingredients: Array<{ name: string; cost: number; quantity: number }>
  currentPrice?: number
  competitorPrices?: number[]
  location?: string
  targetMarket?: 'premium' | 'mid-market' | 'budget'
}

interface InventoryOptimizationRequest {
  ingredients: Array<{
    name: string
    currentStock: number
    minStock: number
    usagePerWeek?: number
    price: number
    supplier?: string
    leadTime?: number
  }>
  seasonality?: 'high' | 'normal' | 'low'
  upcomingEvents?: string[]
  weatherForecast?: string
}

interface CustomerAnalyticsRequest {
  customers: Array<{
    id: string
    name: string
    totalOrders: number
    totalSpent: number
    lastOrderDate: string
    averageOrderValue: number
    preferredProducts: string[]
  }>
  salesData: Array<{
    date: string
    amount: number
    customerType: string
  }>
  marketConditions: {
    season: string
    competition: 'high' | 'medium' | 'low'
    economicCondition: 'good' | 'fair' | 'challenging'
  }
}

export function useAIPowered() {
  // Pricing Analysis State
  const [pricingState, setPricingState] = useState<AIAnalysisState>({
    data: null,
    loading: false,
    error: null,
    confidence: 0,
    lastUpdated: null
  })

  // Inventory Optimization State
  const [inventoryState, setInventoryState] = useState<AIAnalysisState>({
    data: null,
    loading: false,
    error: null,
    confidence: 0,
    lastUpdated: null
  })

  // Customer Analytics State
  const [customerState, setCustomerState] = useState<AIAnalysisState>({
    data: null,
    loading: false,
    error: null,
    confidence: 0,
    lastUpdated: null
  })

  // Financial Analysis State
  const [financialState, setFinancialState] = useState<AIAnalysisState>({
    data: null,
    loading: false,
    error: null,
    confidence: 0,
    lastUpdated: null
  })

  /**
   * 🧠 AI-Powered Pricing Analysis
   */
  const analyzePricing = useCallback(async (request: PricingAnalysisRequest) => {
    setPricingState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/ai/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze pricing')
      }

      setPricingState({
        data: result,
        loading: false,
        error: null,
        confidence: result.metadata?.confidence === 'high' ? 0.9 : 0.7,
        lastUpdated: new Date().toISOString()
      })

      return result

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setPricingState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  /**
   * 📦 AI-Powered Inventory Optimization
   */
  const optimizeInventory = useCallback(async (request: InventoryOptimizationRequest) => {
    setInventoryState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/ai/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to optimize inventory')
      }

      setInventoryState({
        data: result,
        loading: false,
        error: null,
        confidence: result.metadata?.confidence || 0.8,
        lastUpdated: new Date().toISOString()
      })

      return result

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setInventoryState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  /**
   * 👥 AI-Powered Customer Analytics
   */
  const analyzeCustomers = useCallback(async (request: CustomerAnalyticsRequest) => {
    setCustomerState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/ai/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze customers')
      }

      setCustomerState({
        data: result,
        loading: false,
        error: null,
        confidence: 0.85,
        lastUpdated: new Date().toISOString()
      })

      return result

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setCustomerState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  /**
   * 💰 AI-Powered Financial Analysis
   */
  const analyzeFinancials = useCallback(async (data: {
    revenue: Array<{ date: string; amount: number }>
    expenses: Array<{ date: string; category: string; amount: number }>
    inventory: { totalValue: number; turnoverRate: number }
    cashFlow: { current: number; projected30Days: number }
    businessMetrics: {
      grossMargin: number
      netMargin: number
      customerCount: number
      averageOrderValue: number
    }
  }) => {
    setFinancialState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/ai/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze financials')
      }

      setFinancialState({
        data: result,
        loading: false,
        error: null,
        confidence: 0.88,
        lastUpdated: new Date().toISOString()
      })

      return result

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setFinancialState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  /**
   * 🚀 Smart Business Insights Generator
   * Combines multiple AI analyses for comprehensive insights
   */
  const generateSmartInsights = useCallback(async (businessData: {
    recipes?: unknown[]
    ingredients?: unknown[]
    orders?: unknown[]
    customers?: unknown[]
    financials?: unknown
  }) => {
    const insights = []

    try {
      // Generate pricing insights if recipes available
      if (businessData.recipes && businessData.ingredients) {
        const topRecipes = businessData.recipes.slice(0, 3)
        for (const recipe of topRecipes) {
          if (recipe.recipe_ingredients) {
            const ingredients = recipe.recipe_ingredients.map((ri: any) => ({
              name: ri.ingredient?.name || 'Unknown',
              cost: (ri.ingredient?.price_per_unit || 0) * ri.quantity,
              quantity: ri.quantity
            }))

            try {
              const pricingAnalysis = await analyzePricing({
                productName: recipe.name,
                ingredients,
                currentPrice: recipe.selling_price
              })

              insights.push({
                type: 'pricing',
                productName: recipe.name,
                analysis: pricingAnalysis,
                priority: 'high'
              })
            } catch (error: unknown) {
              apiLogger.warn(`Pricing analysis failed for ${recipe.name}:`, error)
            }
          }
        }
      }

      // Generate inventory insights if ingredients available
      if (businessData.ingredients && businessData.ingredients.length > 0) {
        try {
          const inventoryOptimization = await optimizeInventory({
            ingredients: businessData.ingredients.map((ing: any) => ({
              name: ing.name,
              currentStock: ing.current_stock,
              minStock: ing.min_stock,
              price: ing.price_per_unit,
              supplier: ing.supplier || 'Unknown',
              leadTime: 3
            }))
          })

          insights.push({
            type: 'inventory',
            analysis: inventoryOptimization,
            priority: 'medium'
          })
        } catch (error: unknown) {
          apiLogger.warn('Inventory optimization failed:', error)
        }
      }

      return insights

    } catch (error: unknown) {
      apiLogger.error({ error: error }, 'Smart insights generation failed:')
      return []
    }
  }, [analyzePricing, optimizeInventory])

  /**
   * Clear specific analysis state
   */
  const clearAnalysis = useCallback((type: 'pricing' | 'inventory' | 'customer' | 'financial') => {
    const clearState = {
      data: null,
      loading: false,
      error: null,
      confidence: 0,
      lastUpdated: null
    }

    switch (type) {
      case 'pricing':
        setPricingState(clearState)
        break
      case 'inventory':
        setInventoryState(clearState)
        break
      case 'customer':
        setCustomerState(clearState)
        break
      case 'financial':
        setFinancialState(clearState)
        break
    }
  }, [])

  /**
   * Check if AI service is available
   */
  const checkAIAvailability = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/health')
      return response.ok
    } catch {
      return false
    }
  }, [])

  return {
    // States
    pricing: pricingState,
    inventory: inventoryState,
    customer: customerState,
    financial: financialState,

    // Actions
    analyzePricing,
    optimizeInventory,
    analyzeCustomers,
    analyzeFinancials,
    generateSmartInsights,
    clearAnalysis,
    checkAIAvailability,

    // Computed
    isAnyLoading: pricingState.loading || inventoryState.loading || customerState.loading || financialState.loading,
    hasAnyData: !!(pricingState.data || inventoryState.data || customerState.data || financialState.data),

    // Helper functions
    getConfidenceLevel: (confidence: number) => {
      if (confidence >= 0.8) return 'high'
      if (confidence >= 0.6) return 'medium'
      return 'low'
    },

    formatInsight: (insight: any, type: string) => ({
      ...insight,
      type,
      confidence: insight.metadata?.confidence || 0.7,
      timestamp: insight.metadata?.timestamp || new Date().toISOString(),
      isAIPowered: true
    })
  }
}

export default useAIPowered