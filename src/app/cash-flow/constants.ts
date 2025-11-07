// Cash Flow Types and Constants

export interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: 'expense' | 'income'
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

export type PeriodType = 'custom' | 'month' | 'week' | 'year'

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

// Income categories for cash flow transactions
export const incomeCategories = [
  'Penjualan Produk',
  'Jasa Catering',
  'Pre-Order',
  'Penjualan Online',
  'Event & Wedding',
  'Lainnya'
] as const

// Expense categories for cash flow transactions
export const expenseCategories = [
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

// All available categories
export const allCategories = [...incomeCategories, ...expenseCategories] as const

// Period options for filtering
export const periodOptions = [
  { value: 'week', label: '7 Hari' },
  { value: 'month', label: '30 Hari' },
  { value: 'year', label: '1 Tahun' },
  { value: 'custom', label: 'Kustom' }
] as const

// Filter period options for main filter
export const filterPeriodOptions = [
  { value: 'week', label: 'Minggu Ini' },
  { value: 'month', label: 'Bulan Ini' },
  { value: 'year', label: 'Tahun Ini' },
  { value: 'custom', label: 'Kustom' }
] as const

// Export types
export type IncomeCategory = typeof incomeCategories[number]
export type ExpenseCategory = typeof expenseCategories[number]
export type TransactionCategory = ExpenseCategory | IncomeCategory
