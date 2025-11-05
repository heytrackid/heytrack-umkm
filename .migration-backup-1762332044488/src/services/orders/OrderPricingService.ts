import 'server-only'
import { dbLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'
import type { TablesUpdate } from '@/types/database'
import { typed } from '@/types/type-utilities'




/**
 * Order Pricing Service
 * Handles order pricing with customer discounts and loyalty points
 * SERVER-ONLY: Uses server client for database operations
 */


export interface OrderPricingCalculation {
  subtotal: number
  discount_amount: number
  discount_percentage: number
  tax_amount: number
  delivery_fee: number
  total_amount: number
  loyalty_points_earned: number
  loyalty_points_used: number
  customer_info?: {
    name: string
    discount_percentage: number
    loyalty_points: number
  }
}

export class OrderPricingService {
  /**
   * Calculate order pricing with customer discount
   */
  static async calculateOrderPrice(
    customerId: string | null,
    items: Array<{ unit_price: number; quantity: number }>,
    options: {
      delivery_fee?: number
      tax_rate?: number
      use_loyalty_points?: number
    } = {}
  ): Promise<OrderPricingCalculation> {
    try {
      const client = await createClient()

      const supabase = typed(client)

      // Calculate subtotal
      const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)

      let discountPercentage = 0
      let customerLoyaltyPoints = 0
      let customerInfo

      // Get customer discount if customer_id provided
      if (customerId) {
        const { data: customer, error } = await supabase
          .from('customers')
          .select('name, discount_percentage, loyalty_points')
          .eq('id', customerId)
          .single()

        if (!error && customer) {
          discountPercentage = customer.discount_percentage ?? 0
          customerLoyaltyPoints = customer.loyalty_points ?? 0
          customerInfo = {
            name: customer.name,
            discount_percentage: discountPercentage,
            loyalty_points: customerLoyaltyPoints
          }
        }
      }

      // Calculate discount
      const discountAmount = (subtotal * discountPercentage) / 100

      // Apply loyalty points (1 point = Rp 1000)
      const loyaltyPointsUsed = Math.min(
        options.use_loyalty_points ?? 0,
        customerLoyaltyPoints,
        Math.floor(subtotal / 1000) // Max 1 point per 1000 rupiah
      )
      const loyaltyDiscount = loyaltyPointsUsed * 1000

      // Calculate after discount
      const afterDiscount = subtotal - discountAmount - loyaltyDiscount

      // Calculate tax
      const taxRate = options.tax_rate ?? 0
      const taxAmount = (afterDiscount * taxRate) / 100

      // Add delivery fee
      const deliveryFee = options.delivery_fee ?? 0

      // Calculate total
      const totalAmount = afterDiscount + taxAmount + deliveryFee

      // Calculate loyalty points earned (1 point per 10,000 spent)
      const loyaltyPointsEarned = Math.floor(totalAmount / 10000)

      dbLogger.info({
        customerId,
        subtotal,
        discountAmount,
        totalAmount,
        loyaltyPointsEarned
      }, 'Order pricing calculated')

      return {
        subtotal,
        discount_amount: discountAmount + loyaltyDiscount,
        discount_percentage: discountPercentage,
        tax_amount: taxAmount,
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
        loyalty_points_earned: loyaltyPointsEarned,
        loyalty_points_used: loyaltyPointsUsed,
        customer_info: customerInfo
      }

    } catch (error) {
      dbLogger.error({ error }, 'Failed to calculate order price')
      throw error
    }
  }

  /**
   * Update customer loyalty points after order
   */
  static async updateCustomerLoyalty(
    customerId: string,
    pointsEarned: number,
    pointsUsed: number,
    orderAmount: number
  ): Promise<void> {
    try {
      const client = await createClient()

      const supabase = typed(client)

      // Get current customer data
      const { data: customer, error: fetchError } = await supabase
        .from('customers')
        .select('loyalty_points, total_orders, total_spent')
        .eq('id', customerId)
        .single()

      if (fetchError || !customer) {
        throw new Error('Customer not found')
      }

      // Update customer
      const updateData: TablesUpdate<'customers'> = {
        loyalty_points: (customer.loyalty_points ?? 0) + pointsEarned - pointsUsed,
        total_orders: (customer.total_orders ?? 0) + 1,
        total_spent: (customer.total_spent ?? 0) + orderAmount,
        last_order_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', customerId)

      if (error) {
        throw error
      }

      dbLogger.info({
        customerId,
        pointsEarned,
        pointsUsed,
        newBalance: (customer.loyalty_points ?? 0) + pointsEarned - pointsUsed
      }, 'Customer loyalty updated')

    } catch (error) {
      dbLogger.error({ error, customerId }, 'Failed to update customer loyalty')
      throw error
    }
  }

  /**
   * Get customer pricing preview
   */
  static async getCustomerPricingPreview(customerId: string): Promise<{
    discount_percentage: number
    loyalty_points: number
    loyalty_value: number
    total_orders: number
    total_spent: number
    average_order_value: number
  }> {
    try {
      const client = await createClient()

      const supabase = typed(client)

      const { data: customer, error } = await supabase
        .from('customers')
        .select('discount_percentage, loyalty_points, total_orders, total_spent')
        .eq('id', customerId)
        .single()

      if (error || !customer) {
        throw new Error('Customer not found')
      }

      const loyaltyPoints = customer.loyalty_points ?? 0
      const totalOrders = customer.total_orders ?? 0
      const totalSpent = customer.total_spent ?? 0

      return {
        discount_percentage: customer.discount_percentage ?? 0,
        loyalty_points: loyaltyPoints,
        loyalty_value: loyaltyPoints * 1000, // 1 point = Rp 1000
        total_orders: totalOrders,
        total_spent: totalSpent,
        average_order_value: totalOrders > 0 ? totalSpent / totalOrders : 0
      }

    } catch (error) {
      dbLogger.error({ error, customerId }, 'Failed to get customer pricing preview')
      throw error
    }
  }
}