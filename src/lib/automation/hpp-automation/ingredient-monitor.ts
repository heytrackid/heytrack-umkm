/**
 * Ingredient Monitor Module
 * Monitors ingredient price changes and tracks price history
 */

import { automationLogger } from '@/lib/logger'
import type { PriceHistoryEntry, PriceMonitoringResult } from './types'

export class IngredientMonitor {
  private priceHistory: Map<string, PriceHistoryEntry[]> = new Map()

  /**
   * Track price history for an ingredient
   */
  trackPriceHistory(ingredientId: string, newPrice: number): void {
    const history = this.priceHistory.get(ingredientId) || []
    history.push({
      date: new Date().toISOString(),
      price: newPrice
    })

    // Keep only last 30 entries
    this.priceHistory.set(ingredientId, history.slice(-30))
  }

  /**
   * Get price history for an ingredient
   */
  getPriceHistory(ingredientId: string): PriceHistoryEntry[] {
    return this.priceHistory.get(ingredientId) || []
  }

  /**
   * Monitor ingredient prices for significant changes
   */
  monitorIngredientPrices(ingredients: Array<{ id: string; name: string; price_per_unit: number }>): PriceMonitoringResult {
    automationLogger.info({ count: ingredients.length }, 'Monitoring ingredient prices')

    const significantChanges: PriceMonitoringResult['significantChanges'] = []

    for (const ingredient of ingredients) {
      const history = this.priceHistory.get(ingredient.id) || []

      if (history.length > 0) {
        const lastPrice = history[history.length - 1].price
        const currentPrice = ingredient.price_per_unit
        const changePercent = ((currentPrice - lastPrice) / lastPrice) * 100

        if (Math.abs(changePercent) > 10) {
          significantChanges.push({
            ingredientId: ingredient.id,
            ingredientName: ingredient.name,
            oldPrice: lastPrice,
            newPrice: currentPrice,
            changePercent
          })
        }
      }

      // Update price history
      this.trackPriceHistory(ingredient.id, ingredient.price_per_unit)
    }

    return {
      monitoredIngredients: ingredients.length,
      significantChanges,
      lastCheck: new Date().toISOString()
    }
  }

  /**
   * Get latest price for an ingredient (placeholder - real implementation would fetch from DB)
   */
  async getLatestIngredientPrice(ingredientId: string): Promise<number> {
    // TODO: Implement real price fetching from database
    throw new Error('Ingredient price fetching not implemented yet')
  }

  /**
   * Check for ingredient price changes (placeholder for real-time monitoring)
   */
  async checkIngredientPriceChanges(): Promise<void> {
    // TODO: Check database for price updates
    automationLogger.info('Checking for ingredient price changes')
  }

  /**
   * Clear price history for an ingredient
   */
  clearPriceHistory(ingredientId: string): void {
    this.priceHistory.delete(ingredientId)
  }

  /**
   * Get all ingredients with price history
   */
  getAllIngredientsWithHistory(): Array<{ ingredientId: string; history: PriceHistoryEntry[] }> {
    const result: Array<{ ingredientId: string; history: PriceHistoryEntry[] }> = []

    for (const [ingredientId, history] of this.priceHistory) {
      result.push({ ingredientId, history })
    }

    return result
  }
}
