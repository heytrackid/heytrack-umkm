'use client'

import { useCallback } from 'react'

import { useCustomerAnalytics } from '@/hooks/ai-powered/useCustomerAnalytics'
import { useFinancialAnalysis } from '@/hooks/ai-powered/useFinancialAnalysis'
import { useInventoryOptimization } from '@/hooks/ai-powered/useInventoryOptimization'
import { usePricingAnalysis } from '@/hooks/ai-powered/usePricingAnalysis'
import { useSmartInsights } from '@/hooks/ai-powered/useSmartInsights'

import type { AnalysisType } from '@/hooks/ai-powered/types'



/**
 * React Hook for AI-Powered Business Intelligence
 * Provides intelligent insights powered by OpenRouter AI
 * Now modularized for better maintainability and testability
 */
export function useAIPowered(): {
  pricing: ReturnType<typeof usePricingAnalysis>;
  inventory: ReturnType<typeof useInventoryOptimization>;
  customer: ReturnType<typeof useCustomerAnalytics>;
  financial: ReturnType<typeof useFinancialAnalysis>;
  analyzePricing: ReturnType<typeof usePricingAnalysis>['analyzePricing'];
  optimizeInventory: ReturnType<typeof useInventoryOptimization>['optimizeInventory'];
  analyzeCustomers: ReturnType<typeof useCustomerAnalytics>['analyzeCustomers'];
  analyzeFinancials: ReturnType<typeof useFinancialAnalysis>['analyzeFinancials'];
  generateSmartInsights: ReturnType<typeof useSmartInsights>['generateSmartInsights'];
  clearAnalysis: (type: AnalysisType) => void;
  checkAIAvailability: () => Promise<boolean>;
  isAnyLoading: boolean;
  hasAnyData: boolean;
  getConfidenceLevel: (confidence: number) => string;
  formatInsight: (insight: Record<string, unknown>, type: string) => Record<string, unknown>;
} {
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
  const clearAnalysis = useCallback((type: AnalysisType): void => {
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
      default:
        break
    }
  }, [pricingAnalysis, inventoryAnalysis, customerAnalysis, financialAnalysis])

  /**
   * Check if AI service is available
   */
  const checkAIAvailability = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/ai/health', {
        credentials: 'include', // Include cookies for authentication
      })
      return response.ok
    } catch (_error: unknown) {
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
    hasAnyData: Boolean(pricingAnalysis['data'] ?? inventoryAnalysis['data'] ?? customerAnalysis['data'] ?? financialAnalysis['data']),

    // Helper functions
    getConfidenceLevel: (confidence: number): string => {
      if (confidence >= 0.8) {return 'high'}
      if (confidence >= 0.6) {return 'medium'}
      return 'low'
    },

    formatInsight: (insight: Record<string, unknown>, type: string): Record<string, unknown> => ({
      ...insight,
      type,
      confidence: (insight['metadata'] as Record<string, unknown>)?.['confidence'] as number || 0.7,
      timestamp: (insight['metadata'] as Record<string, unknown>)?.['timestamp'] as string || new Date().toISOString(),
      isAIPowered: true
    })
  }
}

