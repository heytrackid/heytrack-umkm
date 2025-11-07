import { useState } from 'react'
import useSWR from 'swr'

import { useToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'

import type { ProfitData, ProfitFilters, ExportFormat } from '@/app/profit/components/types'

/**
 * Profit Data Hook with SWR Caching
 * Custom hook for managing profit report data fetching and state with caching
 */


export function useProfitData() {
  const { toast } = useToast()
  
  const [filters, setFilters] = useState<ProfitFilters>({
    selectedPeriod: 'month',
    startDate: '',
    endDate: ''
  })

  // Calculate date range for SWR key
  const getCalculatedDates = () => {
    const today = new Date()
    const toISODate = (date: Date): string => date.toISOString().substring(0, 10)
    const subtractDays = (date: Date, days: number) => {
      const clone = new Date(date.getTime())
      clone.setDate(clone.getDate() - days)
      return clone
    }

    let calculatedStartDate: string = filters.startDate || ''
    const calculatedEndDate: string = filters.endDate || toISODate(today)

    if (!filters.startDate) {
      switch (filters.selectedPeriod) {
        case 'week':
          calculatedStartDate = toISODate(subtractDays(today, 7))
          break
        case 'month':
          calculatedStartDate = toISODate(new Date(today.getFullYear(), today.getMonth(), 1))
          break
        case 'quarter': {
          const quarter = Math.floor(today.getMonth() / 3)
          calculatedStartDate = toISODate(new Date(today.getFullYear(), quarter * 3, 1))
          break
        }
        case 'year':
          calculatedStartDate = toISODate(new Date(today.getFullYear(), 0, 1))
          break
        default:
          calculatedStartDate = toISODate(subtractDays(today, 30))
      }
    }

    return { calculatedStartDate, calculatedEndDate }
  }

  // Get dates for the SWR key
  const { calculatedStartDate, calculatedEndDate } = getCalculatedDates()

  // SWR key and fetcher
  const swrKey = calculatedStartDate && calculatedEndDate 
    ? [`/api/reports/profit?start_date=${calculatedStartDate}&end_date=${calculatedEndDate}`]
    : null

  const { data: profitData, error, mutate, isLoading } = useSWR<ProfitData>(
    swrKey,
    async (url: string) => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Gagal mengambil data laporan laba')
      }
      return await response.json() as ProfitData
    },
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
      const params = new URLSearchParams()
      if (filters.startDate) {params.append('start_date', filters.startDate)}
      if (filters.endDate) {params.append('end_date', filters.endDate)}
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
