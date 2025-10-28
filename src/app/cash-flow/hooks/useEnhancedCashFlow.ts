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
  transactionType: 'income' | 'expense'

  // Computed data
  chartData: ChartDataPoint[]
  transactions: Transaction[]
  summary: CashFlowData['summary'] | null

  // Actions
  setSelectedPeriod: (period: PeriodType) => void
  setStartDate: (date: string) => void
  setEndDate: (date: string) => void
  setIsAddDialogOpen: (open: boolean) => void
  setTransactionType: (type: 'income' | 'expense') => void

  // API methods
  fetchCashFlowData: () => Promise<void>
  handleAddTransaction: (formData: TransactionFormData) => Promise<void>
  handleDeleteTransaction: (transaction: Transaction) => Promise<void>
  exportReport: (format: 'csv' | 'excel') => Promise<void>
  refreshData: () => Promise<void>
}

// Utility: Calculate date range
function calculateDateRange(period: PeriodType, startDate?: string, endDate?: string) {
  const today = new Date()
  let calculatedStartDate = startDate
  const calculatedEndDate = endDate || today.toISOString().split('T')[0]

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
  if (!transactions || transactions.length === 0) return []

  const dataByDate: Record<string, { date: string; income: number; expense: number; net: number }> = {}

  transactions.forEach(transaction => {
    const date = new Date(transaction.date).toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short' 
    })

    if (!dataByDate[date]) {
      dataByDate[date] = { date, income: 0, expense: 0, net: 0 }
    }

    if (transaction.type === 'income') {
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

// Utility: Export to CSV
function exportToCSV(data: CashFlowData, filename: string) {
  const headers = ['Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Jumlah']
  const rows = data.transactions.map(transaction => [
    new Date(transaction.date).toLocaleDateString('id-ID'),
    `"${transaction.description.replace(/"/g, '""')}"`, // Escape quotes
    transaction.category,
    transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    transaction.amount.toString()
  ])

  // Add summary at the end
  rows.push([])
  rows.push(['RINGKASAN'])
  rows.push(['Total Pemasukan', '', '', '', data.summary.total_income.toString()])
  rows.push(['Total Pengeluaran', '', '', '', data.summary.total_expenses.toString()])
  rows.push(['Arus Kas Bersih', '', '', '', data.summary.net_cash_flow.toString()])

  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }) // Add BOM for Excel
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Utility: Calculate comparison with previous period
function calculateComparison(
  currentSummary: CashFlowSummary,
  previousSummary: CashFlowSummary | null
): ComparisonData | null {
  if (!previousSummary) return null

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
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')

  // Fetch cash flow data
  const fetchCashFlowData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { startDate: calculatedStartDate, endDate: calculatedEndDate } = calculateDateRange(
        selectedPeriod,
        startDate,
        endDate
      )

      const params = new URLSearchParams()
      if (calculatedStartDate) params.append('start_date', calculatedStartDate)
      if (calculatedEndDate) params.append('end_date', calculatedEndDate)
      params.append('compare', 'true') // Always fetch comparison data

      const response = await fetch(`/api/reports/cash-flow?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Gagal mengambil data arus kas')
      }

      const data = await response.json()
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
    } catch (err: unknown) {
      apiLogger.error({ error: err }, 'Error fetching cash flow data')
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data')
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod, startDate, endDate])

  // Handle add transaction
  const handleAddTransaction = useCallback(async (formData: TransactionFormData) => {
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
        throw new Error(errorData.error || 'Gagal menyimpan transaksi')
      }

      setIsAddDialogOpen(false)
      await fetchCashFlowData()
    } catch (err: unknown) {
      apiLogger.error({ error: err }, 'Error adding transaction')
      throw err
    } finally {
      setLoading(false)
    }
  }, [transactionType, fetchCashFlowData])

  // Handle delete transaction
  const handleDeleteTransaction = useCallback(async (transaction: Transaction) => {
    try {
      setLoading(true)

      // Use transaction.id as the reference_id
      const recordId = transaction.reference_id || transaction.id
      
      const response = await fetch(`/api/financial/records/${recordId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal menghapus transaksi')
      }

      await fetchCashFlowData()
    } catch (err: unknown) {
      apiLogger.error({ error: err }, 'Error deleting transaction')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchCashFlowData])

  // Handle export report
  const exportReport = useCallback(async (format: 'csv' | 'excel') => {
    if (!cashFlowData) return

    try {
      const filename = `arus-kas-${new Date().toISOString().split('T')[0]}.${format}`
      
      if (format === 'csv') {
        exportToCSV(cashFlowData, filename)
      } else {
        // For Excel, we could use a library like exceljs
        // For now, fallback to CSV
        exportToCSV(cashFlowData, filename.replace('.excel', '.csv'))
      }
    } catch (err) {
      apiLogger.error({ error: err }, 'Error exporting report')
      throw new Error('Gagal mengekspor laporan')
    }
  }, [cashFlowData])

  // Refresh data
  const refreshData = useCallback(async () => {
    await fetchCashFlowData()
  }, [fetchCashFlowData])

  // Computed values
  const transactions = useMemo(() => cashFlowData?.transactions || [], [cashFlowData])
  const summary = useMemo(() => cashFlowData?.summary || null, [cashFlowData])
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
    exportReport,
    refreshData
  }
}
