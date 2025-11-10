'use client'

import { useCallback, useState } from 'react'

import type { AIAnalysisState, CustomerAnalyticsRequest } from '@/hooks/ai-powered/types'



/**
 * AI-Powered Customer Analytics Hook
 * Provides intelligent customer behavior analysis, segmentation, and marketing recommendations
 */
export function useCustomerAnalytics(): {
  data: AIAnalysisState['data'];
  loading: boolean;
  error: string | null;
  confidence: number;
  lastUpdated: string | null;
  analyzeCustomers: (request: CustomerAnalyticsRequest) => Promise<unknown>;
  clearAnalysis: () => void;
} {
  const [state, setState] = useState<AIAnalysisState>({
    data: null,
    loading: false,
    error: null,
    confidence: 0,
    lastUpdated: null
  })

  const analyzeCustomers = useCallback(async (request: CustomerAnalyticsRequest): Promise<unknown> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/ai/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        credentials: 'include', // Include cookies for authentication
      })

      const result = await response.json() as { error?: string }

      if (!response.ok) {
        throw new Error(result.error ?? 'Failed to analyze customers')
      }

      setState({
        data: result,
        loading: false,
        error: null,
        confidence: 0.85,
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
    analyzeCustomers,
    clearAnalysis
  }
}
