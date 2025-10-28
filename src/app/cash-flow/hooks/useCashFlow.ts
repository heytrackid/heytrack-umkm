import { useState, useEffect, useMemo } from 'react'

import { apiLogger } from '@/lib/logger'
// Types and constants embedded in hook file for now
export interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: 'income' | 'expense'
  reference_id?: string
}

export interface CashFlowSummary {
  total_income: number
  total_expenses: number
  net_cash_flow: number
  income_by_category: Record<string, number>
  expenses_by_category: Record<string, number>
}

export interface CashFlowData {
  summary: CashFlowSummary
  transactions: Transaction[]
}

export type PeriodType = 'week' | 'month' | 'year' | 'custom'

export interface TransactionFormData {
  description: string
  category: string
  amount: string
  date: string
}

export interface ChartDataPoint {
  date: string
  income: number
  expense: number
  net: number
}

// Constants embedded in hook
// const LOADING_KEYS = {
//   LOAD_CASHFLOW: 'loadCashFlow',
//   SAVE_TRANSACTION: 'saveTransaction'
// } as const

const incomeCategories = [
  'Penjualan Produk',
  'Jasa Catering',
  'Pre-Order',
  'Penjualan Online',
  'Event & Wedding',
  'Lainnya'
] as const

const expenseCategories = [
  'Bahan Baku',
  'Gaji Karyawan',
  'Operasional',
  'Utilities',
  'Marketing',
  'Transportasi',
  'Peralatan',
  'Sewa Tempat',
  'Lainnya'
] as const

// Utility functions embedded in hook
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

function prepareChartData(transactions: Transaction[]): ChartDataPoint[] {
  if (!transactions || transactions.length === 0) {return []}

  const dataByDate: Record<string, { date: string; income: number; expense: number; net: number }> = {}

  transactions.forEach(transaction => {
    const date = new Date(transaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })

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

  return Object.values(dataByDate).sort((a, b) => a.date.localeCompare(b.date)).slice(-14)
}

function validateTransactionForm(formData: TransactionFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!formData.description.trim()) {
    errors.push('Deskripsi transaksi wajib diisi')
  }

  if (!formData.category) {
    errors.push('Kategori wajib dipilih')
  }

  if (!formData.amount || isNaN(parseFloat(formData.amount))) {
    errors.push('Jumlah harus berupa angka yang valid')
  } else {
    const amount = parseFloat(formData.amount)
    if (amount <= 0) {
      errors.push('Jumlah harus lebih dari 0')
    }
  }

  if (!formData.date) {
    errors.push('Tanggal wajib diisi')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

function exportToCSV(data: CashFlowData, filename: string) {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount']
  const rows = data.transactions.map(transaction => [
    transaction.date,
    `"${transaction.description}"`,
    transaction.category,
    transaction.type,
    transaction.amount.toString()
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

interface UseCashFlowReturn {
  // State
  loading: boolean
  error: string | null
  cashFlowData: CashFlowData | null

  // Filters
  selectedPeriod: PeriodType
  startDate: string
  endDate: string

  // Transaction form
  isAddDialogOpen: boolean
  transactionType: 'income' | 'expense'
  formData: TransactionFormData

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
  setFormData: (data: TransactionFormData) => void

  // API methods
  fetchCashFlowData: () => Promise<void>
  handleAddTransaction: () => Promise<void>
  handleDeleteTransaction: (transaction: Transaction) => Promise<void>
  exportReport: (format: 'csv') => Promise<void>
}

export function useCashFlow(): UseCashFlowReturn {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cashFlowData, setCashFlowData] = useState<CashFlowData | null>(null)

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Transaction form
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
  const [formData, setFormData] = useState<TransactionFormData>({
    description: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0] || ''
  })

  // Fetch cash flow data
  const fetchCashFlowData = async () => {
    void setLoading(true)
    void setError(null)

    try {
      const { startDate: calculatedStartDate, endDate: calculatedEndDate } = calculateDateRange(
        selectedPeriod,
        startDate,
        endDate
      )

      const params = new URLSearchParams()
      if (calculatedStartDate) {params.append('start_date', calculatedStartDate)}
      if (calculatedEndDate) {params.append('end_date', calculatedEndDate)}

      const response = await fetch(`/api/reports/cash-flow?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Gagal mengambil data arus kas')
      }

      const data = await response.json()
      void setCashFlowData(data)
    } catch (err: unknown) {
      apiLogger.error({ error: err }, 'Error fetching cash flow data:')
      void setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data')
    } finally {
      void setLoading(false)
    }
  }

  // Handle add transaction
  const handleAddTransaction = async () => {
    const validation = validateTransactionForm(formData)
    if (!validation.isValid) {
      alert(validation.errors.join('\n'))
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      alert('Jumlah harus lebih dari 0')
      return
    }

    try {
      void setLoading(true)

      if (transactionType === 'expense') {
        // Save to expenses table
        const response = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: formData.description,
            category: formData.category,
            amount,
            expense_date: formData.date,
          })
        })

        if (!response.ok) {throw new Error('Gagal menyimpan pengeluaran')}
      } else {
        // Save to income/sales table (would need to implement based on your API)
        // For now, we'll assume income goes to a sales endpoint
        const response = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: formData.description,
            category: formData.category,
            amount,
            sale_date: formData.date,
          })
        })

        if (!response.ok) {throw new Error('Gagal menyimpan pemasukan')}
      }

      // Reset form
      setFormData({
        description: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0] || ''
      })
      void setIsAddDialogOpen(false)

      // Refresh data
      await fetchCashFlowData()

    } catch (err: unknown) {
      apiLogger.error({ error: err }, 'Error adding transaction:')
      alert(`Gagal menambah transaksi: ${  err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      void setLoading(false)
    }
  }

  // Handle delete transaction
  const handleDeleteTransaction = async (transaction: Transaction) => {
    if (!confirm(`Hapus transaksi "${transaction.description}"?`)) {return}

    try {
      void setLoading(true)

      if (transaction.type === 'expense' && transaction.reference_id) {
        const response = await fetch(`/api/expenses/${transaction.reference_id}`, {
          method: 'DELETE'
        })

        if (!response.ok) {throw new Error('Gagal menghapus transaksi')}
      }

      await fetchCashFlowData()
    } catch (err: unknown) {
      apiLogger.error({ error: err }, 'Error deleting transaction:')
      alert(`Gagal menghapus transaksi: ${  err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      void setLoading(false)
    }
  }

  // Handle export report
  const exportReport = async (format: 'csv') => {
    if (!cashFlowData) {return}

    try {
      const filename = `arus-kas-${new Date().toISOString().split('T')[0]}.${format}`
      exportToCSV(cashFlowData, filename)
    } catch (err) {
      apiLogger.error({ error: err }, 'Error exporting report:')
      alert('Gagal mengekspor laporan')
    }
  }

  // Computed values
  const transactions = cashFlowData?.transactions || []
  const summary = cashFlowData?.summary || null
  const chartData = useMemo(() => prepareChartData(transactions), [transactions])

  // Load data on mount and when filters change
  useEffect(() => {
    void fetchCashFlowData()
  }, [selectedPeriod, startDate, endDate])

  return {
    // State
    loading,
    error,
    cashFlowData,

    // Filters
    selectedPeriod,
    startDate,
    endDate,

    // Transaction form
    isAddDialogOpen,
    transactionType,
    formData,

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
    setFormData,

    // API methods
    fetchCashFlowData,
    handleAddTransaction,
    handleDeleteTransaction,
    exportReport
  }
}

// Export constants and utility functions for use in components
export { incomeCategories, expenseCategories, calculateDateRange, prepareChartData, validateTransactionForm }

