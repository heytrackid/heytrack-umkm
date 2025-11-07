import { useState, useEffect, useMemo, useCallback } from 'react'

import { apiLogger } from '@/lib/logger'

import type { 
  Transaction, 
  CashFlowSummary, 
  CashFlowData, 
  PeriodType, 
  TransactionFormData,
  ChartDataPoint 
} from '../constants'

interface ComparisonData {
  income: number
  expense: number
  net: number
}

interface CashFlowResponse extends CashFlowData {
  comparison?: {
    previous_period?: {
      total_income: number
      total_expenses: number
      net_cash_flow: number
    }
  }
}

interface UseEnhancedCashFlowReturn {
  // State
  loading: boolean
  error: string | null
  cashFlowData: CashFlowData | null
  comparison: ComparisonData | null

  // Filters
  selectedPeriod: PeriodType
  startDate: string
  endDate: string

  // Transaction form
  isAddDialogOpen: boolean
  transactionType: 'expense' | 'income'

  // Computed data
  chartData: ChartDataPoint[]
  transactions: Transaction[]
  summary: CashFlowData['summary'] | null

  // Actions
  setSelectedPeriod: (period: PeriodType) => void
  setStartDate: (date: string) => void
  setEndDate: (date: string) => void
  setIsAddDialogOpen: (open: boolean) => void
  setTransactionType: (type: 'expense' | 'income') => void

  // API methods
  fetchCashFlowData: () => Promise<void>
  handleAddTransaction: (formData: TransactionFormData) => Promise<void>
  handleDeleteTransaction: (transaction: Transaction) => Promise<void>
  refreshData: () => Promise<void>
}

// Utility: Calculate date range
function calculateDateRange(period: PeriodType, startDate?: string, endDate?: string): { startDate: string | undefined; endDate: string } {
  const today = new Date()
  let calculatedStartDate = startDate
  const calculatedEndDate = endDate ?? today.toISOString().split('T')[0]

  if (!startDate) {
    if (period === 'week') {
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      calculatedStartDate = weekAgo.toISOString().split('T')[0]
    } else if (period === 'month') {
      calculatedStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    } else if (period === 'year') {
      calculatedStartDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
    }
  }

  return { startDate: calculatedStartDate, endDate: calculatedEndDate }
}

// Utility: Prepare chart data
function prepareChartData(transactions: Transaction[]): ChartDataPoint[] {
  if (!transactions || transactions.length === 0) {return []}

  const dataByDate: Record<string, { date: string; income: number; expense: number; net: number }> = {}

  transactions.forEach(transaction => {
    const date = new Date(transaction.date).toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short' 
    })

    dataByDate[date] ??= { date, income: 0, expense: 0, net: 0 }

    if (transaction['type'] === 'income') {
      dataByDate[date].income += transaction.amount
    } else {
      dataByDate[date].expense += transaction.amount
    }
    dataByDate[date].net = dataByDate[date].income - dataByDate[date].expense
  })

  return Object.values(dataByDate)
    .sort((a, b) => {
      // Sort by actual date, not string
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateA.getTime() - dateB.getTime()
    })
    .slice(-30) // Show last 30 data points
}



// Utility: Calculate comparison with previous period
function calculateComparison(
  currentSummary: CashFlowSummary,
  previousSummary: CashFlowSummary | null
): ComparisonData | null {
  if (!previousSummary) {return null}

  const incomeChange = previousSummary.total_income > 0
    ? ((currentSummary.total_income - previousSummary.total_income) / previousSummary.total_income) * 100
    : 0

  const expenseChange = previousSummary.total_expenses > 0
    ? ((currentSummary.total_expenses - previousSummary.total_expenses) / previousSummary.total_expenses) * 100
    : 0

  const netChange = previousSummary.net_cash_flow !== 0
    ? ((currentSummary.net_cash_flow - previousSummary.net_cash_flow) / Math.abs(previousSummary.net_cash_flow)) * 100
    : 0

  return {
    income: incomeChange,
    expense: expenseChange,
    net: netChange
  }
}

export function useEnhancedCashFlow(): UseEnhancedCashFlowReturn {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cashFlowData, setCashFlowData] = useState<CashFlowData | null>(null)
  const [comparison, setComparison] = useState<ComparisonData | null>(null)

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Transaction form
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense')

  // Fetch cash flow data
  const fetchCashFlowData = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const { startDate: calculatedStartDate, endDate: calculatedEndDate } = calculateDateRange(
        selectedPeriod,
        startDate,
        endDate
      )

      const params = new URLSearchParams()
      if (calculatedStartDate) {params.append('start_date', calculatedStartDate)}
      if (calculatedEndDate) {params.append('end_date', calculatedEndDate)}
      params.append('compare', 'true') // Always fetch comparison data

      const response = await fetch(`/api/reports/cash-flow?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Gagal mengambil data arus kas')
      }

       
      const data: CashFlowResponse = await response.json()
      setCashFlowData(data)

      // Calculate comparison if previous period data exists
      if (data.comparison?.previous_period) {
        const comp = calculateComparison(data.summary, {
          total_income: data.comparison.previous_period.total_income,
          total_expenses: data.comparison.previous_period.total_expenses,
          net_cash_flow: data.comparison.previous_period.net_cash_flow,
          income_by_category: {},
          expenses_by_category: {}
        })
        setComparison(comp)
      } else {
        setComparison(null)
      }
    } catch (error) {
      apiLogger.error({ error }, 'Error fetching cash flow data')
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data')
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod, startDate, endDate])

  // Handle add transaction
  const handleAddTransaction = useCallback(async (formData: TransactionFormData): Promise<void> => {
    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Jumlah tidak valid')
    }

    try {
      setLoading(true)

      // Map to financial_records table directly
      const response = await fetch('/api/financial/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description,
          category: formData.category,
          amount,
          date: formData.date,
          type: transactionType,
          source: 'manual_entry'
        })
      })

       if (!response.ok) {
          
         const errorData = await response.json()
          
         throw new Error(errorData.error ?? 'Gagal menyimpan transaksi')
       }

       setIsAddDialogOpen(false)
       await fetchCashFlowData()
     } catch (error) {
       apiLogger.error({ error }, 'Error adding transaction')
       throw error
    } finally {
      setLoading(false)
    }
  }, [transactionType, fetchCashFlowData])

  // Handle delete transaction
  const handleDeleteTransaction = useCallback(async (transaction: Transaction): Promise<void> => {
    try {
      setLoading(true)

      // Use transaction['id'] as the reference_id
      const recordId = transaction.reference_id ?? transaction['id']
      
      const response = await fetch(`/api/financial/records/${recordId}`, {
        method: 'DELETE'
      })

       if (!response.ok) {
          
         const errorData = await response.json()
          
         throw new Error(errorData.error ?? 'Gagal menghapus transaksi')
       }

       await fetchCashFlowData()
     } catch (error) {
       apiLogger.error({ error }, 'Error deleting transaction')
       throw error
    } finally {
      setLoading(false)
    }
  }, [fetchCashFlowData])



  // Refresh data
  const refreshData = useCallback(async (): Promise<void> => {
    await fetchCashFlowData()
  }, [fetchCashFlowData])

  // Computed values
  const transactions = useMemo(() => cashFlowData?.transactions ?? [], [cashFlowData])
  const summary = useMemo(() => cashFlowData?.summary ?? null, [cashFlowData])
  const chartData = useMemo(() => prepareChartData(transactions), [transactions])

  // Load data on mount and when filters change
  useEffect(() => {
    void fetchCashFlowData()
  }, [fetchCashFlowData])

  return {
    // State
    loading,
    error,
    cashFlowData,
    comparison,

    // Filters
    selectedPeriod,
    startDate,
    endDate,

    // Transaction form
    isAddDialogOpen,
    transactionType,

    // Computed data
    chartData,
    transactions,
    summary,

    // Actions
    setSelectedPeriod,
    setStartDate,
    setEndDate,
    setIsAddDialogOpen,
    setTransactionType,

    // API methods
    fetchCashFlowData,
    handleAddTransaction,
    handleDeleteTransaction,
    refreshData
  }
}
