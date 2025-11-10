// Types and constants for Profit Report

export interface ProfitReportProps {
    dateRange: {
        start: string | undefined
        end: string | undefined
    }
}

export interface ProfitData {
    summary: {
        period: {
            start: string
            end: string
            type?: string
        }
        total_revenue: number
        total_cogs: number
        gross_profit: number
        gross_profit_margin: number
        total_operating_expenses: number
        net_profit: number
        net_profit_margin: number
        orders_count: number
    }
    profit_by_period: Array<{
        period: string
        revenue: number
        cogs: number
        gross_profit: number
        gross_margin: number
        orders_count: number
    }>
    product_profitability?: Array<{
        product_name: string
        total_revenue: number
        total_cogs: number
        gross_profit: number
        gross_margin: number
        total_quantity: number
    }>
    top_profitable_products: Array<{
        product_name: string
        gross_profit: number
        gross_margin: number
    }>
    least_profitable_products: Array<{
        product_name: string
        gross_profit: number
        gross_margin: number
    }>
    operating_expenses_breakdown: Array<{
        category: string
        total: number
        percentage: number
    }>
}

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
