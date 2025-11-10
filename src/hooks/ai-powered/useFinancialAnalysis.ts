'use client'

import { useCallback, useState } from 'react'

import type { AIAnalysisState, FinancialAnalysisRequest } from '@/hooks/ai-powered/types'



/**
 * AI-Powered Financial Analysis Hook
 * Provides intelligent financial performance analysis, cash flow predictions, and business health insights
 */
export function useFinancialAnalysis(): {
  data: AIAnalysisState['data'];
  loading: boolean;
  error: string | null;
  confidence: number;
  lastUpdated: string | null;
  analyzeFinancials: (request: FinancialAnalysisRequest) => Promise<unknown>;
  clearAnalysis: () => void;
} {
  const [state, setState] = useState<AIAnalysisState>({
    data: null,
    loading: false,
    error: null,
    confidence: 0,
    lastUpdated: null
  })

  const analyzeFinancials = useCallback(async (request: FinancialAnalysisRequest): Promise<unknown> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/ai/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        credentials: 'include', // Include cookies for authentication
      })

      const result = await response.json() as { error?: string }

      if (!response.ok) {
        throw new Error(result.error ?? 'Failed to analyze financials')
      }

      setState({
        data: result,
        loading: false,
        error: null,
        confidence: 0.88,
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
    analyzeFinancials,
    clearAnalysis
  }
}
