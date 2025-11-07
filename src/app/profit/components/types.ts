
/**
 * Profit Report Module Types
 * Type definitions for profit reporting functionality
 */

export interface ProfitData {
  summary: {
    total_revenue: number
    total_cogs: number
    gross_profit: number
    gross_profit_margin: number
    total_operating_expenses: number
    net_profit: number
    net_profit_margin: number
  }
  products: Array<{
    product_name: string
    quantity_sold: number
    revenue: number
    cogs: number
    profit: number
    profit_margin: number
  }>
  ingredients: Array<{
    ingredient_name: string
    quantity_used: number
    wac_cost: number
    total_cost: number
  }>
  operating_expenses: Array<{
    category: string
    total_amount: number
  }>
  trends: {
    revenue_trend: number
    profit_trend: number
  }
}

import type { DateRange } from 'react-day-picker'

export interface ProfitFilters {
  selectedPeriod: PeriodType
  dateRange?: DateRange
}

export interface ProductChartData {
  name: string
  revenue: number
  cogs: number
  profit: number
}

export interface DateRangeParams {
  start_date?: string
  end_date?: string
}

export type ExportFormat = 'csv' | 'pdf' | 'xlsx'
export type PeriodType = 'custom' | 'month' | 'quarter' | 'week' | 'year'
