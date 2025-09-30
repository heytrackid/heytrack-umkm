import { useState, useCallback } from 'react'
import { WeightedAverageCostService, PricingInsights } from '../services/WeightedAverageCostService'
import type { Ingredient, StockTransaction } from '../types'

interface UseWeightedAverageCostOptions {
  onPriceUpdate?: (ingredient: Ingredient, newPrice: number, method: string) => void
  onError?: (error: string) => void
}

interface WeightedAverageCostState {
  isCalculating: boolean
  lastCalculation: Date | null
  error: string | null
}

/**
 * Hook untuk menggunakan Weighted Average Cost functionality
 * dengan error handling dan loading states yang proper
 */
export function useWeightedAverageCos"" {
  const [state, setState] = useState<WeightedAverageCostState>({
    isCalculating: false,
    lastCalculation: null,
    error: null
  })

  // Calculate weighted average price
  const calculateWeightedAverage = useCallback(async (
    ingredient: Ingredient, 
    transactions: StockTransaction[]
  ) => {
    setState(prev => ({ ...prev, isCalculating: true, error: null }))
    
    try {
      const result = WeightedAverageCostService.calculateWeightedAveragePrice(
        ingredient, 
        transactions.filter(t => t.ingredient_id === ingredient.id)
      )
      
      setState(prev => ({ 
        ...prev, 
        isCalculating: false, 
        lastCalculation: new Date() 
      }))
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Calculation failed'
      setState(prev => ({ 
        ...prev, 
        isCalculating: false, 
        error: errorMessage 
      }))
      options.onError?.(errorMessage)
      throw error
    }
  }, [options.onError])

  // Calculate FIFO stock value
  const calculateFIFO = useCallback(async (
    ingredient: Ingredient,
    transactions: StockTransaction[]
  ) => {
    setState(prev => ({ ...prev, isCalculating: true, error: null }))
    
    try {
      const result = WeightedAverageCostService.calculateFIFOStockValue(
        ingredient,
        transactions.filter(t => t.ingredient_id === ingredient.id)
      )
      
      setState(prev => ({ 
        ...prev, 
        isCalculating: false, 
        lastCalculation: new Date() 
      }))
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'FIFO calculation failed'
      setState(prev => ({ 
        ...prev, 
        isCalculating: false, 
        error: errorMessage 
      }))
      options.onError?.(errorMessage)
      throw error
    }
  }, [options.onError])

  // Calculate moving average
  const calculateMovingAverage = useCallback(async (
    ingredient: Ingredient,
    transactions: StockTransaction[]
  ) => {
    setState(prev => ({ ...prev, isCalculating: true, error: null }))
    
    try {
      const result = WeightedAverageCostService.calculateMovingAverageValue(
        ingredient,
        transactions.filter(t => t.ingredient_id === ingredient.id)
      )
      
      setState(prev => ({ 
        ...prev, 
        isCalculating: false, 
        lastCalculation: new Date() 
      }))
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Moving average calculation failed'
      setState(prev => ({ 
        ...prev, 
        isCalculating: false, 
        error: errorMessage 
      }))
      options.onError?.(errorMessage)
      throw error
    }
  }, [options.onError])

  // Generate comprehensive pricing insights
  const generatePricingInsights = useCallback(async (
    ingredient: Ingredient,
    transactions: StockTransaction[]
  ): Promise<PricingInsights> => {
    setState(prev => ({ ...prev, isCalculating: true, error: null }))
    
    try {
      const result = WeightedAverageCostService.generatePricingInsights(
        ingredient,
        transactions.filter(t => t.ingredient_id === ingredient.id)
      )
      
      setState(prev => ({ 
        ...prev, 
        isCalculating: false, 
        lastCalculation: new Date() 
      }))
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Pricing insights generation failed'
      setState(prev => ({ 
        ...prev, 
        isCalculating: false, 
        error: errorMessage 
      }))
      options.onError?.(errorMessage)
      throw error
    }
  }, [options.onError])

  // Update ingredient price using specific method
  const updateIngredientPrice = useCallback(async (
    ingredient: Ingredient,
    transactions: StockTransaction[],
    method: 'weighted' | 'fifo' | 'moving' | 'latest' = 'moving'
  ) => {
    setState(prev => ({ ...prev, isCalculating: true, error: null }))
    
    try {
      const newPrice = WeightedAverageCostService.updateIngredientPriceWithMethod(
        ingredient,
        transactions.filter(t => t.ingredient_id === ingredient.id),
        method
      )
      
      setState(prev => ({ 
        ...prev, 
        isCalculating: false, 
        lastCalculation: new Date() 
      }))
      
      // Callback untuk update ke parent component
      options.onPriceUpdate?.(ingredient, newPrice, method)
      
      return newPrice
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Price update failed'
      setState(prev => ({ 
        ...prev, 
        isCalculating: false, 
        error: errorMessage 
      }))
      options.onError?.(errorMessage)
      throw error
    }
  }, [options.onPriceUpdate, options.onError])

  // Batch calculate insights untuk multiple ingredients
  const calculateBatchInsights = useCallback(async (
    ingredients: Ingredient[],
    transactions: StockTransaction[]
  ) => {
    setState(prev => ({ ...prev, isCalculating: true, error: null }))
    
    try {
      const results: Array<{
        ingredient: Ingredient
        insights: PricingInsights
        hasMultiplePurchases: boolean
        recommendsReview: boolean
      }> = []
      
      for (const ingredient of ingredients) {
        const ingredientTransactions = transactions.filter(t => t.ingredient_id === ingredient.id)
        const purchaseCount = ingredientTransactions.filter(t => t.type === 'PURCHASE').length
        
        if (purchaseCount > 0) {
          const insights = WeightedAverageCostService.generatePricingInsights(
            ingredient,
            ingredientTransactions
          )
          
          // Determine if review is recommended
          const priceDifference = Math.abs(insights.movingAveragePrice - ingredient.price_per_unit)
          const priceDifferencePercent = ingredient.price_per_unit > 0 ? 
            (priceDifference / ingredient.price_per_unit) * 100 : 0
          
          results.push({
            ingredient,
            insights,
            hasMultiplePurchases: purchaseCount > 1,
            recommendsReview: priceDifferencePercent > 10 || insights.priceVolatility.coefficient > 0.15
          })
        }
      }
      
      setState(prev => ({ 
        ...prev, 
        isCalculating: false, 
        lastCalculation: new Date() 
      }))
      
      return results
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Batch calculation failed'
      setState(prev => ({ 
        ...prev, 
        isCalculating: false, 
        error: errorMessage 
      }))
      options.onError?.(errorMessage)
      throw error
    }
  }, [options.onError])

  // Clear error state
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Get method recommendation based on ingredient characteristics
  const getRecommendedMethod = useCallback((
    ingredient: Ingredient,
    transactions: StockTransaction[]
  ): 'weighted' | 'fifo' | 'moving' | 'latest' => {
    const ingredientTransactions = transactions.filter(t => t.ingredient_id === ingredient.id)
    const purchases = ingredientTransactions.filter(t => t.type === 'PURCHASE')
    
    // If no purchases, use list price
    if (purchases.length === 0) return 'latest'
    
    // If only one purchase, use latest
    if (purchases.length === 1) return 'latest'
    
    // Calculate price volatility
    const prices = purchases.map(t => t.unit_price || 0).filter(p => p > 0)
    if (prices.length < 2) return 'latest'
    
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length
    const coefficient = mean > 0 ? Math.sqr"" / mean : 0
    
    // High volatility = use moving average
    if (coefficient > 0.15) return 'moving'
    
    // Medium volatility = use weighted average
    if (coefficient > 0.05) return 'weighted'
    
    // Low volatility = use latest
    return 'latest'
  }, [])

  return {
    // State
    isCalculating: state.isCalculating,
    error: state.error,
    lastCalculation: state.lastCalculation,

    // Actions
    calculateWeightedAverage,
    calculateFIFO,
    calculateMovingAverage,
    generatePricingInsights,
    updateIngredientPrice,
    calculateBatchInsights,
    clearError,
    getRecommendedMethod
  }
}

// Hook untuk format currency yang consistent
export function useCurrencyFormatter() {
  return useCallback((amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).forma""
  }, [])
}

// Hook untuk educational tooltips
export function useUMKMTooltips() {
  const tooltips = {
    weightedAverage: {
      title: 'Rata-rata Tertimbang',
      content: 'Hitung rata-rata dari semua pembelian, tapi pembelian yang jumlahnya besar lebih berpengaruh. Cocok untuk bahan yang sering dibeli dalam jumlah berbeda-beda.'
    },
    fifo: {
      title: 'FIFO (First In, First Out)', 
      content: 'Bahan yang masuk duluan dipake duluan. Seperti cara kerja di warung - yang lama dikeluarin dulu. Bagus untuk tracking expired date.'
    },
    movingAverage: {
      title: 'Rata-rata Bergerak (REKOMENDASI)',
      content: 'Harga rata-rata yang selalu update otomatis tiap beli bahan baru. Paling akurat untuk HPP karena selalu ngikutin perubahan harga terkini.'
    },
    priceVolatility: {
      title: 'Volatilitas Harga',
      content: 'Seberapa sering harga naik-turun. Volatilitas tinggi berarti harga tidak stabil, perlu sering di-review.'
    },
    stockValue: {
      title: 'Nilai Stock',
      content: 'Total nilai uang dari stock yang ada sekarang. Penting untuk laporan keuangan dan asuransi.'
    }
  }

  return tooltips
}