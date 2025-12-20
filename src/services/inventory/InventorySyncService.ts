/**
 * Inventory Sync Service
 * Handles automatic stock updates and WAC calculations
 * 
 * ✅ STANDARDIZED: Extends BaseService, uses ServiceContext
 */

import { dbLogger } from '@/lib/logger'
import { BaseService, type ServiceContext } from '@/services/base'
import type { Database } from '@/types/database'

type StockTransactionType = Database['public']['Enums']['transaction_type']

export interface StockUpdateResult {
  ingredient_id: string
  previous_stock: number
  new_stock: number
  previous_wac: number
  new_wac: number
  transaction_id?: string | null
}

export class InventorySyncService extends BaseService {
  private readonly logger = dbLogger

  constructor(context: ServiceContext) {
    super(context)
  }

  /**
   * Reverse stock update when purchase is deleted
   * Deducts the quantity that was added and recalculates WAC
   */
  async reverseStockFromPurchase(
    ingredientId: string,
    quantity: number,
    unitPrice: number,
    reference?: string
  ): Promise<StockUpdateResult> {
    return this.executeWithAudit(
      async () => {
        // Get current ingredient data
        const { data: ingredient, error: fetchError } = await this.context.supabase
          .from('ingredients')
          .select('id, name, current_stock, weighted_average_cost, price_per_unit')
          .eq('id', ingredientId)
          .eq('user_id', this.context.userId)
          .single()

        if (fetchError || !ingredient) {
          throw new Error(`Ingredient not found: ${ingredientId}`)
        }

        const previousStock = Number(ingredient.current_stock ?? 0)
        const previousWac = Number(ingredient.weighted_average_cost ?? ingredient.price_per_unit ?? 0)

        // Deduct the quantity that was added by the purchase
        const newStock = Math.max(0, previousStock - quantity)

        // Recalculate WAC by removing the contribution of the reversed purchase
        // Reverse the weighted average formula: remove the purchase's contribution
        const totalOldValue = previousStock * previousWac
        const purchaseValueToRemove = quantity * unitPrice
        const newTotalValue = Math.max(0, totalOldValue - purchaseValueToRemove)
        const newWac = newStock > 0
          ? newTotalValue / newStock
          : (previousWac || unitPrice) // Fallback to previous WAC or purchase price

        // Update ingredient stock and WAC
        const { error: updateError } = await this.context.supabase
          .from('ingredients')
          .update({
            current_stock: newStock,
            weighted_average_cost: newWac,
            updated_at: new Date().toISOString(),
            updated_by: this.context.userId
          })
          .eq('id', ingredientId)
          .eq('user_id', this.context.userId)

        if (updateError) {
          throw new Error(`Failed to reverse ingredient stock: ${updateError.message}`)
        }

        // Create stock transaction record for the reversal
        const { data: transaction, error: txError } = await this.context.supabase
          .from('stock_transactions')
          .insert({
            user_id: this.context.userId,
            ingredient_id: ingredientId,
            type: 'ADJUSTMENT' as StockTransactionType,
            quantity: -quantity, // Negative for reversal
            unit_price: previousWac,
            total_price: quantity * previousWac,
            reference: reference ? `Purchase Deleted: ${reference}` : `Purchase reversal - ${new Date().toISOString()}`,
            notes: `Stock reversed from ${previousStock} to ${newStock} due to purchase deletion`,
            created_by: this.context.userId
          })
          .select('id')
          .single()

        if (txError) {
          this.logger.warn({ error: txError }, 'Failed to create stock reversal transaction record')
        }

        // Create stock log entry
        await this.context.supabase
          .from('inventory_stock_logs')
          .insert({
            ingredient_id: ingredientId,
            change_type: 'ADJUSTMENT',
            quantity_before: previousStock,
            quantity_changed: -quantity,
            quantity_after: newStock,
            reason: 'Purchase deleted - stock reversed',
            reference_type: 'ingredient_purchase',
            reference_id: reference ?? null,
            triggered_by: this.context.userId,
            metadata: {
              action: 'purchase_deletion_reversal'
            }
          })

        this.logger.info({
          ingredientId,
          ingredientName: ingredient.name,
          previousStock,
          newStock,
          quantityReversed: quantity
        }, 'Stock reversed from purchase deletion')

        return {
          ingredient_id: ingredientId,
          previous_stock: previousStock,
          new_stock: newStock,
          previous_wac: previousWac,
          new_wac: newWac,
          transaction_id: transaction?.id ?? null
        }
      },
      'UPDATE',
      'INGREDIENT',
      ingredientId,
      { action: 'stock_reversal_from_purchase_deletion', quantity }
    )
  }

  /**
   * Update stock after purchase and recalculate WAC
   * WAC Formula: (Old Stock × Old WAC + New Qty × New Price) / (Old Stock + New Qty)
   */
  async updateStockFromPurchase(
    ingredientId: string,
    quantity: number,
    unitPrice: number,
    reference?: string
  ): Promise<StockUpdateResult> {
    return this.executeWithAudit(
      async () => {
        // Get current ingredient data
        const { data: ingredient, error: fetchError } = await this.context.supabase
          .from('ingredients')
          .select('id, name, current_stock, weighted_average_cost, price_per_unit')
          .eq('id', ingredientId)
          .eq('user_id', this.context.userId)
          .single()

        if (fetchError || !ingredient) {
          throw new Error(`Ingredient not found: ${ingredientId}`)
        }

        const previousStock = Number(ingredient.current_stock ?? 0)
        const previousWac = Number(ingredient.weighted_average_cost ?? ingredient.price_per_unit ?? 0)

        // Calculate new WAC using weighted average formula
        // No spoilage adjustment needed here since waste_factor is handled in HPP calculations
        const totalOldValue = previousStock * previousWac
        const totalNewValue = quantity * unitPrice
        const newTotalStock = previousStock + quantity
        const newWac = newTotalStock > 0
          ? (totalOldValue + totalNewValue) / newTotalStock
          : unitPrice

        // Update ingredient stock and WAC
        const { error: updateError } = await this.context.supabase
          .from('ingredients')
          .update({
            current_stock: newTotalStock,
            weighted_average_cost: newWac,
            price_per_unit: unitPrice, // Update latest price
            last_purchase_date: new Date().toISOString().split('T')[0] ?? null,
            updated_at: new Date().toISOString(),
            updated_by: this.context.userId
          })
          .eq('id', ingredientId)
          .eq('user_id', this.context.userId)

        if (updateError) {
          throw new Error(`Failed to update ingredient stock: ${updateError.message}`)
        }

        // Create stock transaction record
        const { data: transaction, error: txError } = await this.context.supabase
          .from('stock_transactions')
          .insert({
            user_id: this.context.userId,
            ingredient_id: ingredientId,
            type: 'PURCHASE' as StockTransactionType,
            quantity: quantity,
            unit_price: unitPrice,
            total_price: quantity * unitPrice,
            reference: reference ?? `Purchase - ${new Date().toISOString()}`,
            notes: `Stock updated from ${previousStock} to ${newTotalStock}. WAC: ${previousWac.toFixed(2)} → ${newWac.toFixed(2)}`,
            created_by: this.context.userId
          })
          .select('id')
          .single()

        if (txError) {
          this.logger.warn({ error: txError }, 'Failed to create stock transaction record')
        }

        // Create stock log entry
        await this.context.supabase
          .from('inventory_stock_logs')
          .insert({
            ingredient_id: ingredientId,
            change_type: 'PURCHASE',
            quantity_before: previousStock,
            quantity_changed: quantity,
            quantity_after: newTotalStock,
            reason: 'Purchase received',
            reference_type: 'ingredient_purchase',
            reference_id: reference ?? null,
            triggered_by: this.context.userId,
            metadata: {
              unit_price: unitPrice,
              previous_wac: previousWac,
              new_wac: newWac
            }
          })

        this.logger.info({
          ingredientId,
          ingredientName: ingredient.name,
          previousStock,
          newStock: newTotalStock,
          previousWac,
          newWac,
          quantity,
          unitPrice
        }, 'Stock updated from purchase')

        return {
          ingredient_id: ingredientId,
          previous_stock: previousStock,
          new_stock: newTotalStock,
          previous_wac: previousWac,
          new_wac: newWac,
          transaction_id: transaction?.id ?? null
        }
      },
      'UPDATE',
      'INGREDIENT',
      ingredientId,
      { action: 'stock_update_from_purchase', quantity, unitPrice }
    )
  }

  /**
   * Deduct stock for production usage
   */
  async deductStockForProduction(
    ingredientId: string,
    quantity: number,
    productionId: string,
    recipeName?: string
  ): Promise<StockUpdateResult> {
    return this.executeWithAudit(
      async () => {
        // Get current ingredient data
        const { data: ingredient, error: fetchError } = await this.context.supabase
          .from('ingredients')
          .select('id, name, current_stock, weighted_average_cost')
          .eq('id', ingredientId)
          .eq('user_id', this.context.userId)
          .single()

        if (fetchError || !ingredient) {
          throw new Error(`Ingredient not found: ${ingredientId}`)
        }

        const previousStock = Number(ingredient.current_stock ?? 0)
        const wac = Number(ingredient.weighted_average_cost ?? 0)

        if (previousStock < quantity) {
          this.logger.warn({
            ingredientId,
            ingredientName: ingredient.name,
            required: quantity,
            available: previousStock
          }, 'Insufficient stock for production')
          // Continue anyway but log warning - business may allow negative stock
        }

        const newStock = previousStock - quantity

        // Update ingredient stock
        const { error: updateError } = await this.context.supabase
          .from('ingredients')
          .update({
            current_stock: newStock,
            updated_at: new Date().toISOString(),
            updated_by: this.context.userId
          })
          .eq('id', ingredientId)
          .eq('user_id', this.context.userId)

        if (updateError) {
          throw new Error(`Failed to deduct ingredient stock: ${updateError.message}`)
        }

        // Create stock transaction record
        await this.context.supabase
          .from('stock_transactions')
          .insert({
            user_id: this.context.userId,
            ingredient_id: ingredientId,
            type: 'USAGE' as StockTransactionType,
            quantity: -quantity, // Negative for usage
            unit_price: wac,
            total_price: quantity * wac,
            reference: `Production ${productionId}${recipeName ? ` - ${recipeName}` : ''}`,
            notes: `Stock deducted for production. ${previousStock} → ${newStock}`,
            created_by: this.context.userId
          })

        // Create stock log entry
        await this.context.supabase
          .from('inventory_stock_logs')
          .insert({
            ingredient_id: ingredientId,
            change_type: 'USAGE',
            quantity_before: previousStock,
            quantity_changed: -quantity,
            quantity_after: newStock,
            reason: `Production: ${recipeName ?? productionId}`,
            reference_type: 'production',
            reference_id: productionId,
            triggered_by: this.context.userId
          })

        this.logger.info({
          ingredientId,
          ingredientName: ingredient.name,
          previousStock,
          newStock,
          quantity,
          productionId
        }, 'Stock deducted for production')

        return {
          ingredient_id: ingredientId,
          previous_stock: previousStock,
          new_stock: newStock,
          previous_wac: wac,
          new_wac: wac // WAC doesn't change on usage
        }
      },
      'UPDATE',
      'INGREDIENT',
      ingredientId,
      { action: 'stock_deduction_for_production', quantity, productionId }
    )
  }

  /**
   * Batch deduct stock for all ingredients in a recipe
   */
  async deductStockForRecipeProduction(
    recipeId: string,
    productionId: string,
    multiplier: number = 1
  ): Promise<StockUpdateResult[]> {
    // Get recipe ingredients
    const { data: recipeIngredients, error } = await this.context.supabase
      .from('recipe_ingredients')
      .select(`
        ingredient_id,
        quantity,
        ingredients:ingredient_id (name)
      `)
      .eq('recipe_id', recipeId)
      .eq('user_id', this.context.userId)

    if (error || !recipeIngredients) {
      throw new Error(`Failed to fetch recipe ingredients: ${error?.message}`)
    }

    // Get recipe name
    const { data: recipe } = await this.context.supabase
      .from('recipes')
      .select('name')
      .eq('id', recipeId)
      .single()

    const results: StockUpdateResult[] = []

    for (const ri of recipeIngredients) {
      try {
        const ingredientData = ri.ingredients as { name: string } | null
        const result = await this.deductStockForProduction(
          ri.ingredient_id,
          Number(ri.quantity) * multiplier,
          productionId,
          recipe?.name ?? ingredientData?.name
        )
        results.push(result)
      } catch (err) {
        this.logger.error({ error: err, ingredientId: ri.ingredient_id }, 'Failed to deduct stock for ingredient')
        // Continue with other ingredients
      }
    }

    return results
  }

  /**
   * Adjust stock manually (for corrections, waste, etc.)
   */
  async adjustStock(
    ingredientId: string,
    adjustment: number,
    reason: string,
    adjustmentType: 'ADJUSTMENT' | 'WASTE' = 'ADJUSTMENT'
  ): Promise<StockUpdateResult> {
    return this.executeWithAudit(
      async () => {
        const { data: ingredient, error: fetchError } = await this.context.supabase
          .from('ingredients')
          .select('id, name, current_stock, weighted_average_cost')
          .eq('id', ingredientId)
          .eq('user_id', this.context.userId)
          .single()

        if (fetchError || !ingredient) {
          throw new Error(`Ingredient not found: ${ingredientId}`)
        }

        const previousStock = Number(ingredient.current_stock ?? 0)
        const wac = Number(ingredient.weighted_average_cost ?? 0)
        const newStock = previousStock + adjustment

        const { error: updateError } = await this.context.supabase
          .from('ingredients')
          .update({
            current_stock: Math.max(0, newStock), // Prevent negative stock
            updated_at: new Date().toISOString(),
            updated_by: this.context.userId
          })
          .eq('id', ingredientId)
          .eq('user_id', this.context.userId)

        if (updateError) {
          throw new Error(`Failed to adjust stock: ${updateError.message}`)
        }

        // Create stock transaction
        await this.context.supabase
          .from('stock_transactions')
          .insert({
            user_id: this.context.userId,
            ingredient_id: ingredientId,
            type: adjustmentType as StockTransactionType,
            quantity: adjustment,
            unit_price: wac,
            total_price: Math.abs(adjustment) * wac,
            reference: reason,
            notes: `Manual adjustment: ${previousStock} → ${newStock}`,
            created_by: this.context.userId
          })

        // Create stock log
        await this.context.supabase
          .from('inventory_stock_logs')
          .insert({
            ingredient_id: ingredientId,
            change_type: adjustmentType,
            quantity_before: previousStock,
            quantity_changed: adjustment,
            quantity_after: Math.max(0, newStock),
            reason,
            triggered_by: this.context.userId
          })

        return {
          ingredient_id: ingredientId,
          previous_stock: previousStock,
          new_stock: Math.max(0, newStock),
          previous_wac: wac,
          new_wac: wac
        }
      },
      'UPDATE',
      'INGREDIENT',
      ingredientId,
      { action: 'stock_adjustment', adjustment, reason, adjustmentType }
    )
  }

  /**
   * Deduct stock for order fulfillment
   * Called when order status changes to DELIVERED
   */
  async deductStockForOrder(
    recipeId: string,
    orderId: string,
    quantity: number
  ): Promise<StockUpdateResult[]> {
    // Get recipe ingredients
    const { data: recipeIngredients, error } = await this.context.supabase
      .from('recipe_ingredients')
      .select(`
        ingredient_id,
        quantity,
        ingredients:ingredient_id (name)
      `)
      .eq('recipe_id', recipeId)
      .eq('user_id', this.context.userId)

    if (error || !recipeIngredients) {
      throw new Error(`Failed to fetch recipe ingredients: ${error?.message}`)
    }

    // Get recipe name
    const { data: recipe } = await this.context.supabase
      .from('recipes')
      .select('name')
      .eq('id', recipeId)
      .single()

    const results: StockUpdateResult[] = []

    for (const ri of recipeIngredients) {
      try {
        const ingredientData = ri.ingredients as { name: string } | null
        const result = await this.deductStockForProduction(
          ri.ingredient_id,
          Number(ri.quantity) * quantity,
          orderId,
          `Order - ${recipe?.name ?? ingredientData?.name}`
        )
        results.push(result)
      } catch (err) {
        this.logger.error({ error: err, ingredientId: ri.ingredient_id }, 'Failed to deduct stock for order')
        // Continue with other ingredients
      }
    }

    return results
  }

  /**
   * Restore stock when order is cancelled after being delivered
   */
  async restoreStockForCancelledOrder(
    recipeId: string,
    orderId: string,
    quantity: number
  ): Promise<StockUpdateResult[]> {
    // Get recipe ingredients
    const { data: recipeIngredients, error } = await this.context.supabase
      .from('recipe_ingredients')
      .select(`
        ingredient_id,
        quantity,
        ingredients:ingredient_id (name)
      `)
      .eq('recipe_id', recipeId)
      .eq('user_id', this.context.userId)

    if (error || !recipeIngredients) {
      throw new Error(`Failed to fetch recipe ingredients: ${error?.message}`)
    }

    // Get recipe name
    const { data: recipe } = await this.context.supabase
      .from('recipes')
      .select('name')
      .eq('id', recipeId)
      .single()

    const results: StockUpdateResult[] = []

    for (const ri of recipeIngredients) {
      try {
        const ingredientData = ri.ingredients as { name: string } | null
        const quantityToRestore = Number(ri.quantity) * quantity
        
        // Use adjustStock to add back the quantity
        const result = await this.adjustStock(
          ri.ingredient_id,
          quantityToRestore, // Positive = add back
          `Order cancelled: ${recipe?.name ?? orderId} (restored ${quantityToRestore} units)`,
          'ADJUSTMENT'
        )
        results.push(result)
        
        this.logger.info({
          ingredientId: ri.ingredient_id,
          ingredientName: ingredientData?.name,
          quantityRestored: quantityToRestore,
          orderId
        }, 'Stock restored for cancelled order')
      } catch (err) {
        this.logger.error({ error: err, ingredientId: ri.ingredient_id }, 'Failed to restore stock for cancelled order')
        // Continue with other ingredients
      }
    }

    return results
  }

  /**
   * Restore stock when a completed production batch is cancelled
   * This reverses the deductions made during production completion
   */
  async restoreStockForCancelledProduction(
    recipeId: string,
    productionId: string,
    multiplier: number = 1
  ): Promise<StockUpdateResult[]> {
    // Get recipe ingredients
    const { data: recipeIngredients, error } = await this.context.supabase
      .from('recipe_ingredients')
      .select(`
        ingredient_id,
        quantity,
        ingredients:ingredient_id (name)
      `)
      .eq('recipe_id', recipeId)
      .eq('user_id', this.context.userId)

    if (error || !recipeIngredients) {
      throw new Error(`Failed to fetch recipe ingredients: ${error?.message}`)
    }

    // Get recipe name
    const { data: recipe } = await this.context.supabase
      .from('recipes')
      .select('name')
      .eq('id', recipeId)
      .single()

    const results: StockUpdateResult[] = []

    for (const ri of recipeIngredients) {
      try {
        const ingredientData = ri.ingredients as { name: string } | null
        const quantityToRestore = Number(ri.quantity) * multiplier
        
        // Use adjustStock to add back the quantity
        const result = await this.adjustStock(
          ri.ingredient_id,
          quantityToRestore, // Positive = add back
          `Production cancelled: ${recipe?.name ?? productionId} (restored ${quantityToRestore} units)`,
          'ADJUSTMENT'
        )
        results.push(result)
        
        this.logger.info({
          ingredientId: ri.ingredient_id,
          ingredientName: ingredientData?.name,
          quantityRestored: quantityToRestore,
          productionId
        }, 'Stock restored for cancelled production')
      } catch (err) {
        this.logger.error({ error: err, ingredientId: ri.ingredient_id }, 'Failed to restore stock for ingredient')
        // Continue with other ingredients
      }
    }

    return results
  }
}
