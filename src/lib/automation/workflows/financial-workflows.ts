/**
 * Financial Workflow Handlers
 * Workflow automation handlers for financial-related events
 */

import { automationLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
import type { WorkflowEventData, WorkflowResult, WorkflowContext } from '@/lib/automation/types'

export class FinancialWorkflowHandlers {
  /**
   * Handle ingredient price change event
   */
  static async handleIngredientPriceChanged(context: WorkflowContext): Promise<WorkflowResult> {
    const { event, logger } = context

    if (!event.data || typeof event.data !== 'object') {
      return {
        success: false,
        message: 'Invalid price change event data',
        error: 'Missing or invalid event data'
      }
    }

    const data = event.data as {
      ingredientId: string
      oldPrice: number
      newPrice: number
      priceChange: number
      affectedRecipes?: string[]
    }

    const { ingredientId, oldPrice, newPrice, priceChange, affectedRecipes } = data

    logger.info({
      ingredientId,
      oldPrice,
      newPrice,
      priceChange: priceChange.toFixed(2),
      affectedRecipesCount: affectedRecipes?.length || 0
    }, 'Processing ingredient price change')

    try {
      // Generate smart notifications for significant changes
      if (Math.abs(priceChange) > 10) {
        await this.sendPriceChangeNotification(data)
      }

      return {
        success: true,
        message: `Price change processed for ingredient ${ingredientId}`,
        data: {
          ingredientId,
          priceChange,
          notificationsSent: Math.abs(priceChange) > 10
        }
      }

    } catch (error: unknown) {
      logger.error({
        ingredientId,
        error: getErrorMessage(error)
      }, 'Failed to process ingredient price change')

      return {
        success: false,
        message: 'Failed to process ingredient price change',
        error: getErrorMessage(error)
      }
    }
  }

  /**
   * Handle operational cost change event
   */
  static async handleOperationalCostChanged(context: WorkflowContext): Promise<WorkflowResult> {
    const { event, logger } = context

    if (!event.data || typeof event.data !== 'object') {
      return {
        success: false,
        message: 'Invalid cost change event data',
        error: 'Missing or invalid event data'
      }
    }

    const data = event.data as {
      costId: string
      costName: string
      oldAmount: number
      newAmount: number
    }

    const { costId, costName, oldAmount, newAmount } = data

    logger.info({
      costId,
      costName,
      oldAmount,
      newAmount
    }, 'Processing operational cost change')

    try {
      // Calculate impact
      const costChange = ((newAmount - oldAmount) / oldAmount) * 100

      // Send notifications
      await this.sendCostChangeNotification(data, costChange)

      // Trigger pricing reviews for significant changes
      if (Math.abs(costChange) > 10) {
        logger.warn({
          costChange: costChange.toFixed(1)
        }, 'Significant operational cost change detected')

        // TODO: Trigger pricing review workflow
        setTimeout(async () => {
          logger.info({ costId }, 'Pricing review triggered for cost change')
        }, 3000)
      }

      return {
        success: true,
        message: `Operational cost change processed for ${costName}`,
        data: {
          costId,
          costName,
          costChange,
          notificationsSent: true,
          pricingReviewTriggered: Math.abs(costChange) > 10
        }
      }

    } catch (error: unknown) {
      logger.error({
        costId,
        error: getErrorMessage(error)
      }, 'Failed to process operational cost change')

      return {
        success: false,
        message: 'Failed to process operational cost change',
        error: getErrorMessage(error)
      }
    }
  }

  /**
   * Send price change notification
   */
  private static async sendPriceChangeNotification(data: {
    ingredientId: string
    oldPrice: number
    newPrice: number
    priceChange: number
    affectedRecipes?: string[]
  }): Promise<void> {
    const { priceChange, affectedRecipes } = data

    try {
      // TODO: Import and use notification system
      const notificationData = {
        type: priceChange > 0 ? 'warning' : 'info',
        category: 'financial',
        priority: Math.abs(priceChange) > 20 ? 'critical' : 'high',
        title: `Harga Bahan Baku ${priceChange > 0 ? 'NAIK' : 'TURUN'} Signifikan`,
        message: `Perubahan ${Math.abs(priceChange).toFixed(1)}% mempengaruhi ${affectedRecipes?.length || 0} resep.`,
        actionUrl: '/ingredients',
        actionLabel: 'Review Bahan Baku'
      }

      automationLogger.info({ notificationData }, 'Price change notification sent')
    } catch (err: unknown) {
      automationLogger.debug({ err: getErrorMessage(err) }, 'Notification system not available')
    }
  }

  /**
   * Send cost change notification
   */
  private static async sendCostChangeNotification(
    data: { costId: string; costName: string; oldAmount: number; newAmount: number },
    costChange: number
  ): Promise<void> {
    const { costName, oldAmount, newAmount } = data

    try {
      // Send general notification
      const generalNotification = {
        type: 'info',
        category: 'financial',
        priority: 'medium',
        title: 'Biaya Operasional Diperbarui',
        message: `${costName} berubah dari Rp${oldAmount.toLocaleString()} ke Rp${newAmount.toLocaleString()}.`,
        actionUrl: '/operational-costs',
        actionLabel: 'Lihat Biaya Operasional'
      }

      // Send review notification for significant changes
      if (Math.abs(costChange) > 10) {
        const reviewNotification = {
          type: 'warning',
          category: 'financial',
          priority: 'high',
          title: 'Review Pricing Strategy Disarankan',
          message: `Perubahan biaya operasional ${Math.abs(costChange).toFixed(1)}% mempengaruhi seluruh profitabilitas. Pertimbangkan review harga jual.`,
          actionUrl: '/hpp-simple?tab=pricing_review',
          actionLabel: 'Review Pricing'
        }

        automationLogger.info({ reviewNotification }, 'Pricing review notification sent')
      }

      automationLogger.info({ generalNotification }, 'Cost change notification sent')
    } catch (err: unknown) {
      automationLogger.debug({ err: getErrorMessage(err) }, 'Notification system not available')
    }
  }
}
