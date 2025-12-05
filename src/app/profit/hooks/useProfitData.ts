import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useState } from 'react'

import type { ExportFormat, ProfitData, ProfitFilters } from '@/app/profit/components/types'
import type { ProfitReport } from '@/services/reports/ReportService'

import { useToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'


/**
 * Profit Data Hook with React Query Caching
 * Custom hook for managing profit report data fetching and state with caching
 */


export function useProfitData() {
  const { toast } = useToast()
  
  const [filters, setFilters] = useState<ProfitFilters>(() => {
    return {
      selectedPeriod: 'month',
      dateRange: undefined
    }
  })

  const selectedPeriod = filters.selectedPeriod ?? 'month'

  // Build API URL with optional date range parameters
  const buildApiUrl = () => {
    const params = new URLSearchParams()
    params.append('period', selectedPeriod)
    
    if (filters.dateRange?.from) {
      params.append('start_date', format(filters.dateRange.from, 'yyyy-MM-dd'))
    }
    if (filters.dateRange?.to) {
      params.append('end_date', format(filters.dateRange.to, 'yyyy-MM-dd'))
    }
    
    return `/api/reports/profit?${params.toString()}`
  }

  const swrKey = buildApiUrl()

   const fetchProfitData = async (url: string): Promise<ProfitData> => {
     const response = await fetch(url)
     if (!response.ok) {
       const errorData = await response.json().catch(() => ({}))
       const errorMessage = (errorData as { error?: string }).error || 'Gagal mengambil data laporan laba'
       throw new Error(errorMessage)
     }
      const result = await response.json() as { success?: boolean; data?: ProfitReport }
      // API returns {success: true, data: ProfitReport}
      if (result.success && result.data) {
        const apiData = result.data

        // Calculate missing margins
        const totalRevenue = apiData.summary.totalRevenue
        const grossProfit = apiData.summary.grossProfit
        const netProfit = apiData.summary.netProfit

        const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
        const netProfitMargin = apiData.summary.profitMargin // This is already net profit margin

        const transformedData: ProfitData = {
          summary: {
            total_revenue: totalRevenue,
            total_cogs: apiData.summary.totalCOGS,
            gross_profit: grossProfit,
            gross_profit_margin: grossProfitMargin,
            total_operating_expenses: apiData.summary.totalOperatingExpenses,
            net_profit: netProfit,
            net_profit_margin: netProfitMargin,
          },
          products: (apiData.productProfitability || []).map(p => ({
            product_name: p.product_name,
            quantity_sold: p.total_quantity,
            revenue: p.total_revenue,
            cogs: p.total_cogs,
            profit: p.gross_profit,
            profit_margin: p.gross_margin,
          })),
          ingredients: [], // TODO: Implement ingredient cost tracking in API
          operating_expenses: (apiData.operating_expenses_breakdown || []).map(e => ({
            category: e.category,
            total_amount: e.total,
          })),
          trends: apiData.trends,
        }

        return transformedData
      }
      // Fallback for unwrapped responses
      return result as unknown as ProfitData
   }

    
    const { data: profitData, error, refetch, isLoading } = useQuery<ProfitData>({
      queryKey: ['profit', selectedPeriod, filters.dateRange?.from?.toISOString(), filters.dateRange?.to?.toISOString()],
      queryFn: () => fetchProfitData(swrKey),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
      refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    })

  const updateFilters = (newFilters: Partial<ProfitFilters>) => {
    const sanitizedEntries = Object.entries(newFilters).filter(([, value]) => value !== undefined)
    const sanitizedFilters = Object.fromEntries(sanitizedEntries) as Partial<ProfitFilters>
    setFilters(prev => ({ ...prev, ...sanitizedFilters }))
  }

  const exportReport = async (format: ExportFormat) => {
    try {
      const params = new URLSearchParams()
      params.append('period', selectedPeriod)
      params.append('export', format)

      const response = await fetch(`/api/reports/profit?${params.toString()}`)
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan-laba-${new Date().toISOString().substring(0, 10)}.${format}`
      document['body'].appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document['body'].removeChild(a)
     } catch (error) {
       const caughtError = error as Error
       apiLogger.error({ error: caughtError }, 'Error exporting report:')
       toast({
        title: 'Gagal',
        description: 'Gagal mengekspor laporan',
        variant: 'destructive',
      })
    }
  }

  return {
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    profitData: profitData ?? null,
    filters,
    updateFilters,
    refetch: () => { void refetch() },
    exportReport
  }
}
