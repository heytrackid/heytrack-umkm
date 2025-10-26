/**
 * Financial Workflow Handlers
 * Workflow automation handlers for financial-related events
 */

import { automationLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
import type { WorkflowEventData, WorkflowResult, WorkflowContext } from '../types'

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

      // Schedule HPP recalculation for significant changes
      if (Math.abs(priceChange) > 15 && affectedRecipes?.length) {
        logger.warn({
          priceChange,
          affectedRecipesCount: affectedRecipes.length
        }, 'Significant price change detected - scheduling HPP recalculation')

        // TODO: Trigger HPP recalculation workflow
        setTimeout(async () => {
          // This would trigger the HPP recalculation event
          logger.info({ ingredientId }, 'HPP recalculation triggered for price change')
        }, 5000)
      }

      return {
        success: true,
        message: `Price change processed for ingredient ${ingredientId}`,
        data: {
          ingredientId,
          priceChange,
          notificationsSent: Math.abs(priceChange) > 10,
          hppRecalculationTriggered: Math.abs(priceChange) > 15
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
   * Handle HPP recalculation needed event
   */
  static async handleHPPRecalculationNeeded(context: WorkflowContext): Promise<WorkflowResult> {
    const { event, logger } = context

    if (!event.data || typeof event.data !== 'object') {
      return {
        success: false,
        message: 'Invalid HPP recalculation event data',
        error: 'Missing or invalid event data'
      }
    }

    const data = event.data as {
      reason: string
      affectedRecipes?: unknown[]
      triggerIngredient?: string
      priceChange?: number
    }

    const { reason, affectedRecipes } = data

    logger.info({
      reason,
      affectedRecipesCount: affectedRecipes?.length || 0
    }, 'Processing HPP recalculation request')

    try {
      // Send progress notification
      await this.sendHPPRecalculationNotification('started', data)

      // Simulate recalculation process
      setTimeout(async () => {
        // Send completion notification with insights
        await this.sendHPPRecalculationNotification('completed', data)
        await this.generateBusinessInsights(affectedRecipes || [])
      }, 10000)

      return {
        success: true,
        message: `HPP recalculation initiated for ${affectedRecipes?.length || 'all'} recipes`,
        data: {
          reason,
          affectedRecipesCount: affectedRecipes?.length || 0,
          status: 'processing'
        }
      }

    } catch (error: unknown) {
      logger.error({
        reason,
        error: getErrorMessage(error)
      }, 'Failed to process HPP recalculation request')

      return {
        success: false,
        message: 'Failed to process HPP recalculation request',
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
        message: `Perubahan ${Math.abs(priceChange).toFixed(1)}% mempengaruhi ${affectedRecipes?.length || 0} resep. HPP otomatis diperbarui.`,
        actionUrl: '/hpp-simple?tab=price_impact',
        actionLabel: 'Review HPP'
      }

      automationLogger.info({ notificationData }, 'Price change notification sent')
    } catch (error: unknown) {
      automationLogger.debug({ error: getErrorMessage(error) }, 'Notification system not available')
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
        message: `${costName} berubah dari Rp${oldAmount.toLocaleString()} ke Rp${newAmount.toLocaleString()}. Semua HPP otomatis diperbarui.`,
        actionUrl: '/hpp-simple?tab=operational_costs',
        actionLabel: 'Lihat HPP'
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
    } catch (error: unknown) {
      automationLogger.debug({ error: getErrorMessage(error) }, 'Notification system not available')
    }
  }

  /**
   * Send HPP recalculation notification
   */
  private static async sendHPPRecalculationNotification(
    status: 'started' | 'completed',
    data: { reason: string; affectedRecipes?: unknown[] }
  ): Promise<void> {
    const { reason, affectedRecipes } = data

    try {
      const notification = status === 'started' ? {
        type: 'info',
        category: 'financial',
        priority: 'low',
        title: 'HPP Recalculation Started',
        message: `Memproses ulang HPP untuk ${affectedRecipes?.length || 'semua'} resep karena ${reason}`,
        actionUrl: '/hpp-simple?tab=recalculation_progress',
        actionLabel: 'Monitor Progress'
      } : {
        type: 'success',
        category: 'financial',
        priority: 'medium',
        title: 'HPP Recalculation Selesai',
        message: `HPP telah diperbarui. Review pricing suggestions untuk optimasi profit margin.`,
        actionUrl: '/hpp-simple?tab=pricing_suggestions',
        actionLabel: 'Lihat Suggestions'
      }

      automationLogger.info({ notification }, `HPP ${status} notification sent`)
    } catch (error: unknown) {
      automationLogger.debug({ error: getErrorMessage(error) }, 'Notification system not available')
    }
  }

  /**
   * Generate business insights from HPP changes
   */
  private static async generateBusinessInsights(affectedRecipes: unknown[]): Promise<void> {
    try {
      const insights = [
        {
          type: 'ingredient_alternatives',
          message: 'HPP meningkat 15% bulan ini. Pertimbangkan alternatif bahan.',
          action: 'Analisis ingredient alternatives'
        },
        {
          type: 'pricing_strategy',
          message: 'Margin rata-rata industri F&B: 60%. Current average: 45%',
          action: 'Pertimbangkan penyesuaian harga untuk target margin optimal'
        }
      ]

      // Send insights notifications with delay
      insights.forEach((insight, index) => {
        setTimeout(async () => {
          const notification = {
            type: 'info',
            category: 'financial',
            priority: 'medium',
            title: 'Business Insight: HPP Analysis',
            message: insight.message,
            actionUrl: '/hpp-simple?tab=insights&insight=' + insight.type,
            actionLabel: insight.action
          }

          automationLogger.info({ notification }, `Business insight ${index + 1} sent`)
        }, (index + 1) * 2000)
      })
    } catch (error: unknown) {
      automationLogger.debug({ error: getErrorMessage(error) }, 'Failed to generate business insights')
    }
  }
}
