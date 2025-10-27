/**
 * Profit Data Hook
 * Custom hook for managing profit report data fetching and state
 */

import { useState, useEffect } from 'react'
import { apiLogger } from '@/lib/logger'
import type { ProfitData, ProfitFilters, ExportFormat, PeriodType } from '@/app/profit/components/types'

export function useProfitData() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profitData, setProfitData] = useState<ProfitData | null>(null)

  const [filters, setFilters] = useState<ProfitFilters>({
    selectedPeriod: 'month',
    startDate: '',
    endDate: ''
  })

  const updateFilters = (newFilters: Partial<ProfitFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  useEffect(() => {
    void fetchProfitData()
  }, [filters.selectedPeriod, filters.startDate, filters.endDate])

  const fetchProfitData = async () => {
    void setLoading(true)
    void setError(null)

    try {
      // Calculate date range based on period
      const today = new Date()
      let calculatedStartDate = filters.startDate
      const calculatedEndDate = filters.endDate || today.toISOString().split('T')[0]

      if (!filters.startDate) {
        if (filters.selectedPeriod === 'week') {
          calculatedStartDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0]
        } else if (filters.selectedPeriod === 'month') {
          calculatedStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
        } else if (filters.selectedPeriod === 'quarter') {
          const quarter = Math.floor(today.getMonth() / 3)
          calculatedStartDate = new Date(today.getFullYear(), quarter * 3, 1).toISOString().split('T')[0]
        } else if (filters.selectedPeriod === 'year') {
          calculatedStartDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
        } else {
          // Default fallback for any other period
          calculatedStartDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0]
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
    } catch (err) {
      apiLogger.error({ error: err }, 'Error exporting report:')
      alert('Gagal mengekspor laporan')
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
