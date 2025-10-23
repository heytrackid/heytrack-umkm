/**
 * HPP Date Range Utilities
 * Provides date range calculations and formatting for HPP historical tracking
 */

import { TimePeriod } from '@/types/hpp-tracking'

export interface DateRange {
    start: Date
    end: Date
}

/**
 * Get date range for a given time period
 * @param period - Time period ('7d', '30d', '90d', '1y')
 * @param endDate - Optional end date (defaults to now)
 * @returns DateRange object with start and end dates
 */
export function getPeriodDateRange(
    period: TimePeriod,
    endDate: Date = new Date()
): DateRange {
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999) // End of day

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
        default:
            // Default to 30 days
            start.setDate(start.getDate() - 30)
    }

    start.setHours(0, 0, 0, 0) // Start of day

    return { start, end }
}

/**
 * Format date for display in charts and UI
 * @param date - Date to format
 * @param format - Format type ('short', 'medium', 'long')
 * @returns Formatted date string
 */
export function formatDate(
    date: Date | string,
    format: 'short' | 'medium' | 'long' = 'medium'
): string {
    const d = typeof date === 'string' ? new Date(date) : date

    switch (format) {
        case 'short':
            // e.g., "12/25"
            return d.toLocaleDateString('id-ID', {
                month: '2-digit',
                day: '2-digit'
            })
        case 'medium':
            // e.g., "25 Des"
            return d.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short'
            })
        case 'long':
            // e.g., "25 Desember 2024"
            return d.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
        default:
            return d.toLocaleDateString('id-ID')
    }
}

/**
 * Format date for API requests (ISO format)
 * @param date - Date to format
 * @returns ISO date string
 */
export function formatDateForAPI(date: Date): string {
    return date.toISOString()
}

/**
 * Get period label for display
 * @param period - Time period
 * @returns Human-readable period label
 */
export function getPeriodLabel(period: TimePeriod): string {
    const labels: Record<TimePeriod, string> = {
        '7d': '7 Hari Terakhir',
        '30d': '30 Hari Terakhir',
        '90d': '90 Hari Terakhir',
        '1y': '1 Tahun Terakhir'
    }

    return labels[period] || labels['30d']
}

/**
 * Get short period label for buttons
 * @param period - Time period
 * @returns Short period label
 */
export function getShortPeriodLabel(period: TimePeriod): string {
    const labels: Record<TimePeriod, string> = {
        '7d': '7H',
        '30d': '30H',
        '90d': '90H',
        '1y': '1T'
    }

    return labels[period] || labels['30d']
}

/**
 * Get number of days in a period
 * @param period - Time period
 * @returns Number of days
 */
export function getPeriodDays(period: TimePeriod): number {
    const days: Record<TimePeriod, number> = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
    }

    return days[period] || 30
}

/**
 * Format date range for display
 * @param start - Start date
 * @param end - End date
 * @returns Formatted date range string
 */
export function formatDateRange(start: Date | string, end: Date | string): string {
    const startDate = typeof start === 'string' ? new Date(start) : start
    const endDate = typeof end === 'string' ? new Date(end) : end

    return `${formatDate(startDate, 'medium')} - ${formatDate(endDate, 'medium')}`
}

/**
 * Check if two dates are on the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are on the same day
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2

    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    )
}

/**
 * Get relative date label (Today, Yesterday, This Week, etc.)
 * @param date - Date to check
 * @returns Relative date label
 */
export function getRelativeDateLabel(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    if (isSameDay(d, now)) {
        return 'Hari Ini'
    }

    if (isSameDay(d, yesterday)) {
        return 'Kemarin'
    }

    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)

    if (d >= weekAgo) {
        return 'Minggu Ini'
    }

    const monthAgo = new Date(now)
    monthAgo.setDate(monthAgo.getDate() - 30)

    if (d >= monthAgo) {
        return 'Bulan Ini'
    }

    return formatDate(d, 'long')
}

/**
 * Parse ISO date string to Date object
 * @param dateString - ISO date string
 * @returns Date object or null if invalid
 */
export function parseDate(dateString: string): Date | null {
    try {
        const date = new Date(dateString)
        return isNaN(date.getTime()) ? null : date
    } catch {
        return null
    }
}

/**
 * Get date for chart X-axis based on period
 * @param date - Date to format
 * @param period - Time period for context
 * @returns Formatted date for chart axis
 */
export function formatChartDate(date: Date | string, period: TimePeriod): string {
    const d = typeof date === 'string' ? new Date(date) : date

    switch (period) {
        case '7d':
            // Show day name for 7 days
            return d.toLocaleDateString('id-ID', { weekday: 'short' })
        case '30d':
            // Show date for 30 days
            return formatDate(d, 'short')
        case '90d':
            // Show date for 90 days
            return formatDate(d, 'short')
        case '1y':
            // Show month for 1 year
            return d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
        default:
            return formatDate(d, 'short')
    }
}
