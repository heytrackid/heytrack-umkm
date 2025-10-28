import { dbLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase-generated'

type Ingredient = Database['public']['Tables']['ingredients']['Row']
type StockTransaction = Database['public']['Tables']['stock_transactions']['Row']

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

export class WacEngineService {
  private logger = dbLogger
  private supabase = createClient()

  /**
   * Calculate current WAC for an ingredient based on all purchase transactions
   */
  async calculateIngredientWac(ingredientId: string): Promise<WacCalculation | null> {
    try {
      this.logger.info(`Calculating WAC for ingredient ${ingredientId}`)

      // Get all purchase transactions for this ingredient, ordered by date
      const { data: transactions, error } = await this.supabase
        .from('stock_transactions')
        .select('*')
        .eq('ingredient_id', ingredientId)
        .eq('type', 'PURCHASE')
        .order('transaction_date', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`)
      }

      if (!transactions || transactions.length === 0) {
        this.logger.info(`No purchase transactions found for ingredient ${ingredientId}`)
        return null
      }

      // Calculate running WAC using FIFO method
      let runningQuantity = 0
      let runningValue = 0

      for (const transaction of transactions) {
        const quantity = Number(transaction.quantity)
        const unitPrice = Number(transaction.unit_price)
        const totalValue = Number(transaction.total_value) || (quantity * unitPrice)

        // Add to running totals
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

      this.logger.info(`WAC calculated for ingredient ${ingredientId}: ${currentWac}`)
      return result

    } catch (err: unknown) {
      this.logger.error({ error: err }, `Failed to calculate WAC for ingredient ${ingredientId}`)
      throw err
    }
  }

  /**
   * Update WAC when a new purchase is recorded
   */
  async updateWacOnPurchase(ingredientId: string, newQuantity: number, unitPrice: number): Promise<WacUpdateResult | null> {
    try {
      this.logger.info(`Updating WAC for ingredient ${ingredientId} with new purchase`)

      // Get current WAC
      const currentWac = await this.calculateIngredientWac(ingredientId)
      const oldWac = currentWac?.currentWac || 0

      // Calculate new WAC with the additional purchase
      const purchaseValue = newQuantity * unitPrice
      const newTotalQuantity = (currentWac?.totalQuantity || 0) + newQuantity
      const newTotalValue = (currentWac?.totalValue || 0) + purchaseValue
      const newWac = newTotalQuantity > 0 ? newTotalValue / newTotalQuantity : 0

      const result: WacUpdateResult = {
        ingredientId,
        oldWac,
        newWac,
        adjustment: newWac - oldWac,
        reason: 'New purchase transaction'
      }

      // Update ingredient's price_per_unit with new WAC if it differs significantly
      await this.updateIngredientPriceIfNeeded(ingredientId, oldWac, newWac)

      this.logger.info(`WAC updated for ingredient ${ingredientId}: ${oldWac} -> ${newWac}`)
      return result

    } catch (err: unknown) {
      this.logger.error({ error: err }, `Failed to update WAC for ingredient ${ingredientId}`)
      throw err
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
        results[id] = wacResults[index]
      })

      return results

    } catch (err: unknown) {
      this.logger.error({ error: err }, 'Failed to get batch WAC calculations')
      throw err
    }
  }

  /**
   * Update ingredient price if WAC differs significantly from current price
   */
  private async updateIngredientPriceIfNeeded(
    ingredientId: string,
    oldWac: number,
    newWac: number
  ): Promise<void> {
    try {
      // Get current ingredient price
      const { data: ingredient, error } = await this.supabase
        .from('ingredients')
        .select('price_per_unit')
        .eq('id', ingredientId)
        .single()

      if (error || !ingredient) {
        this.logger.warn(`Could not fetch ingredient ${ingredientId} for price update`)
        return
      }

      const currentPrice = Number(ingredient.price_per_unit)

      // Update price if WAC differs by more than 5%
      const priceDifference = Math.abs(newWac - currentPrice)
      const percentageDifference = currentPrice > 0 ? (priceDifference / currentPrice) * 100 : 100

      if (percentageDifference >= 5) {
        const { error: updateError } = await this.supabase
          .from('ingredients')
          .update({
            price_per_unit: newWac,
            updated_at: new Date().toISOString()
          })
          .eq('id', ingredientId)

        if (updateError) {
          this.logger.error({ err: updateError }, `Failed to update price for ingredient ${ingredientId}`)
        } else {
          this.logger.info(`Updated ingredient ${ingredientId} price from ${currentPrice} to ${newWac} (WAC change)`)
        }
      }

    } catch (err: unknown) {
      this.logger.error({ error: err }, `Failed to update ingredient price for ${ingredientId}`)
    }
  }

  /**
   * Recalculate WAC for all ingredients (useful for data migration or corrections)
   */
  async recalculateAllWac(): Promise<void> {
    try {
      this.logger.info('Starting WAC recalculation for all ingredients')

      // Get all ingredients
      const { data: ingredients, error } = await this.supabase
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
        this.calculateIngredientWac(ingredient.id).then(wac => {
          if (wac) {
            return this.updateIngredientPriceIfNeeded(ingredient.id, 0, wac.currentWac)
          }
        })
      )

      await Promise.all(promises)

      this.logger.info(`WAC recalculated for ${ingredients.length} ingredients`)

    } catch (err: unknown) {
      this.logger.error({ error: err }, 'Failed to recalculate all WAC values')
      throw err
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
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data: transactions, error } = await this.supabase
        .from('stock_transactions')
        .select('id, transaction_date, unit_price, quantity, total_value')
        .eq('ingredient_id', ingredientId)
        .eq('type', 'PURCHASE')
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .order('transaction_date', { ascending: true })

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
        const quantity = Number(transaction.quantity)
        const totalValue = Number(transaction.total_value) || (quantity * Number(transaction.unit_price))

        runningQuantity += quantity
        runningValue += totalValue

        const wac = runningQuantity > 0 ? runningValue / runningQuantity : 0

        history.push({
          date: transaction.transaction_date,
          wac,
          transactionId: transaction.id
        })
      }

      return history

    } catch (err: unknown) {
      this.logger.error({ error: err }, `Failed to get WAC history for ingredient ${ingredientId}`)
      throw err
    }
  }
}
