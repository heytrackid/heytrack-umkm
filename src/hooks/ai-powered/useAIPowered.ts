'use client'

import { useCallback } from 'react'
import { usePricingAnalysis } from './usePricingAnalysis'
import { useInventoryOptimization } from './useInventoryOptimization'
import { useCustomerAnalytics } from './useCustomerAnalytics'
import { useFinancialAnalysis } from './useFinancialAnalysis'
import { useSmartInsights } from './useSmartInsights'
import type { AnalysisType } from './types'



/**
 * React Hook for AI-Powered Business Intelligence
 * Provides intelligent insights powered by OpenRouter AI
 * Now modularized for better maintainability and testability
 */
export function useAIPowered() {
  // Individual AI analysis hooks
  const pricingAnalysis = usePricingAnalysis()
  const inventoryAnalysis = useInventoryOptimization()
  const customerAnalysis = useCustomerAnalytics()
  const financialAnalysis = useFinancialAnalysis()

  // Smart insights generator that combines multiple analyses
  const smartInsights = useSmartInsights({
    analyzePricing: pricingAnalysis.analyzePricing,
    optimizeInventory: inventoryAnalysis.optimizeInventory
  })

  /**
   * Clear specific analysis state
   */
  const clearAnalysis = useCallback((type: AnalysisType) => {
    switch (type) {
      case 'pricing':
        pricingAnalysis.clearAnalysis()
        break
      case 'inventory':
        inventoryAnalysis.clearAnalysis()
        break
      case 'customer':
        customerAnalysis.clearAnalysis()
        break
      case 'financial':
        financialAnalysis.clearAnalysis()
        break
    }
  }, [pricingAnalysis, inventoryAnalysis, customerAnalysis, financialAnalysis])

  /**
   * Check if AI service is available
   */
  const checkAIAvailability = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/health')
      return response.ok
    } catch (error: unknown) {
      return false
    }
  }, [])

  return {
    // States
    pricing: pricingAnalysis,
    inventory: inventoryAnalysis,
    customer: customerAnalysis,
    financial: financialAnalysis,

    // Actions
    analyzePricing: pricingAnalysis.analyzePricing,
    optimizeInventory: inventoryAnalysis.optimizeInventory,
    analyzeCustomers: customerAnalysis.analyzeCustomers,
    analyzeFinancials: financialAnalysis.analyzeFinancials,
    generateSmartInsights: smartInsights.generateSmartInsights,
    clearAnalysis,
    checkAIAvailability,

    // Computed
    isAnyLoading: pricingAnalysis.loading || inventoryAnalysis.loading || customerAnalysis.loading || financialAnalysis.loading,
    hasAnyData: !!(pricingAnalysis.data || inventoryAnalysis.data || customerAnalysis.data || financialAnalysis.data),

    // Helper functions
    getConfidenceLevel: (confidence: number) => {
      if (confidence >= 0.8) {return 'high'}
      if (confidence >= 0.6) {return 'medium'}
      return 'low'
    },

    formatInsight: (insight: Record<string, unknown>, type: string) => ({
      ...insight,
      type,
      confidence: (insight.metadata as Record<string, unknown> | undefined)?.confidence as number || 0.7,
      timestamp: (insight.metadata as Record<string, unknown> | undefined)?.timestamp as string || new Date().toISOString(),
      isAIPowered: true
    })
  }
}

export default useAIPowered
