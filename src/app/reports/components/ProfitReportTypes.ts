import type { ProfitData as ProfitReportResponse } from '@/types/features/profit-report'

export interface ProfitReportProps {
    dateRange?: {
        start: string | undefined
        end: string | undefined
    }
}

export type ProfitData = ProfitReportResponse

// Chart data types
export interface ChartDataPoint {
    period: string
    revenue: number
    cogs: number
    gross_profit: number
    gross_margin: number
    orders_count: number
}

// Export constants
export const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

// Period type
export type PeriodType = 'daily' | 'monthly' | 'weekly'
export type ChartType = 'area' | 'bar' | 'line'

// Data point for selected chart data
export interface SelectedDataPoint {
    period: string
    revenue: number
    cogs: number
    gross_profit: number
    gross_margin: number
    orders_count: number
}
