/**
 * Chart Types and Constants
 * Shared types and constants for all chart components
 */

// Chart data interfaces
export interface ChartDataPoint {
  [key: string]: string | number | boolean | null | undefined
}

export interface TooltipEntry {
  color: string
  name: string
  value: number | string
  payload?: ChartDataPoint
}

export interface PieLabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
  index: number
}

// Color schemes for mobile-friendly visualization
export const CHART_COLORS = {
  primary: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a'],
  success: ['#10b981', '#059669', '#047857', '#065f46'],
  warning: ['#f59e0b', '#d97706', '#b45309', '#92400e'],
  danger: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b'],
  neutral: ['#6b7280', '#4b5563', '#374151', '#1f2937'],
  rainbow: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']
}

// Base chart props interface
export interface BaseMobileChartProps {
  data: ChartDataPoint[]
  title?: string
  description?: string
  height?: number
  showFullscreen?: boolean
  showDownload?: boolean
  showShare?: boolean
  actions?: React.ReactNode
  trend?: {
    value: number
    label?: string
  }
}
