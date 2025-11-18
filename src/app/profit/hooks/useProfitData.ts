import { useState } from 'react'
import useSWR from 'swr'

import type { ProfitData, ProfitFilters, ExportFormat } from '@/app/profit/components/types'
import { useToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'
import { calculateProfitDateRange } from '@/app/profit/utils'


/**
 * Profit Data Hook with SWR Caching
 * Custom hook for managing profit report data fetching and state with caching
 */


export function useProfitData() {
  const { toast } = useToast()
  
  const [filters, setFilters] = useState<ProfitFilters>(() => {
    const defaultRange = calculateProfitDateRange('month')
    return {
      selectedPeriod: 'month',
      startDate: defaultRange.startDate,
      endDate: defaultRange.endDate
    }
  })

  const getCalculatedDates = () => {
    const toISODate = (date: Date): string => date.toISOString().substring(0, 10)

    if (filters.startDate && filters.endDate) {
      return {
        calculatedStartDate: filters.startDate,
        calculatedEndDate: filters.endDate
      }
    }

    if (filters.dateRange?.from && filters.dateRange?.to) {
      return {
        calculatedStartDate: toISODate(filters.dateRange.from),
        calculatedEndDate: toISODate(filters.dateRange.to)
      }
    }

    const derivedRange = calculateProfitDateRange(filters.selectedPeriod ?? 'month')
    return {
      calculatedStartDate: derivedRange.startDate ?? toISODate(new Date()),
      calculatedEndDate: derivedRange.endDate ?? toISODate(new Date())
    }
  }

  const { calculatedStartDate: baseStartDate, calculatedEndDate: baseEndDate } = getCalculatedDates()

  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const urlFrom = urlParams?.get('from')?.slice(0, 10) || undefined
  const urlTo = urlParams?.get('to')?.slice(0, 10) || undefined
  const calculatedStartDate = urlFrom ?? baseStartDate
  const calculatedEndDate = urlTo ?? baseEndDate
  const selectedPeriod = filters.selectedPeriod ?? 'month'

   const swrKey = calculatedStartDate && calculatedEndDate
     ? [`/api/reports/profit?start_date=${calculatedStartDate}&end_date=${calculatedEndDate}&period=${selectedPeriod}`]
     : null

   const fetchProfitData = async (url: string): Promise<ProfitData> => {
     const response = await fetch(url)
     if (!response.ok) {
       throw new Error('Gagal mengambil data laporan laba')
     }
     return await response.json() as ProfitData
   }

    
   const { data: profitData, error, mutate, isLoading } = useSWR<ProfitData>(
     swrKey,
     fetchProfitData,
     {
       revalidateOnFocus: false,
       revalidateOnReconnect: true,
       errorRetryCount: 3,
       refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
     }
   )

  const updateFilters = (newFilters: Partial<ProfitFilters>) => {
    const sanitizedEntries = Object.entries(newFilters).filter(([, value]) => value !== undefined)
    const sanitizedFilters = Object.fromEntries(sanitizedEntries) as Partial<ProfitFilters>
    setFilters(prev => ({ ...prev, ...sanitizedFilters }))
  }

  const exportReport = async (format: ExportFormat) => {
    try {
      const { calculatedStartDate, calculatedEndDate } = getCalculatedDates()
      const params = new URLSearchParams()
      params.append('start_date', calculatedStartDate)
      params.append('end_date', calculatedEndDate)
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
    refetch: () => { void mutate() },
    exportReport
  }
}
