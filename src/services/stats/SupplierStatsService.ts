/**
 * Supplier Stats Service
 * Handles automatic supplier statistics updates
 */

import { dbLogger } from '@/lib/logger'
import { BaseService, type ServiceContext } from '@/services/base'

export class SupplierStatsService extends BaseService {
  private readonly logger = dbLogger

  constructor(context: ServiceContext) {
    super(context)
  }

  /**
   * Update supplier stats after purchase
   */
  async updateStatsFromPurchase(
    supplierName: string,
    purchaseAmount: number
  ): Promise<void> {
    try {
      // Find supplier by name
      const { data: supplier, error: fetchError } = await this.context.supabase
        .from('suppliers')
        .select('id, total_orders, total_spent')
        .eq('name', supplierName)
        .eq('user_id', this.context.userId)
        .single()

      if (fetchError || !supplier) {
        this.logger.info({ supplierName }, 'Supplier not found for stats update (may be manual entry)')
        return
      }

      const newTotalOrders = (supplier.total_orders ?? 0) + 1
      const newTotalSpent = Number(supplier.total_spent ?? 0) + purchaseAmount

      // Update supplier stats
      const { error: updateError } = await this.context.supabase
        .from('suppliers')
        .update({
          total_orders: newTotalOrders,
          total_spent: newTotalSpent,
          last_order_date: new Date().toISOString().split('T')[0] ?? null,
          updated_at: new Date().toISOString()
        })
        .eq('id', supplier.id)
        .eq('user_id', this.context.userId)

      if (updateError) {
        this.logger.error({ error: updateError, supplierName }, 'Failed to update supplier stats')
        return
      }

      this.logger.info({ supplierName, newTotalOrders, newTotalSpent }, 'Supplier stats updated')
    } catch (error) {
      this.logger.error({ error, supplierName }, 'Error updating supplier stats')
    }
  }

  /**
   * Reverse supplier stats when purchase is deleted
   */
  async reverseStatsFromPurchase(
    supplierName: string,
    purchaseAmount: number
  ): Promise<void> {
    try {
      // Find supplier by name
      const { data: supplier, error: fetchError } = await this.context.supabase
        .from('suppliers')
        .select('id, total_orders, total_spent')
        .eq('name', supplierName)
        .eq('user_id', this.context.userId)
        .single()

      if (fetchError || !supplier) {
        this.logger.info({ supplierName }, 'Supplier not found for stats reversal (may be manual entry)')
        return
      }

      // Decrement stats (ensure non-negative)
      const newTotalOrders = Math.max(0, (supplier.total_orders ?? 0) - 1)
      const newTotalSpent = Math.max(0, Number(supplier.total_spent ?? 0) - purchaseAmount)

      // Update supplier stats
      const { error: updateError } = await this.context.supabase
        .from('suppliers')
        .update({
          total_orders: newTotalOrders,
          total_spent: newTotalSpent,
          updated_at: new Date().toISOString()
        })
        .eq('id', supplier.id)
        .eq('user_id', this.context.userId)

      if (updateError) {
        this.logger.error({ error: updateError, supplierName }, 'Failed to reverse supplier stats')
        return
      }

      this.logger.info({ supplierName, newTotalOrders, newTotalSpent }, 'Supplier stats reversed')
    } catch (error) {
      this.logger.error({ error, supplierName }, 'Error reversing supplier stats')
    }
  }
}
