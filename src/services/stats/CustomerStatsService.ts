/**
 * Customer Stats Service
 * Handles automatic customer statistics updates
 */

import { dbLogger } from '@/lib/logger'
import { BaseService, type ServiceContext } from '@/services/base'

export class CustomerStatsService extends BaseService {
  private readonly logger = dbLogger

  constructor(context: ServiceContext) {
    super(context)
  }

  /**
   * Update customer stats after order delivered
   */
  async updateStatsFromOrder(
    customerId: string,
    orderAmount: number
  ): Promise<void> {
    try {
      // Get current customer stats
      const { data: customer, error: fetchError } = await this.context.supabase
        .from('customers')
        .select('total_orders, total_spent')
        .eq('id', customerId)
        .eq('user_id', this.context.userId)
        .single()

      if (fetchError || !customer) {
        this.logger.warn({ customerId }, 'Customer not found for stats update')
        return
      }

      const newTotalOrders = (customer.total_orders ?? 0) + 1
      const newTotalSpent = Number(customer.total_spent ?? 0) + orderAmount

      // Update customer stats
      const { error: updateError } = await this.context.supabase
        .from('customers')
        .update({
          total_orders: newTotalOrders,
          total_spent: newTotalSpent,
          last_order_date: new Date().toISOString().split('T')[0] ?? null,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)
        .eq('user_id', this.context.userId)

      if (updateError) {
        this.logger.error({ error: updateError, customerId }, 'Failed to update customer stats')
        return
      }

      this.logger.info({ customerId, newTotalOrders, newTotalSpent }, 'Customer stats updated')
    } catch (error) {
      this.logger.error({ error, customerId }, 'Error updating customer stats')
    }
  }

  /**
   * Reverse customer stats when order cancelled
   */
  async reverseStatsFromOrder(
    customerId: string,
    orderAmount: number
  ): Promise<void> {
    try {
      const { data: customer, error: fetchError } = await this.context.supabase
        .from('customers')
        .select('total_orders, total_spent')
        .eq('id', customerId)
        .eq('user_id', this.context.userId)
        .single()

      if (fetchError || !customer) {
        return
      }

      const newTotalOrders = Math.max(0, (customer.total_orders ?? 0) - 1)
      const newTotalSpent = Math.max(0, Number(customer.total_spent ?? 0) - orderAmount)

      await this.context.supabase
        .from('customers')
        .update({
          total_orders: newTotalOrders,
          total_spent: newTotalSpent,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)
        .eq('user_id', this.context.userId)

      this.logger.info({ customerId, newTotalOrders, newTotalSpent }, 'Customer stats reversed')
    } catch (error) {
      this.logger.error({ error, customerId }, 'Error reversing customer stats')
    }
  }
}
