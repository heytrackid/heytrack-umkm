import { useToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
    ChartDataPoint,
    ProfitData,
    ProfitPeriodType
} from '../constants'
import { calculateProfitDateRange, exportProfitReport, prepareProductChartData, validateProfitData } from '../utils'

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
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profitData, setProfitData] = useState<ProfitData | null>(null)

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState<ProfitPeriodType>('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Fetch profit data
  const fetchProfitData = useCallback(async () => {
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
  }, [selectedPeriod, startDate, endDate])

  // Handle export report
  const exportReport = (format: 'csv' | 'pdf' | 'xlsx') => {
    if (!profitData) {return Promise.resolve()}

    try {
      const filename = `laporan-laba-${new Date().toISOString().split('T')[0]}.${format}`
      exportProfitReport(profitData, format, filename)
      return Promise.resolve()
    } catch (err: unknown) {
      const error = err as Error
      apiLogger.error({ error: error.message }, 'Error exporting report:')
      toast({
        title: 'Gagal',
        description: 'Gagal mengekspor laporan',
        variant: 'destructive',
      })
      return Promise.reject(error)
    }
  }

  // Computed values
  const products = useMemo(() => profitData?.products ?? [], [profitData])
  const ingredients = useMemo(() => profitData?.ingredients ?? [], [profitData])
  const operatingExpenses = useMemo(() => profitData?.operating_expenses ?? [], [profitData])
  const summary = useMemo(() => profitData?.summary ?? null, [profitData])
  const trends = useMemo(() => profitData?.trends ?? null, [profitData])
  const productChartData = useMemo(() => prepareProductChartData(products), [products])

  // Load data on mount and when filters change
  useEffect(() => {
    void fetchProfitData()
  }, [selectedPeriod, startDate, endDate, fetchProfitData])

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
