/**
 * HPP Utilities Module
 * Utility functions for HPP formatting, display, and helpers
 */

import type { SeverityColors } from './types'

export class HPPUtils {
  /**
   * Get severity colors for alerts
   */
  static getSeverityColors(severity: string): SeverityColors {
    const colors: Record<string, SeverityColors> = {
      low: {
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: 'Info',
        badgeVariant: 'secondary'
      },
      medium: {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: 'AlertTriangle',
        badgeVariant: 'default'
      },
      high: {
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: 'AlertCircle',
        badgeVariant: 'default'
      },
      critical: {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: 'AlertTriangle',
        badgeVariant: 'destructive'
      }
    }
    return colors[severity] || colors.medium
  }

  /**
   * Format change percentage for display
   */
  static formatChangePercentage(percentage: number): string {
    const sign = percentage > 0 ? '+' : ''
    return `${sign}${percentage.toFixed(1)}%`
  }

  /**
   * Get severity color variant for badges
   */
  static getSeverityColor(severity: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    return this.getSeverityColors(severity).badgeVariant
  }

  /**
   * Get severity label for display
   */
  static getSeverityLabel(severity: string): string {
    const labels = {
      low: 'Rendah',
      medium: 'Sedang',
      high: 'Tinggi',
      critical: 'Kritis'
    }
    return labels[severity as keyof typeof labels] || severity
  }

  /**
   * Get alert type label
   */
  static getAlertTypeLabel(type: string): string {
    const labels = {
      hpp_increase: 'Kenaikan HPP',
      hpp_decrease: 'Penurunan HPP',
      margin_low: 'Margin Rendah',
      cost_spike: 'Lonjakan Biaya'
    }
    return labels[type as keyof typeof labels] || type
  }

  /**
   * Format time ago
   */
  static formatTimeAgo(date: string | Date): string {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()

    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit yang lalu`
    if (diffHours < 24) return `${diffHours} jam yang lalu`
    if (diffDays < 7) return `${diffDays} hari yang lalu`

    return past.toLocaleDateString('id-ID')
  }
}
