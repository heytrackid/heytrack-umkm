/**
 * FinanceWise AI Hook
 * React hook for accessing FinanceWise AI financial intelligence
 */

import { fetchApi, postApi } from '@/lib/query/query-helpers'
import type {
    CashFlowForecast,
    FinanceWiseResponse,
    FinancialHealth,
    FinancialSummary,
    ProfitAnalysis
} from '@/services/ai'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Query keys
export const financeWiseKeys = {
  all: ['finance-wise'] as const,
  analysis: () => [...financeWiseKeys.all, 'analysis'] as const,
  summary: (startDate?: string, endDate?: string) => 
    [...financeWiseKeys.all, 'summary', { startDate, endDate }] as const,
  health: () => [...financeWiseKeys.all, 'health'] as const,
  forecast: (months?: number) => [...financeWiseKeys.all, 'forecast', { months }] as const,
  profit: (startDate?: string, endDate?: string) => 
    [...financeWiseKeys.all, 'profit', { startDate, endDate }] as const,
}

/**
 * Hook to get complete financial analysis
 */
export function useFinanceWiseAnalysis(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: financeWiseKeys.analysis(),
    queryFn: async () => {
      const response = await fetchApi<FinanceWiseResponse>('/api/ai/finance')
      return response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    enabled: options?.enabled ?? true,
  })
}

/**
 * Hook to get financial summary for a specific period
 */
export function useFinancialSummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: financeWiseKeys.summary(startDate, endDate),
    queryFn: async () => {
      const response = await postApi<FinancialSummary>('/api/ai/finance', {
        type: 'summary',
        start_date: startDate,
        end_date: endDate,
      })
      return response
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!startDate && !!endDate,
  })
}

/**
 * Hook to get financial health analysis
 */
export function useFinancialHealth(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: financeWiseKeys.health(),
    queryFn: async () => {
      const response = await postApi<FinancialHealth>('/api/ai/finance', {
        type: 'health',
      })
      return response
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  })
}

/**
 * Hook to get cash flow forecast
 */
export function useCashFlowForecast(months: number = 3, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: financeWiseKeys.forecast(months),
    queryFn: async () => {
      const response = await postApi<CashFlowForecast[]>('/api/ai/finance', {
        type: 'forecast',
        months,
      })
      return response
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - forecasts change less frequently
    enabled: options?.enabled ?? true,
  })
}

/**
 * Hook to get profit analysis by product
 */
export function useProfitAnalysis(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: financeWiseKeys.profit(startDate, endDate),
    queryFn: async () => {
      const response = await postApi<ProfitAnalysis>('/api/ai/finance', {
        type: 'profit',
        start_date: startDate,
        end_date: endDate,
      })
      return response
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!startDate && !!endDate,
  })
}

/**
 * Hook to manually trigger financial analysis
 */
export function useRefreshFinanceWise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (type: 'all' | 'summary' | 'health' | 'forecast' | 'profit') => {
      if (type === 'all') {
        return fetchApi<FinanceWiseResponse>('/api/ai/finance')
      }
      return postApi('/api/ai/finance', { type })
    },
    onSuccess: () => {
      // Invalidate all finance-wise queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: financeWiseKeys.all })
    },
  })
}

/**
 * Combined hook for FinanceWise dashboard
 * Returns all financial data needed for a dashboard view
 */
export function useFinanceWiseDashboard() {
  const analysisQuery = useFinanceWiseAnalysis()
  const refreshMutation = useRefreshFinanceWise()

  return {
    // Data
    data: analysisQuery.data,
    summary: analysisQuery.data?.summary,
    health: analysisQuery.data?.health,
    forecast: analysisQuery.data?.forecast,
    profitAnalysis: analysisQuery.data?.profitAnalysis,
    aiInsights: analysisQuery.data?.aiInsights,

    // Status
    isLoading: analysisQuery.isLoading,
    isError: analysisQuery.isError,
    error: analysisQuery.error,
    isFetching: analysisQuery.isFetching,

    // Actions
    refresh: () => refreshMutation.mutate('all'),
    isRefreshing: refreshMutation.isPending,
  }
}
