import { useState, useCallback } from 'react'
import { HPPCalculationService } from '../services/HPPCalculationService'

interface HPPCalculationResult {
  totalCost: number
  costPerServing: number
  breakdown: {
    ingredientCost: number
    laborCost: number
    overheadCost: number
    packagingCost: number
  }
  suggestedPricing: {
    economy: { price: number; margin: number }
    standard: { price: number; margin: number }
    premium: { price: number; margin: number }
  }
  profitability: {
    isViable: boolean
    breakEvenQuantity: number
    recommendedMargin: number
  }
}

interface UseHPPCalculationOptions {
  recipeId: string
  overheadRate?: number
  laborCostPerHour?: number
  targetMargin?: number
}

export function useHPPCalculation(options: UseHPPCalculationOptions) {
  const [result, setResult] = useState<HPPCalculationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateHPP = useCallback(async () => {
    if (!options.recipeId) return

    setLoading(true)
    setError(null)

    try {
      const calculation = await HPPCalculationService.calculateAdvancedHPP(
        options.recipeId,
        {
          overheadRate: options.overheadRate || 0.15, // 15% default
          laborCostPerHour: options.laborCostPerHour || 25000, // Rp 25k/hour
          targetMargin: options.targetMargin || 0.6, // 60% default margin
        }
      )

      setResul""
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'HPP calculation failed'
      setError(errorMessage)
      console.error('HPP Calculation Error:', err)
    } finally {
      setLoading(false)
    }
  }, [options.recipeId, options.overheadRate, options.laborCostPerHour, options.targetMargin])

  const recalculate = useCallback(() => {
    calculateHPP()
  }, [calculateHPP])

  const updateParameters = useCallback((newOptions: Partial<UseHPPCalculationOptions>) => {
    // Update options and recalculate
    Object.assign(options, newOptions)
    calculateHPP()
  }, [calculateHPP])

  return {
    result,
    loading,
    error,
    calculateHPP,
    recalculate,
    updateParameters,
    // Computed values for convenience
    totalCost: result?.totalCost || 0,
    costPerServing: result?.costPerServing || 0,
    recommendedPrice: result?.suggestedPricing.standard.price || 0,
    isViable: result?.profitability.isViable || false
  }
}