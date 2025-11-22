import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import type { ExportFormat, ProfitData, ProfitFilters } from '@/app/profit/components/types'

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
      selectedPeriod: 'month'
    }
  })

  const selectedPeriod = filters.selectedPeriod ?? 'month'

  const swrKey = `/api/reports/profit?period=${selectedPeriod}`

   const fetchProfitData = async (url: string): Promise<ProfitData> => {
     const response = await fetch(url)
     if (!response.ok) {
       const errorData = await response.json().catch(() => ({}))
       const errorMessage = (errorData as { error?: string }).error || 'Gagal mengambil data laporan laba'
       throw new Error(errorMessage)
     }
     const result = await response.json() as { success?: boolean; data?: ProfitData }
     // API returns {success: true, data: ProfitData}
     if (result.success && result.data) {
       return result.data
     }
     // Fallback for unwrapped responses
     return result as unknown as ProfitData
   }

    
    const { data: profitData, error, refetch, isLoading } = useQuery<ProfitData>({
      queryKey: ['profit', selectedPeriod],
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
