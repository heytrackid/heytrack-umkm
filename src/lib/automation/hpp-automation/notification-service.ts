/**
 * Notification Service Module
 * Handles HPP-related notifications and alerts
 */

import { SmartNotificationSystem } from '../../communications/notifications'
import { automationLogger } from '@/lib/logger'
import type { HPPRecalculationResult } from './types'

export class HPPNotificationService {
  /**
   * Generate price change notifications
   */
  generatePriceChangeNotifications(
    ingredientId: string,
    oldPrice: number,
    newPrice: number,
    affectedRecipes: HPPRecalculationResult[]
  ): void {
    const priceChange = ((newPrice - oldPrice) / oldPrice) * 100
    const changeDirection = priceChange > 0 ? 'naik' : 'turun'
    const impactLevel = Math.abs(priceChange) > 10 ? 'high' : Math.abs(priceChange) > 5 ? 'medium' : 'low'

    // Main price change notification
    SmartNotificationSystem.getInstance().addNotification({
      category: 'financial',
      priority: impactLevel === 'high' ? 'high' : 'medium',
      title: `Harga Bahan Baku ${changeDirection.toUpperCase()}`,
      message: `Harga bahan ${changeDirection} ${Math.abs(priceChange).toFixed(1)}%. ${affectedRecipes.length} resep terpengaruh, HPP otomatis diperbarui.`,
      actionUrl: '/hpp-simple?tab=price_changes',
      actionLabel: 'Lihat Dampak',
      status: 'sent'
    })

    // Individual recipe impact notifications (for high impact changes)
    if (impactLevel === 'high') {
      affectedRecipes.forEach(recipe => {
        if (Math.abs(recipe.changePercentage) > 5) {
          SmartNotificationSystem.getInstance().addNotification({
            category: 'financial',
            priority: 'medium',
            title: `HPP ${recipe.recipeName} Berubah Signifikan`,
            message: `HPP ${recipe.changePercentage > 0 ? 'naik' : 'turun'} ${Math.abs(recipe.changePercentage).toFixed(1)}% menjadi ${this.formatCurrency(recipe.newHPP)}`,
            actionUrl: `/hpp-simple?recipe=${recipe.recipeId}`,
            actionLabel: 'Review Pricing',
            status: 'sent'
          })
        }
      })
    }

    automationLogger.info({
      ingredientId,
      priceChange: priceChange.toFixed(2),
      affectedRecipes: affectedRecipes.length,
      impactLevel
    }, 'Price change notifications generated')
  }

  /**
   * Generate operational cost change notification
   */
  generateOperationalCostNotification(
    costId: string,
    costName: string,
    oldAmount: number,
    newAmount: number,
    autoAllocated: boolean
  ): void {
    SmartNotificationSystem.getInstance().addNotification({
      category: 'financial',
      priority: 'medium',
      title: 'Biaya Operasional Berubah',
      message: `${costName}: ${this.formatCurrency(oldAmount)} → ${this.formatCurrency(newAmount)}. ${autoAllocated ? 'HPP otomatis diperbarui untuk semua resep.' : ''}`,
      actionUrl: '/hpp-simple?tab=operational_costs',
      actionLabel: 'Lihat HPP',
      status: 'sent'
    })

    automationLogger.info({
      costId,
      costName,
      oldAmount,
      newAmount,
      autoAllocated
    }, 'Operational cost change notification generated')
  }

  /**
   * Generate batch recalculation notification
   */
  generateBatchRecalculationNotification(
    reason: string,
    processedRecipes: number,
    totalRecipes: number
  ): void {
    SmartNotificationSystem.getInstance().addNotification({
      category: 'financial',
      priority: 'medium',
      title: 'HPP Batch Update Selesai',
      message: `${processedRecipes} resep telah diperbarui HPP-nya karena ${reason}`,
      actionUrl: '/hpp-simple?tab=batch_results',
      actionLabel: 'Lihat Hasil',
      status: 'sent'
    })

    automationLogger.info({
      reason,
      processedRecipes,
      totalRecipes
    }, 'Batch recalculation notification generated')
  }

  /**
   * Generate system health notification
   */
  generateSystemHealthNotification(
    type: 'success' | 'warning' | 'error',
    title: string,
    message: string,
    actionUrl?: string
  ): void {
    SmartNotificationSystem.getInstance().addNotification({
      category: 'system',
      priority: type === 'error' ? 'high' : type === 'warning' ? 'medium' : 'low',
      title,
      message,
      actionUrl,
      actionLabel: actionUrl ? 'Lihat Detail' : undefined,
      status: 'sent'
    })

    automationLogger.info({
      notificationType: type,
      title,
      hasAction: !!actionUrl
    }, 'System health notification generated')
  }

  /**
   * Format currency for notifications
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  /**
   * Send bulk notifications with rate limiting
   */
  async sendBulkNotifications(
    notifications: Array<{
      type: 'info' | 'warning' | 'error' | 'success'
      category: string
      title: string
      message: string
      actionUrl?: string
      actionLabel?: string
    }>,
    batchSize: number = 10
  ): Promise<void> {
    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize)

      // Send batch
      batch.forEach(notification => {
        SmartNotificationSystem.getInstance().addNotification({
          ...notification,
          category: notification.category as any,
          priority: 'medium',
          status: 'sent'
        })
      })

      // Small delay between batches to prevent overwhelming the system
      if (i + batchSize < notifications.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    automationLogger.info({
      totalNotifications: notifications.length,
      batches: Math.ceil(notifications.length / batchSize)
    }, 'Bulk notifications sent')
  }
}
