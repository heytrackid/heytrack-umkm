'use client'

import { useCallback, useState } from 'react'
import { apiLogger } from '@/lib/logger'
import type { AIAnalysisState, InventoryOptimizationRequest } from './types'

/**
 * AI-Powered Inventory Optimization Hook
 * Provides intelligent inventory management recommendations based on usage patterns, seasonality, and supply chain factors
 */
export function useInventoryOptimization() {
  const [state, setState] = useState<AIAnalysisState>({
    data: null,
    loading: false,
    error: null,
    confidence: 0,
    lastUpdated: null
  })

  const optimizeInventory = useCallback(async (request: InventoryOptimizationRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

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

      setState({
        data: result,
        loading: false,
        error: null,
        confidence: result.metadata?.confidence || 0.8,
        lastUpdated: new Date().toISOString()
      })

      return result

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  const clearAnalysis = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      confidence: 0,
      lastUpdated: null
    })
  }, [])

  return {
    ...state,
    optimizeInventory,
    clearAnalysis
  }
}
