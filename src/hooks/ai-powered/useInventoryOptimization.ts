'use client'

import { useCallback, useState } from 'react'

import type { AIAnalysisState, InventoryOptimizationRequest } from '@/hooks/ai-powered/types'



/**
 * AI-Powered Inventory Optimization Hook
 * Provides intelligent inventory management recommendations based on usage patterns, seasonality, and supply chain factors
 */
export function useInventoryOptimization(): {
  data: AIAnalysisState['data'];
  loading: boolean;
  error: string | null;
  confidence: number;
  lastUpdated: string | null;
  optimizeInventory: (request: InventoryOptimizationRequest) => Promise<unknown>;
  clearAnalysis: () => void;
} {
  const [state, setState] = useState<AIAnalysisState>({
    data: null,
    loading: false,
    error: null,
    confidence: 0,
    lastUpdated: null
  })

  const optimizeInventory = useCallback(async (request: InventoryOptimizationRequest): Promise<unknown> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/ai/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        credentials: 'include', // Include cookies for authentication
      })

      const result = await response.json() as { error?: string; metadata?: { confidence?: number } }

      if (!response.ok) {
        throw new Error(result.error ?? 'Failed to optimize inventory')
      }

      setState({
        data: result,
        loading: false,
        error: null,
        confidence: result.metadata?.confidence ?? 0.8,
        lastUpdated: new Date().toISOString()
      })

      return result as unknown

     } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Unknown error'
       setState(prev => ({
         ...prev,
         loading: false,
         error: errorMessage
       }))
       throw error
     }
  }, [])

  const clearAnalysis = useCallback((): void => {
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
