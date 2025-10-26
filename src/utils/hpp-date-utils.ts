/**
 * HPP Date Utilities
 * Date and period related utilities for HPP tracking
 */

import type { TimePeriod } from '@/types/hpp-tracking'

/**
 * Get human-readable label for time periods
 */
export function getPeriodLabel(period: TimePeriod): string {
  const labels: Record<TimePeriod, string> = {
    '7d': '7 Hari Terakhir',
    '30d': '30 Hari Terakhir',
    '90d': '90 Hari Terakhir',
    '1y': '1 Tahun Terakhir',
    'all': 'Semua Data'
  }

  return labels[period] || period
}

/**
 * Convert time period to date range
 */
export function getPeriodDateRange(period: TimePeriod): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date(end)

  switch (period) {
    case '7d':
      start.setDate(start.getDate() - 7)
      break
    case '30d':
      start.setDate(start.getDate() - 30)
      break
    case '90d':
      start.setDate(start.getDate() - 90)
      break
    case '1y':
      start.setFullYear(start.getFullYear() - 1)
      break
    case 'all':
      // Set to a very old date for "all data"
      start.setFullYear(2000, 0, 1)
      break
    default:
      start.setDate(start.getDate() - 30) // Default to 30 days
  }

  return { start, end }
}

/**
 * Format date for HPP display
 */
export function formatHPPDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Check if date is within period
 */
export function isDateInPeriod(date: Date | string, period: TimePeriod): boolean {
  const checkDate = new Date(date)
  const { start, end } = getPeriodDateRange(period)

  return checkDate >= start && checkDate <= end
}

/**
 * Get relative time description for HPP changes
 */
export function getRelativeTimeDescription(fromDate: Date | string, toDate?: Date | string): string {
  const from = new Date(fromDate)
  const to = toDate ? new Date(toDate) : new Date()

  const diffMs = to.getTime() - from.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Baru saja'
  if (diffHours < 24) return `${diffHours} jam yang lalu`
  if (diffDays < 7) return `${diffDays} hari yang lalu`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu yang lalu`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan yang lalu`

  return `${Math.floor(diffDays / 365)} tahun yang lalu`
}
