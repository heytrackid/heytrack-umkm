import { CacheInvalidator } from '@/lib/cache/cache-manager'
import { sendNotification } from '@/lib/communications/index'
import { automationLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'

import type {WorkflowResult, WorkflowContext } from '@/types/features/automation'

/**
 * Financial Workflow Handlers
 * Workflow automation handlers for financial-related events
 */


export class FinancialWorkflowHandlers {
  /**
   * Handle ingredient price change event
   */
  static handleIngredientPriceChanged(context: WorkflowContext): WorkflowResult {
    const { event, logger } = context

    if (!event['data'] || typeof event['data'] !== 'object') {
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

    logger.info('Processing ingredient price change', {
      ingredientId,
      oldPrice,
      newPrice,
      priceChange: priceChange.toFixed(2),
      affectedRecipesCount: affectedRecipes?.length ?? 0
    })

    try {
      // Generate smart notifications for significant changes
      if (Math.abs(priceChange) > 10) {
        this.sendPriceChangeNotification(data)
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
      logger.error('Failed to process ingredient price change', {
        ingredientId,
        error: getErrorMessage(error)
      })

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
  static handleOperationalCostChanged(context: WorkflowContext): WorkflowResult {
    const { event, logger } = context

    if (!event['data'] || typeof event['data'] !== 'object') {
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

    logger.info('Processing operational cost change', {
      costId,
      costName,
      oldAmount,
      newAmount
    })

    try {
      // Calculate impact
      const costChange = ((newAmount - oldAmount) / oldAmount) * 100

      // Send notifications
      this.sendCostChangeNotification(data, costChange)

      // Trigger pricing reviews for significant changes
      if (Math.abs(costChange) > 10) {
        logger.warn('Significant operational cost change detected', {
          costChange: costChange.toFixed(1)
        })

        this.triggerPricingReviewNotification(context, data, costChange)
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
      logger.error('Failed to process operational cost change', {
        costId,
        error: getErrorMessage(error)
      })

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
  private static sendPriceChangeNotification(data: {
    ingredientId: string
    oldPrice: number
    newPrice: number
    priceChange: number
    affectedRecipes?: string[]
  }): void {
    const { priceChange, affectedRecipes } = data

    try {
      const notificationData = {
        type: priceChange > 0 ? 'warning' : 'info',
        category: 'financial',
        priority: Math.abs(priceChange) > 20 ? 'critical' : 'high',
        title: `Harga Bahan Baku ${priceChange > 0 ? 'NAIK' : 'TURUN'} Signifikan`,
        message: `Perubahan ${Math.abs(priceChange).toFixed(1)}% mempengaruhi ${affectedRecipes?.length ?? 0} resep.`,
        actionUrl: '/ingredients',
        actionLabel: 'Review Bahan Baku'
      }

      sendNotification({
        ...notificationData,
        status: 'sent'
      })
      automationLogger.info({ notificationData }, 'Price change notification sent')
    } catch (error) {
      automationLogger.debug({ error: getErrorMessage(error) }, 'Notification system not available')
    }
  }

  /**
   * Send cost change notification
   */
  private static sendCostChangeNotification(
    data: { costId: string; costName: string; oldAmount: number; newAmount: number },
    costChange: number
  ): void {
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

        sendNotification({
          ...reviewNotification,
          status: 'sent'
        })
        automationLogger.info({ reviewNotification }, 'Pricing review notification sent')
      }

      sendNotification({
        ...generalNotification,
        status: 'sent'
      })
      automationLogger.info({ generalNotification }, 'Cost change notification sent')
    } catch (error) {
      automationLogger.debug({ error: getErrorMessage(error) }, 'Notification system not available')
    }
  }

  private static triggerPricingReviewNotification(
    context: WorkflowContext,
    data: { costId: string; costName: string; oldAmount: number; newAmount: number },
    costChange: number
  ): void {
    try {
      sendNotification({
        category: 'financial',
        priority: 'high',
        title: 'Perlu Review Harga Jual',
        message: `Biaya ${data.costName} berubah ${costChange.toFixed(1)}%. Pertimbangkan review harga.`,
        actionUrl: '/hpp-simple?tab=pricing_review',
        actionLabel: 'Mulai Review',
        status: 'sent',
        type: 'warning'
      })
      context.logger.info('Pricing review notification dispatched', {
        costId: data.costId,
        costChange
      })
    } catch (error) {
      context.logger.error('Failed to dispatch pricing review notification', {
        error: getErrorMessage(error)
      })
    }
  }

  /**
   * Handle HPP recalculation needed event
   */
  static handleHPPRecalculationNeeded(context: WorkflowContext): WorkflowResult {
    const { event, logger } = context

    try {
      logger.info({ eventData: event['data'] }, 'HPP recalculation workflow triggered')

      // Invalidate HPP caches
      const invalidator = new CacheInvalidator()
      invalidator.invalidate('HPP')
      void invalidator.execute()

      // Trigger HPP recalculation for affected recipes
      const eventData = typeof event['data'] === 'object' && event['data'] !== null
        ? event['data']
        : null
      const affectedRecipeIds = Array.isArray(eventData?.['affectedRecipeIds'])
        ? eventData['affectedRecipeIds']
        : undefined

      if (affectedRecipeIds && Array.isArray(affectedRecipeIds)) {
        logger.info({ affectedRecipes: affectedRecipeIds.length }, 'Triggering HPP recalculation for affected recipes')

        // Here you could trigger individual recipe HPP recalculations
        // For now, just log and invalidate caches
      }

      return {
        success: true,
        message: 'HPP recalculation workflow completed successfully',
        data: {
          cacheInvalidated: true,
          affectedRecipes: (affectedRecipeIds && Array.isArray(affectedRecipeIds)) ? affectedRecipeIds.length : 0
        }
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      logger.error({ error: errorMessage }, 'HPP recalculation workflow failed')

      return {
        success: false,
        message: 'HPP recalculation workflow failed',
        error: errorMessage
      }
    }
  }
}
