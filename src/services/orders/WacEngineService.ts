import { dbLogger } from '@/lib/logger'
import type { Database } from '@/types/database'
import { createClient } from '@/utils/supabase/server'
import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

const normalizeError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error))

// Use type instead of interface for consistency
interface WacCalculation {
  ingredientId: string
  currentWac: number
  totalQuantity: number
  totalValue: number
  lastUpdated: string
}

interface WacUpdateResult {
  ingredientId: string
  oldWac: number
  newWac: number
  adjustment: number
  reason: string
}

/**
 * WAC (Weighted Average Cost) Engine Service
 * SERVER-ONLY: Uses server client for database operations
 */
export class WacEngineService {
  private readonly logger = dbLogger
  private supabase: SupabaseClient<Database> | null = null

  private async getSupabase(): Promise<SupabaseClient<Database>> {
    if (!this.supabase) {
      this.supabase = await createClient()
    }
    return this.supabase!
  }

  /**
   * Calculate current WAC for an ingredient based on all purchase transactions
   */
  async calculateIngredientWac(ingredientId: string): Promise<WacCalculation | null> {
    try {
      this.logger.info({ ingredientId }, 'Calculating WAC for ingredient')

      const supabase = await this.getSupabase()

      // Get all purchase transactions for this ingredient, ordered by date
      const { data: transactions, error } = await supabase
        .from('stock_transactions')
        .select('quantity, unit_price, total_price')
        .eq('ingredient_id', ingredientId)
        .eq('type', 'PURCHASE')
        .order('created_at', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`)
      }

      if (!transactions || transactions.length === 0) {
        this.logger.info({ ingredientId }, 'No purchase transactions found for ingredient')
        return null
      }

      // Calculate running WAC using FIFO method
      let runningQuantity = 0
      let runningValue = 0

      for (const transaction of transactions) {
        const quantityRaw = Number(transaction.quantity)
        const quantity = Number.isFinite(quantityRaw) ? quantityRaw : 0
        const unitPriceRaw = Number(transaction.unit_price)
        const unitPrice = Number.isFinite(unitPriceRaw) ? unitPriceRaw : 0
        const totalPriceRaw = Number(transaction.total_price)
        const totalValue = Number.isFinite(totalPriceRaw) ? totalPriceRaw : quantity * unitPrice

        runningQuantity += quantity
        runningValue += totalValue
      }

      const currentWac = runningQuantity > 0 ? runningValue / runningQuantity : 0

      const result: WacCalculation = {
        ingredientId,
        currentWac,
        totalQuantity: runningQuantity,
        totalValue: runningValue,
        lastUpdated: new Date().toISOString()
      }

      this.logger.info({ ingredientId, currentWac }, 'WAC calculated for ingredient')
      return result

    } catch (error) {
      const normalizedError = normalizeError(error)
      this.logger.error({ error: normalizedError }, `Failed to calculate WAC for ingredient ${ingredientId}`)
      throw normalizedError
    }
  }

  /**
   * Update WAC when a new purchase is recorded
   */
  async updateWacOnPurchase(ingredientId: string, newQuantity: number, unitPrice: number): Promise<WacUpdateResult | null> {
    try {
      this.logger.info({ ingredientId }, 'Updating WAC for ingredient with new purchase')

      // Get current WAC
      const currentWac = await this.calculateIngredientWac(ingredientId)
      const oldWac = currentWac?.currentWac ?? 0

      // Calculate new WAC with the additional purchase
      const purchaseValue = newQuantity * unitPrice
      const newTotalQuantity = (currentWac?.totalQuantity ?? 0) + newQuantity
      const newTotalValue = (currentWac?.totalValue ?? 0) + purchaseValue
      const newWac = newTotalQuantity > 0 ? newTotalValue / newTotalQuantity : 0

      const result: WacUpdateResult = {
        ingredientId,
        oldWac,
        newWac,
        adjustment: newWac - oldWac,
        reason: 'New purchase transaction'
      }

      // Update ingredient's price_per_unit with new WAC if it differs significantly
      await this.updateIngredientPriceIfNeeded(ingredientId, newWac)

      this.logger.info({ ingredientId, oldWac, newWac }, 'WAC updated for ingredient')
      return result

    } catch (error) {
      const normalizedError = normalizeError(error)
      this.logger.error({ error: normalizedError }, `Failed to update WAC for ingredient ${ingredientId}`)
      throw normalizedError
    }
  }

  /**
   * Get WAC for multiple ingredients at once
   */
  async getBatchWac(ingredientIds: string[]): Promise<Record<string, WacCalculation | null>> {
    try {
      const results: Record<string, WacCalculation | null> = {}

      // Calculate WAC for each ingredient
      const promises = ingredientIds.map(id => this.calculateIngredientWac(id))
      const wacResults = await Promise.all(promises)

      // Map results to ingredient IDs
      ingredientIds.forEach((id, index) => {
        results[id] = wacResults[index] ?? null
      })

      return results

    } catch (error) {
      const normalizedError = normalizeError(error)
      this.logger.error({ error: normalizedError }, 'Failed to get batch WAC calculations')
      throw normalizedError
    }
  }

  /**
   * Update ingredient price if WAC differs significantly from current price
   */
  private async updateIngredientPriceIfNeeded(
    ingredientId: string,
    newWac: number
  ): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      
      // Get current ingredient price
      const { data: ingredient, error } = await supabase
        .from('ingredients')
        .select('price_per_unit')
        .eq('id', ingredientId)
        .single()

      if (error || !ingredient) {
        this.logger.warn({ ingredientId }, 'Could not fetch ingredient for price update')
        return
      }

      const currentPrice = Number(ingredient.price_per_unit)

      // Update price if WAC differs by more than 5%
      const priceDifference = Math.abs(newWac - currentPrice)
      const percentageDifference = currentPrice > 0 ? (priceDifference / currentPrice) * 100 : 100

      if (percentageDifference >= 5) {
        const { error: updateError } = await supabase
          .from('ingredients')
          .update({
            price_per_unit: newWac,
            updated_at: new Date().toISOString()
          })
          .eq('id', ingredientId)

        if (updateError) {
          this.logger.error({ error: updateError }, `Failed to update price for ingredient ${ingredientId}`)
        } else {
          this.logger.info(`Updated ingredient ${ingredientId} price from ${currentPrice} to ${newWac} (WAC change)`)
        }
      }

    } catch (error) {
      const normalizedError = normalizeError(error)
      this.logger.error({ error: normalizedError }, `Failed to update ingredient price for ${ingredientId}`)
    }
  }

  /**
   * Recalculate WAC for all ingredients (useful for data migration or corrections)
   */
  async recalculateAllWac(): Promise<void> {
    try {
      this.logger.info('Starting WAC recalculation for all ingredients')

      const supabase = await this.getSupabase()

      // Get all ingredients
      const { data: ingredients, error } = await supabase
        .from('ingredients')
        .select('id')
        .eq('is_active', true)

      if (error) {
        throw new Error(`Failed to fetch ingredients: ${error.message}`)
      }

      if (!ingredients || ingredients.length === 0) {
        this.logger.info('No active ingredients found')
        return
      }

      // Recalculate WAC for each ingredient
      const promises = ingredients.map(ingredient =>
        this.calculateIngredientWac(ingredient['id']).then(wac => {
          if (wac) {
            return this.updateIngredientPriceIfNeeded(ingredient['id'], wac.currentWac)
          }
          return Promise.resolve()
        })
      )

      await Promise.all(promises)

      this.logger.info(`WAC recalculated for ${ingredients.length} ingredients`)

    } catch (error) {
      const normalizedError = normalizeError(error)
      this.logger.error({ error: normalizedError }, 'Failed to recalculate all WAC values')
      throw normalizedError
    }
  }

  /**
   * Get WAC history for an ingredient over time
   */
  async getWacHistory(ingredientId: string, days = 30): Promise<Array<{
    date: string
    wac: number
    transactionId: string
  }>> {
    try {
      const supabase = await this.getSupabase()
      
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data: transactions, error } = await supabase
        .from('stock_transactions')
        .select('id, created_at, unit_price, quantity, total_price')
        .eq('ingredient_id', ingredientId)
        .eq('type', 'PURCHASE')
        .gte('created_at', startDate.toISOString().split('T')[0])
        .order('created_at', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch WAC history: ${error.message}`)
      }

      if (!transactions || transactions.length === 0) {
        return []
      }

      // Calculate WAC at each transaction point
      const history: Array<{
        date: string
        wac: number
        transactionId: string
      }> = []

      let runningQuantity = 0
      let runningValue = 0

      for (const transaction of transactions) {
        const quantityRaw = Number(transaction.quantity)
        const quantity = Number.isFinite(quantityRaw) ? quantityRaw : 0
        const unitPriceRaw = Number(transaction.unit_price)
        const unitPrice = Number.isFinite(unitPriceRaw) ? unitPriceRaw : 0
        const totalPriceRaw = Number(transaction.total_price)
        const totalValue = Number.isFinite(totalPriceRaw) ? totalPriceRaw : quantity * unitPrice

        runningQuantity += quantity
        runningValue += totalValue

        const wac = runningQuantity > 0 ? runningValue / runningQuantity : 0

        history.push({
          date: transaction.created_at ?? new Date().toISOString(),
          wac,
          transactionId: transaction['id']
        })
      }

      return history

    } catch (error) {
      const normalizedError = normalizeError(error)
      this.logger.error({ error: normalizedError }, `Failed to get WAC history for ingredient ${ingredientId}`)
      throw normalizedError
    }
  }
}
