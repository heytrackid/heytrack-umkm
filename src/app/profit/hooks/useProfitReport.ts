import { useCallback, useEffect, useMemo, useState } from 'react'

import type {
    ChartDataPoint,
    ProfitData,
    ProfitPeriodType
} from '@/app/profit/constants'

import { calculateProfitDateRange, exportProfitReport, prepareProductChartData, validateProfitData } from '@/app/profit/utils'
import { useToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'


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
    setLoading(true)
    setError(null)

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

       const data = await response.json() as unknown as ProfitData

       if (!validateProfitData(data)) {
        throw new Error('Data laporan laba tidak valid')
       }

       setProfitData(data)
     } catch (error) {
       apiLogger.error({ error }, 'Error fetching profit data:')
       setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data')
     }
  }, [selectedPeriod, startDate, endDate])

  // Handle export report
  const exportReport = (format: 'csv' | 'pdf' | 'xlsx') => {
    if (!profitData) {return Promise.resolve()}

    try {
      const filename = `laporan-laba-${new Date().toISOString().split('T')[0]}.${format}`
      exportProfitReport(profitData, format, filename)
      return Promise.resolve()
     } catch (error) {
       const caughtError = error as Error
       apiLogger.error({ error: caughtError.message }, 'Error exporting report:')
       toast({
         title: 'Gagal',
         description: 'Gagal mengekspor laporan',
         variant: 'destructive',
       })
       return Promise.reject(caughtError)
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
