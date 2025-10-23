/**
 * HPP Alert Severity Helpers
 * Utilities for formatting and displaying HPP alerts
 */

import { HPPAlert } from '@/types/hpp-tracking'

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
export type AlertType = 'hpp_increase' | 'hpp_decrease' | 'margin_low' | 'cost_spike'

export interface AlertStyle {
    color: string
    bgColor: string
    borderColor: string
    icon: string
    badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'
}

export interface AlertIcon {
    name: string
    className: string
}

/**
 * Map severity to color scheme
 * @param severity - Alert severity level
 * @returns Color configuration object
 */
export function getSeverityColors(severity: AlertSeverity): AlertStyle {
    const styles: Record<AlertSeverity, AlertStyle> = {
        low: {
            color: 'text-blue-700',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            icon: '📘',
            badgeVariant: 'outline'
        },
        medium: {
            color: 'text-yellow-700',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            icon: '⚠️',
            badgeVariant: 'secondary'
        },
        high: {
            color: 'text-orange-700',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            icon: '🔶',
            badgeVariant: 'destructive'
        },
        critical: {
            color: 'text-red-700',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            icon: '🚨',
            badgeVariant: 'destructive'
        }
    }

    return styles[severity] || styles.medium
}

/**
 * Get icon for alert type
 * @param alertType - Type of alert
 * @returns Icon configuration
 */
export function getAlertTypeIcon(alertType: AlertType): AlertIcon {
    const icons: Record<AlertType, AlertIcon> = {
        hpp_increase: {
            name: 'TrendingUp',
            className: 'text-red-500'
        },
        hpp_decrease: {
            name: 'TrendingDown',
            className: 'text-green-500'
        },
        margin_low: {
            name: 'AlertTriangle',
            className: 'text-orange-500'
        },
        cost_spike: {
            name: 'ArrowUp',
            className: 'text-yellow-500'
        }
    }

    return icons[alertType] || icons.hpp_increase
}

/**
 * Get severity label in Indonesian
 * @param severity - Alert severity level
 * @returns Localized severity label
 */
export function getSeverityLabel(severity: AlertSeverity): string {
    const labels: Record<AlertSeverity, string> = {
        low: 'Rendah',
        medium: 'Sedang',
        high: 'Tinggi',
        critical: 'Kritis'
    }

    return labels[severity] || labels.medium
}

/**
 * Get alert type label in Indonesian
 * @param alertType - Type of alert
 * @returns Localized alert type label
 */
export function getAlertTypeLabel(alertType: AlertType): string {
    const labels: Record<AlertType, string> = {
        hpp_increase: 'Kenaikan HPP',
        hpp_decrease: 'Penurunan HPP',
        margin_low: 'Margin Rendah',
        cost_spike: 'Lonjakan Biaya'
    }

    return labels[alertType] || alertType
}

/**
 * Format change percentage with sign and color
 * @param changePercentage - Percentage change value
 * @param includeSign - Whether to include + or - sign
 * @returns Formatted percentage string
 */
export function formatChangePercentage(
    changePercentage: number,
    includeSign: boolean = true
): string {
    const sign = includeSign && changePercentage > 0 ? '+' : ''
    return `${sign}${changePercentage.toFixed(1)}%`
}

/**
 * Get change indicator (arrow) based on percentage
 * @param changePercentage - Percentage change value
 * @returns Arrow indicator string
 */
export function getChangeIndicator(changePercentage: number): string {
    if (changePercentage > 5) return '↑'
    if (changePercentage < -5) return '↓'
    return '→'
}

/**
 * Get change color class based on percentage and context
 * @param changePercentage - Percentage change value
 * @param isPositiveGood - Whether positive change is good (default: false for HPP)
 * @returns Tailwind color class
 */
export function getChangeColorClass(
    changePercentage: number,
    isPositiveGood: boolean = false
): string {
    const threshold = 5

    if (Math.abs(changePercentage) < threshold) {
        return 'text-gray-500'
    }

    const isIncrease = changePercentage > 0
    const isGood = isPositiveGood ? isIncrease : !isIncrease

    return isGood ? 'text-green-600' : 'text-red-600'
}

/**
 * Generate alert message based on alert data
 * @param alert - HPP alert object
 * @returns Formatted alert message
 */
export function generateAlertMessage(alert: HPPAlert): string {
    const change = formatChangePercentage(alert.change_percentage)
    const oldValue = formatCurrency(alert.old_value)
    const newValue = formatCurrency(alert.new_value)

    switch (alert.alert_type) {
        case 'hpp_increase':
            return `HPP meningkat ${change} dari ${oldValue} menjadi ${newValue}`
        case 'hpp_decrease':
            return `HPP menurun ${change} dari ${oldValue} menjadi ${newValue}`
        case 'margin_low':
            return `Margin profit turun ke ${alert.new_value.toFixed(1)}%, di bawah target minimum 15%`
        case 'cost_spike':
            return `Terjadi lonjakan biaya bahan baku sebesar ${change}`
        default:
            return alert.message
    }
}

/**
 * Generate alert title based on alert type and severity
 * @param alertType - Type of alert
 * @param severity - Severity level
 * @param recipeName - Name of the recipe
 * @returns Alert title
 */
export function generateAlertTitle(
    alertType: AlertType,
    severity: AlertSeverity,
    recipeName: string
): string {
    const severityEmoji = getSeverityColors(severity).icon
    const typeLabel = getAlertTypeLabel(alertType)

    return `${severityEmoji} ${typeLabel} - ${recipeName}`
}

/**
 * Format currency value
 * @param value - Numeric value
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value)
}

/**
 * Format absolute change value with currency
 * @param oldValue - Previous value
 * @param newValue - Current value
 * @returns Formatted change string with sign
 */
export function formatAbsoluteChange(oldValue: number, newValue: number): string {
    const change = newValue - oldValue
    const sign = change > 0 ? '+' : ''
    return `${sign}${formatCurrency(change)}`
}

/**
 * Get priority score for sorting alerts
 * @param alert - HPP alert object
 * @returns Priority score (higher = more important)
 */
export function getAlertPriority(alert: HPPAlert): number {
    const severityScores: Record<AlertSeverity, number> = {
        critical: 40,
        high: 30,
        medium: 20,
        low: 10
    }

    const typeScores: Record<AlertType, number> = {
        margin_low: 4,
        hpp_increase: 3,
        cost_spike: 2,
        hpp_decrease: 1
    }

    const severityScore = severityScores[alert.severity] || 0
    const typeScore = typeScores[alert.alert_type] || 0
    const unreadBonus = alert.is_read ? 0 : 10
    const recencyScore = Math.max(0, 10 - Math.floor(
        (Date.now() - new Date(alert.created_at).getTime()) / (1000 * 60 * 60 * 24)
    ))

    return severityScore + typeScore + unreadBonus + recencyScore
}

/**
 * Sort alerts by priority
 * @param alerts - Array of alerts
 * @returns Sorted alerts (highest priority first)
 */
export function sortAlertsByPriority(alerts: HPPAlert[]): HPPAlert[] {
    return [...alerts].sort((a, b) => getAlertPriority(b) - getAlertPriority(a))
}

/**
 * Group alerts by date category
 * @param alerts - Array of alerts
 * @returns Grouped alerts
 */
export function groupAlertsByDate(alerts: HPPAlert[]): Record<string, HPPAlert[]> {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const groups: Record<string, HPPAlert[]> = {
        'Hari Ini': [],
        'Kemarin': [],
        'Minggu Ini': [],
        'Lebih Lama': []
    }

    alerts.forEach((alert) => {
        const alertDate = new Date(alert.created_at)
        const alertDay = new Date(alertDate.getFullYear(), alertDate.getMonth(), alertDate.getDate())

        if (alertDay.getTime() === today.getTime()) {
            groups['Hari Ini'].push(alert)
        } else if (alertDay.getTime() === yesterday.getTime()) {
            groups['Kemarin'].push(alert)
        } else if (alertDate >= weekAgo) {
            groups['Minggu Ini'].push(alert)
        } else {
            groups['Lebih Lama'].push(alert)
        }
    })

    // Remove empty groups
    Object.keys(groups).forEach((key) => {
        if (groups[key].length === 0) {
            delete groups[key]
        }
    })

    return groups
}

/**
 * Get summary statistics for alerts
 * @param alerts - Array of alerts
 * @returns Summary statistics
 */
export function getAlertsSummary(alerts: HPPAlert[]): {
    total: number
    unread: number
    bySeverity: Record<AlertSeverity, number>
    byType: Record<AlertType, number>
} {
    const summary = {
        total: alerts.length,
        unread: alerts.filter((a) => !a.is_read).length,
        bySeverity: {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0
        } as Record<AlertSeverity, number>,
        byType: {
            hpp_increase: 0,
            hpp_decrease: 0,
            margin_low: 0,
            cost_spike: 0
        } as Record<AlertType, number>
    }

    alerts.forEach((alert) => {
        summary.bySeverity[alert.severity]++
        summary.byType[alert.alert_type]++
    })

    return summary
}

/**
 * Check if alert should show notification badge
 * @param alert - HPP alert object
 * @returns True if should show badge
 */
export function shouldShowBadge(alert: HPPAlert): boolean {
    return !alert.is_read && !alert.is_dismissed
}

/**
 * Format time ago for alert timestamp
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function formatTimeAgo(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit yang lalu`
    if (diffHours < 24) return `${diffHours} jam yang lalu`
    if (diffDays < 7) return `${diffDays} hari yang lalu`

    return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}
