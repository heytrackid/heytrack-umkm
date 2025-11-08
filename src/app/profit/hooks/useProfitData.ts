import { useState } from 'react'
import useSWR from 'swr'

import type { ProfitData, ProfitFilters, ExportFormat } from '@/app/profit/components/types'
import { useToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'


/**
 * Profit Data Hook with SWR Caching
 * Custom hook for managing profit report data fetching and state with caching
 */


export function useProfitData() {
  const { toast } = useToast()
  
  const [filters, setFilters] = useState<ProfitFilters>({
    selectedPeriod: 'month'
  })

  // Calculate date range for SWR key
  const getCalculatedDates = () => {
    const today = new Date()
    const toISODate = (date: Date): string => date.toISOString().substring(0, 10)

    // If custom dateRange is set, use it
    if (filters.dateRange?.from && filters.dateRange?.to) {
      return {
        calculatedStartDate: toISODate(filters.dateRange.from),
        calculatedEndDate: toISODate(filters.dateRange.to)
      }
    }

    // Otherwise, calculate based on selectedPeriod
    switch (filters.selectedPeriod) {
      case 'week': {
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay() + 1) // Monday
        return {
          calculatedStartDate: toISODate(weekStart),
          calculatedEndDate: toISODate(today)
        }
      }
      case 'month': {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        return {
          calculatedStartDate: toISODate(monthStart),
          calculatedEndDate: toISODate(today)
        }
      }
      case 'quarter': {
        const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3
        const quarterStart = new Date(today.getFullYear(), quarterStartMonth, 1)
        return {
          calculatedStartDate: toISODate(quarterStart),
          calculatedEndDate: toISODate(today)
        }
      }
      case 'year': {
        const yearStart = new Date(today.getFullYear(), 0, 1)
        return {
          calculatedStartDate: toISODate(yearStart),
          calculatedEndDate: toISODate(today)
        }
      }
      default: {
        // Default to last 30 days
        const thirtyDaysAgo = new Date(today)
        thirtyDaysAgo.setDate(today.getDate() - 30)
        return {
          calculatedStartDate: toISODate(thirtyDaysAgo),
          calculatedEndDate: toISODate(today)
        }
      }
    }
  }

  // Get dates for the SWR key
  const { calculatedStartDate, calculatedEndDate } = getCalculatedDates()

   // SWR key and fetcher
   const swrKey = calculatedStartDate && calculatedEndDate
     ? [`/api/reports/profit?start_date=${calculatedStartDate}&end_date=${calculatedEndDate}`]
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
    refetch: () => mutate(),
    exportReport
  }
}
