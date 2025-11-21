import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import type {
    ChartDataPoint,
    ProfitData,
    ProfitPeriodType
} from '@/app/profit/constants'

import { calculateProfitDateRange, exportProfitReport, prepareProductChartData, validateProfitData } from '@/app/profit/utils'
import { useToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'
import { buildApiUrl } from '@/lib/query/query-helpers'
import { cachePresets } from '@/lib/query/query-config'


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
  refetch: () => void
  exportReport: (format: 'csv' | 'pdf' | 'xlsx') => Promise<void>
}

export function useProfitReport(): UseProfitReportReturn {
  const { toast } = useToast()

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState<ProfitPeriodType>('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Calculate date range
  const { startDate: calculatedStartDate, endDate: calculatedEndDate } = useMemo(
    () => calculateProfitDateRange(selectedPeriod, startDate, endDate),
    [selectedPeriod, startDate, endDate]
  )

  // ✅ Use React Query instead of manual fetch
  const { data: profitData, isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['reports', 'profit', { selectedPeriod, startDate: calculatedStartDate, endDate: calculatedEndDate }],
    queryFn: async () => {
      const url = buildApiUrl('/reports/profit', {
        start_date: calculatedStartDate,
        end_date: calculatedEndDate
      })

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Gagal mengambil data laporan laba')
      }

      const data = await response.json() as unknown as ProfitData

      if (!validateProfitData(data)) {
        throw new Error('Data laporan laba tidak valid')
      }

      return data
    },
    ...cachePresets.analytics, // 5min stale, 20min gc
    enabled: !!(calculatedStartDate && calculatedEndDate)
  })

  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Terjadi kesalahan saat mengambil data') : null

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

  return {
    // State
    loading,
    error,
    profitData: profitData ?? null,

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
    refetch: () => { void refetch() },
    exportReport
  }
}
