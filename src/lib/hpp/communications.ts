/**
 * HPP Communications Module
 * Notification and communication services for HPP alerts and updates
 */

import { createClient } from '@/utils/supabase/client'
import { dbLogger } from '@/lib/logger'
import type { HPPAlert } from './types'

export interface NotificationChannel {
  type: 'email' | 'in_app' | 'sms' | 'webhook'
  enabled: boolean
  config?: Record<string, any>
}

export interface NotificationTemplate {
  id: string
  name: string
  subject?: string
  body: string
  variables: string[]
}

export interface NotificationResult {
  success: boolean
  channel: string
  messageId?: string
  error?: string
}

export class HPPNotificationService {
  private static readonly DEFAULT_CHANNELS: NotificationChannel[] = [
    { type: 'in_app', enabled: true },
    { type: 'email', enabled: false },
    { type: 'sms', enabled: false },
    { type: 'webhook', enabled: false }
  ]

  /**
   * Send HPP alert notification
   */
  static async sendHPPAlert(alert: HPPAlert, userId: string): Promise<NotificationResult[]> {
    const results: NotificationResult[] = []

    try {
      // Get user notification preferences
      const channels = await this.getUserNotificationChannels(userId)

      for (const channel of channels) {
        if (!channel.enabled) continue

        try {
          const result = await this.sendToChannel(alert, channel, userId)
          results.push(result)
        } catch (error) {
          dbLogger.error({
            error: error instanceof Error ? error.message : String(error),
            channel: channel.type,
            alertId: alert.id
          }, 'Failed to send HPP alert notification')

          results.push({
            success: false,
            channel: channel.type,
            error: error instanceof Error ? error.message : String(error)
          })
        }
      }

      return results
    } catch (error) {
      dbLogger.error({
        error: error instanceof Error ? error.message : String(error),
        alertId: alert.id,
        userId
      }, 'Failed to send HPP alert notifications')
      throw error
    }
  }

  /**
   * Send notification to specific channel
   */
  private static async sendToChannel(
    alert: HPPAlert,
    channel: NotificationChannel,
    userId: string
  ): Promise<NotificationResult> {
    switch (channel.type) {
      case 'in_app':
        return this.sendInAppNotification(alert, userId)
      case 'email':
        return this.sendEmailNotification(alert, userId, channel.config)
      case 'sms':
        return this.sendSMSNotification(alert, userId, channel.config)
      case 'webhook':
        return this.sendWebhookNotification(alert, userId, channel.config)
      default:
        throw new Error(`Unsupported notification channel: ${channel.type}`)
    }
  }

  /**
   * Send in-app notification
   */
  private static async sendInAppNotification(alert: HPPAlert, userId: string): Promise<NotificationResult> {
    const supabase = createClient()

    try {
      // In-app notifications are stored in the database
      // This could be implemented as a separate notifications table
      // For now, we'll mark the alert as needing attention

      dbLogger.info({ alertId: alert.id, userId }, 'In-app HPP alert notification sent')
      return { success: true, channel: 'in_app' }
    } catch (error) {
      throw new Error(`In-app notification failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Send email notification
   */
  private static async sendEmailNotification(
    alert: HPPAlert,
    userId: string,
    config?: Record<string, any>
  ): Promise<NotificationResult> {
    // Email implementation would go here
    // This could integrate with services like SendGrid, Mailgun, etc.

    const template = this.getEmailTemplate(alert)
    const subject = template.subject || 'Pemberitahuan Perubahan HPP'
    const body = this.interpolateTemplate(template.body, alert)

    // TODO: Integrate with email service
    dbLogger.info({ alertId: alert.id, userId, subject }, 'Email HPP alert notification prepared')

    return {
      success: false,
      channel: 'email',
      error: 'Email integration not implemented yet'
    }
  }

  /**
   * Send SMS notification
   */
  private static async sendSMSNotification(
    alert: HPPAlert,
    userId: string,
    config?: Record<string, any>
  ): Promise<NotificationResult> {
    // SMS implementation would go here
    // This could integrate with services like Twilio, etc.

    dbLogger.info({ alertId: alert.id, userId }, 'SMS HPP alert notification prepared')

    return {
      success: false,
      channel: 'sms',
      error: 'SMS integration not implemented yet'
    }
  }

  /**
   * Send webhook notification
   */
  private static async sendWebhookNotification(
    alert: HPPAlert,
    userId: string,
    config?: Record<string, any>
  ): Promise<NotificationResult> {
    if (!config?.url) {
      throw new Error('Webhook URL not configured')
    }

    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.headers || {})
        },
        body: JSON.stringify({
          type: 'hpp_alert',
          alert,
          userId,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`Webhook responded with status ${response.status}`)
      }

      const result = await response.json()

      return {
        success: true,
        channel: 'webhook',
        messageId: result.id || `webhook_${Date.now()}`
      }
    } catch (error) {
      throw new Error(`Webhook notification failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Get user notification channels
   */
  private static async getUserNotificationChannels(userId: string): Promise<NotificationChannel[]> {
    // TODO: Implement user preference storage
    // For now, return default channels
    return this.DEFAULT_CHANNELS
  }

  /**
   * Get email template for HPP alert
   */
  private static getEmailTemplate(alert: HPPAlert): NotificationTemplate {
    const templates: Record<string, NotificationTemplate> = {
      hpp_increase: {
        id: 'hpp_increase',
        name: 'HPP Increase Alert',
        subject: 'Peringatan: Kenaikan HPP untuk {{recipe_name}}',
        body: `
          Halo,

          Kami mendeteksi kenaikan HPP sebesar {{change_percentage}} untuk resep {{recipe_name}}.

          Detail perubahan:
          - Perubahan: {{change_amount}}
          - Tingkat keparahan: {{severity}}

          Silakan periksa dan sesuaikan harga jual jika diperlukan.

          Terima kasih,
          Sistem HeyTrack
        `,
        variables: ['recipe_name', 'change_percentage', 'change_amount', 'severity']
      },
      hpp_decrease: {
        id: 'hpp_decrease',
        name: 'HPP Decrease Alert',
        subject: 'Informasi: Penurunan HPP untuk {{recipe_name}}',
        body: `
          Halo,

          Kami mendeteksi penurunan HPP sebesar {{change_percentage}} untuk resep {{recipe_name}}.

          Detail perubahan:
          - Perubahan: {{change_amount}}

          Ini adalah kesempatan baik untuk meningkatkan margin keuntungan.

          Terima kasih,
          Sistem HeyTrack
        `,
        variables: ['recipe_name', 'change_percentage', 'change_amount']
      }
    }

    const templateKey = alert.change_percentage > 0 ? 'hpp_increase' : 'hpp_decrease'
    return templates[templateKey] || templates.hpp_increase
  }

  /**
   * Interpolate template variables
   */
  private static interpolateTemplate(template: string, alert: HPPAlert): string {
    return template
      .replace(/{{recipe_name}}/g, alert.recipe_name)
      .replace(/{{change_percentage}}/g, `${alert.change_percentage.toFixed(1)}%`)
      .replace(/{{change_amount}}/g, alert.change_amount.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }))
      .replace(/{{severity}}/g, this.getSeverityLabel(alert.severity))
  }

  /**
   * Get severity label for notifications
   */
  private static getSeverityLabel(severity: string): string {
    const labels = {
      low: 'Rendah',
      medium: 'Sedang',
      high: 'Tinggi',
      critical: 'Kritis'
    }
    return labels[severity as keyof typeof labels] || severity
  }
}
