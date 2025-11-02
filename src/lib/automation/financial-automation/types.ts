import type { FinancialMetrics, FinancialTrend, FinancialAlert } from '@/lib/automation/types'

/**
 * Financial Automation Module Types
 * Additional type definitions specific to financial automation
 */


// Financial Projection Types
export interface FinancialProjection {
  month: number
  revenue: number
  expenses: number
  profit: number
  profitMargin: number
}

export interface ProjectionResult {
  revenueGrowthRate: number
  expenseGrowthRate: number
  projections: FinancialProjection[]
  confidence: 'High' | 'Medium' | 'Low'
}

// Break-even Analysis Types
export interface BreakEvenResult {
  breakEvenUnits: number
  breakEvenRevenue: number
  contributionMargin: number
  contributionMarginRatio: number
  safetyMargin: {
    units: number
    revenue: number
  }
  error?: string
}

// ROI Analysis Types
export interface ROIResult {
  simpleROI: number
  netPresentValue: number
  paybackPeriodYears: number
  isViable: boolean
  recommendation: string
}

// Pricing Optimization Types
export interface PriceOption {
  price: number
  priceChange: number
  volume: number
  volumeChange: number
  profit: number
  profitChange: number
}

export interface PricingOptimizationResult {
  currentMetrics: {
    price: number
    volume: number
    profit: number
  }
  optimalPrice: PriceOption
  allOptions: PriceOption[]
  recommendation: string
}

// Weekly Data Aggregation Type
export interface WeeklyData {
  revenue: number
  cost: number
  expenses: number
}

// Historical Data Type
export interface HistoricalData {
  month: string
  revenue: number
  expenses: number
}

// Expenses by Category Type
export interface ExpensesByCategory {
  [category: string]: number
}
