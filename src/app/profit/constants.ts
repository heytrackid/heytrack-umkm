export type {
  ChartDataPoint,
  IngredientCost,
  OperatingExpense,
  ProductProfit,
  ProfitData,
  ProfitSummary,
  ProfitTrends,
} from '@/types/features/profit-report'

export type { ProfitPeriodType } from '@/types/features/profit-report'

// Period options for profit reports
export const profitPeriodOptions = [
  { value: 'week', label: '7 Hari' },
  { value: 'month', label: '30 Hari' },
  { value: 'quarter', label: 'Kuartal' },
  { value: 'year', label: '1 Tahun' },
  { value: 'custom', label: 'Kustom' }
] as const

// Filter period options for main filter
export const filterProfitPeriodOptions = [
  { value: 'week', label: 'Minggu Ini' },
  { value: 'month', label: 'Bulan Ini' },
  { value: 'quarter', label: 'Kuartal Ini' },
  { value: 'year', label: 'Tahun Ini' },
  { value: 'custom', label: 'Kustom' }
] as const

// Export types
export type ProfitPeriod = typeof profitPeriodOptions[number]['value']
