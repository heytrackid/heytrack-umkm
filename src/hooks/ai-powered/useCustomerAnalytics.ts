'use client'

import { useCallback, useState } from 'react'
import { apiLogger } from '@/lib/logger'
import type { AIAnalysisState, CustomerAnalyticsRequest } from './types'

/**
 * AI-Powered Customer Analytics Hook
 * Provides intelligent customer behavior analysis, segmentation, and marketing recommendations
 */
export function useCustomerAnalytics() {
  const [state, setState] = useState<AIAnalysisState>({
    data: null,
    loading: false,
    error: null,
    confidence: 0,
    lastUpdated: null
  })

  const analyzeCustomers = useCallback(async (request: CustomerAnalyticsRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

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

      setState({
        data: result,
        loading: false,
        error: null,
        confidence: 0.85,
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
    analyzeCustomers,
    clearAnalysis
  }
}
