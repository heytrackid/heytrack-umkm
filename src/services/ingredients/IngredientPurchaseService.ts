import 'server-only'
import { dbLogger } from '@/lib/logger'
import type { Row, Insert } from '@/types/database'
import { typed } from '@/types/type-utilities'
import { createClient } from '@/utils/supabase/server'


type IngredientPurchase = Row<'ingredient_purchases'>
type IngredientPurchaseInsert = Insert<'ingredient_purchases'>

/**
 * Ingredient Purchase Service
 * Handles ingredient purchase operations including stock updates and financial transactions
 * SERVER-ONLY: Uses server client for database operations
 */
export class IngredientPurchaseService {
  /**
   * Create a new ingredient purchase with stock update and financial transaction
   */
  static async createPurchase(
    userId: string,
    purchaseData: {
      ingredient_id: string
      supplier: string
      quantity: number
      unit_price: number
      total_price: number
      purchase_date: string
      notes?: string
    }
  ): Promise<IngredientPurchase> {
    try {
      const client = await createClient()
      const supabase = typed(client)

      // Get ingredient info
      const { data: ingredient, error: ingredientError } = await supabase
        .from('ingredients')
        .select('id, name, unit, current_stock, price_per_unit, user_id')
        .eq('id', purchaseData.ingredient_id)
        .eq('user_id', userId)
        .single()

      if (ingredientError || !ingredient) {
        throw new Error('Ingredient not found')
      }

      // Create financial transaction (expense)
      const financialRecord: Insert<'financial_records'> = {
        user_id: userId,
        type: 'EXPENSE',
        category: 'Pembelian Bahan Baku',
        amount: purchaseData.total_price,
        description: `Pembelian: ${ingredient.name} (${purchaseData.quantity} ${ingredient.unit}) dari ${purchaseData.supplier}`,
        date: purchaseData.purchase_date
      }

      const { data: transaction, error: transactionError } = await supabase
        .from('financial_records')
        .insert(financialRecord)
        .select('id')
        .single()

      if (transactionError) {
        dbLogger.error({ error: transactionError }, 'Error creating financial transaction')
        // Continue without financial transaction
      }

      // Create purchase record
      const purchaseRecord: IngredientPurchaseInsert = {
        user_id: userId,
        ingredient_id: purchaseData.ingredient_id,
        supplier: purchaseData.supplier,
        quantity: purchaseData.quantity,
        unit_price: purchaseData.unit_price,
        total_price: purchaseData.total_price,
        purchase_date: purchaseData.purchase_date,
        notes: purchaseData.notes
      }

      const { data: purchase, error: purchaseError } = await supabase
        .from('ingredient_purchases')
        .insert(purchaseRecord)
        .select(`
          *,
          ingredient:ingredients (
            id,
            name,
            unit,
            current_stock,
            price_per_unit
          )
        `)
        .single()

      if (purchaseError) {
        dbLogger.error({ error: purchaseError }, 'Error creating purchase')

        // Rollback financial transaction if purchase fails
        if (transaction?.id) {
          await supabase
            .from('financial_records')
            .delete()
            .eq('id', transaction.id)
        }

        throw purchaseError
      }

      // Update ingredient stock
      const newStock = (ingredient.current_stock ?? 0) + purchaseData.quantity

      const { error: stockError } = await supabase
        .from('ingredients')
        .update({ current_stock: newStock })
        .eq('id', purchaseData.ingredient_id)
        .eq('user_id', userId)
        .eq('current_stock', ingredient.current_stock ?? 0)

      if (stockError) {
        dbLogger.error({ error: stockError }, 'Error updating stock')
        // Note: Purchase is already created, stock update failed
      }

      // Create stock ledger entry
      const stockLog: Insert<'inventory_stock_logs'> = {
        ingredient_id: purchaseData.ingredient_id,
        quantity_before: ingredient.current_stock ?? 0,
        quantity_after: newStock,
        quantity_changed: purchaseData.quantity,
        change_type: 'increase',
        reference_id: purchase['id'],
        reference_type: 'ingredient_purchase'
      }

      await supabase
        .from('inventory_stock_logs')
        .insert(stockLog)

      return purchase as IngredientPurchase

    } catch (error) {
      dbLogger.error({ error, userId, purchaseData }, 'Failed to create ingredient purchase')
      throw error
    }
  }

  /**
   * Get ingredient purchases with optional filters
   */
  static async getPurchases(
    userId: string,
    filters?: {
      ingredient_id?: string
      start_date?: string
      end_date?: string
      supplier?: string
    }
  ): Promise<IngredientPurchase[]> {
    try {
      const client = await createClient()
      const supabase = typed(client)

      let query = supabase
        .from('ingredient_purchases')
        .select(`
          *,
          ingredient:ingredients (
            id,
            name,
            unit,
            current_stock,
            price_per_unit
          )
        `)
        .eq('user_id', userId)
        .order('purchase_date', { ascending: false })

      // Apply filters
      if (filters?.ingredient_id) {
        query = query.eq('ingredient_id', filters.ingredient_id)
      }

      if (filters?.start_date) {
        query = query.gte('purchase_date', filters.start_date)
      }

      if (filters?.end_date) {
        query = query.lte('purchase_date', filters.end_date)
      }

      if (filters?.supplier) {
        query = query.ilike('supplier', `%${filters.supplier}%`)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data || []

    } catch (error) {
      dbLogger.error({ error, userId, filters }, 'Failed to get ingredient purchases')
      throw error
    }
  }
}