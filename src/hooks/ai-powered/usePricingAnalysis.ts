'use client'

import { useCallback, useState } from 'react'

import type { AIAnalysisState, PricingAnalysisRequest } from './types'



/**
 * AI-Powered Pricing Analysis Hook
 * Provides intelligent pricing recommendations based on ingredients, competitors, and market conditions
 */
export function usePricingAnalysis(): {
  data: AIAnalysisState['data'];
  loading: boolean;
  error: string | null;
  confidence: number;
  lastUpdated: string | null;
  analyzePricing: (request: PricingAnalysisRequest) => Promise<unknown>;
  clearAnalysis: () => void;
} {
  const [state, setState] = useState<AIAnalysisState>({
    data: null,
    loading: false,
    error: null,
    confidence: 0,
    lastUpdated: null
  })

  const analyzePricing = useCallback(async (request: PricingAnalysisRequest): Promise<unknown> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/ai/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        credentials: 'include', // Include cookies for authentication
      })

      const result = await response.json() as { error?: string; metadata?: { confidence?: string } }

      if (!response.ok) {
        throw new Error(result.error ?? 'Failed to analyze pricing')
      }

      setState({
        data: result,
        loading: false,
        error: null,
        confidence: result.metadata?.confidence === 'high' ? 0.9 : 0.7,
        lastUpdated: new Date().toISOString()
      })

      return result as unknown

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
    analyzePricing,
    clearAnalysis
  }
}
