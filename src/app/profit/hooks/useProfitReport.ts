import { useState, useEffect, useMemo } from 'react'
import { apiLogger } from '@/lib/logger'
import type {
  ProfitData,
  ProfitPeriodType,
  ChartDataPoint
} from '../constants'
import {
  calculateProfitDateRange,
  prepareProductChartData,
  validateProfitData,
  exportProfitReport
} from '../utils'

interface UseProfitReportReturn {
  // State
  loading: boolean
  error: string | null
  profitData: ProfitData | null

  // Filters
  selectedPeriod: ProfitPeriodType
  startDate: string
  endDate: string

  // Computed data
  productChartData: ChartDataPoint[]
  products: ProfitData['products']
  ingredients: ProfitData['ingredients']
  operatingExpenses: ProfitData['operating_expenses']
  summary: ProfitData['summary'] | null
  trends: ProfitData['trends'] | null

  // Actions
  setSelectedPeriod: (period: ProfitPeriodType) => void
  setStartDate: (date: string) => void
  setEndDate: (date: string) => void

  // API methods
  fetchProfitData: () => Promise<void>
  exportReport: (format: 'csv' | 'pdf' | 'xlsx') => Promise<void>
}

export function useProfitReport(): UseProfitReportReturn {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profitData, setProfitData] = useState<ProfitData | null>(null)

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState<ProfitPeriodType>('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Fetch profit data
  const fetchProfitData = async () => {
    void setLoading(true)
    void setError(null)

    try {
      const { startDate: calculatedStartDate, endDate: calculatedEndDate } = calculateProfitDateRange(
        selectedPeriod,
        startDate,
        endDate
      )

      const params = new URLSearchParams()
      if (calculatedStartDate) {params.append('start_date', calculatedStartDate)}
      if (calculatedEndDate) {params.append('end_date', calculatedEndDate)}

      const response = await fetch(`/api/reports/profit?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Gagal mengambil data laporan laba')
      }

      const data = await response.json()

      if (!validateProfitData(data)) {
        throw new Error('Data laporan laba tidak valid')
      }

      void setProfitData(data)
    } catch (err: unknown) {
      apiLogger.error({ error: err }, 'Error fetching profit data:')
      void setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data')
    } finally {
      void setLoading(false)
    }
  }

  // Handle export report
  const exportReport = async (format: 'csv' | 'pdf' | 'xlsx') => {
    if (!profitData) {return}

    try {
      const filename = `laporan-laba-${new Date().toISOString().split('T')[0]}.${format}`
      exportProfitReport(profitData, format, filename)
    } catch (_err) {
      apiLogger.error({ error: err }, 'Error exporting report:')
      alert('Gagal mengekspor laporan')
    }
  }

  // Computed values
  const products = profitData?.products || []
  const ingredients = profitData?.ingredients || []
  const operatingExpenses = profitData?.operating_expenses || []
  const summary = profitData?.summary || null
  const trends = profitData?.trends || null
  const productChartData = useMemo(() => prepareProductChartData(products), [products])

  // Load data on mount and when filters change
  useEffect(() => {
    void fetchProfitData()
  }, [selectedPeriod, startDate, endDate])

  return {
    // State
    loading,
    error,
    profitData,

    // Filters
    selectedPeriod,
    startDate,
    endDate,

    // Computed data
    productChartData,
    products,
    ingredients,
    operatingExpenses,
    summary,
    trends,

    // Actions
    setSelectedPeriod,
    setStartDate,
    setEndDate,

    // API methods
    fetchProfitData,
    exportReport
  }
}
