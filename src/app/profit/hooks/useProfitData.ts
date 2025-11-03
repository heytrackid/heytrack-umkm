import { useState, useEffect } from 'react'
import { apiLogger } from '@/lib/logger'
import { useToast } from '@/hooks/use-toast'
import type { ProfitData, ProfitFilters, ExportFormat } from '@/app/profit/components/types'

/**
 * Profit Data Hook
 * Custom hook for managing profit report data fetching and state
 */


export function useProfitData() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profitData, setProfitData] = useState<ProfitData | null>(null)

  const [filters, setFilters] = useState<ProfitFilters>({
    selectedPeriod: 'month',
    startDate: '',
    endDate: ''
  })

  const updateFilters = (newFilters: Partial<ProfitFilters>) => {
    const sanitizedEntries = Object.entries(newFilters).filter(([, value]) => value !== undefined)
    const sanitizedFilters = Object.fromEntries(sanitizedEntries) as Partial<ProfitFilters>
    setFilters(prev => ({ ...prev, ...sanitizedFilters }))
  }

  useEffect(() => {
    void fetchProfitData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.selectedPeriod, filters.startDate, filters.endDate])

  const fetchProfitData = async () => {
    void setLoading(true)
    void setError(null)

    try {
      // Calculate date range based on period
      const today = new Date()
      const toISODate = (date: Date): string => date.toISOString().split('T')[0]
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

      const params = new URLSearchParams()
      if (calculatedStartDate) {params.append('start_date', calculatedStartDate)}
      if (calculatedEndDate) {params.append('end_date', calculatedEndDate)}

      const response = await fetch(`/api/reports/profit?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Gagal mengambil data laporan laba')
      }

      const data = await response.json()
      void setProfitData(data)
    } catch (err: unknown) {
      apiLogger.error({ error: err }, 'Error fetching profit data:')
      void setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data')
    } finally {
      void setLoading(false)
    }
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
      a.download = `laporan-laba-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: unknown) {
      const error = err as Error
      apiLogger.error({ error }, 'Error exporting report:')
      toast({
        title: 'Gagal',
        description: 'Gagal mengekspor laporan',
        variant: 'destructive',
      })
    }
  }

  return {
    loading,
    error,
    profitData,
    filters,
    updateFilters,
    refetch: fetchProfitData,
    exportReport
  }
}
