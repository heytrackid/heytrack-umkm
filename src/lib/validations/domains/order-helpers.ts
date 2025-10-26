/**
 * Order Validation Helpers
 * Domain-specific validation helpers for order-related business rules
 */

import { z } from 'zod'
import { OrderInsertSchema, OrderUpdateSchema, type OrderInsert, type OrderUpdate } from './order'

// Enhanced order validation with business rules
export const EnhancedOrderInsertSchema = OrderInsertSchema
  .extend({
    // Enhanced validation for order amounts
    subtotal: z.number().min(0).max(100000000), // Max 100M
    tax_amount: z.number().min(0).max(50000000), // Max 50M
    discount_amount: z.number().min(0).max(50000000), // Max 50M
    delivery_fee: z.number().min(0).max(10000000), // Max 10M

    // Status validation with business rules
    status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'])
      .default('PENDING'),

    // Payment validation
    payment_status: z.enum(['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED'])
      .default('UNPAID'),

    // Priority validation
    priority: z.enum(['low', 'normal', 'high', 'urgent'])
      .default('normal'),

    // Order items validation with enhanced rules
    items: z.array(z.object({
      recipe_id: z.string().uuid(),
      product_name: z.string().min(1).max(255),
      quantity: z.number().positive().max(10000), // Max 10k per item
      unit_price: z.number().min(0).max(10000000), // Max 10M per unit
      total_price: z.number().min(0).max(100000000), // Max 100M per item
      special_requests: z.string().max(500).optional(),
    })).min(1, 'Order must have at least one item').max(100, 'Order cannot have more than 100 items')
  })
  .refine((data) => {
    // Business rule: Total amount should equal sum of items
    const calculatedTotal = data.items.reduce((sum, item) => sum + item.total_price, 0)
    const orderTotal = data.subtotal + data.tax_amount - data.discount_amount + data.delivery_fee

    // Allow 1% tolerance for rounding errors
    const tolerance = calculatedTotal * 0.01
    return Math.abs(orderTotal - calculatedTotal) <= tolerance
  }, {
    message: 'Order total does not match sum of item totals',
    path: ['total_amount']
  })
  .refine((data) => {
    // Business rule: Delivery orders should have delivery date and address
    if (data.delivery_fee > 0 && (!data.delivery_date || !data.customer_address)) {
      return false
    }
    return true
  }, {
    message: 'Delivery orders must have delivery date and customer address',
    path: ['delivery_date']
  })
  .refine((data) => {
    // Business rule: Paid orders should have payment method
    if (data.payment_status === 'PAID' && !data.payment_method) {
      return false
    }
    return true
  }, {
    message: 'Paid orders must have payment method',
    path: ['payment_method']
  })

export const EnhancedOrderUpdateSchema = EnhancedOrderInsertSchema.partial()

// Validation helpers
export class OrderValidationHelpers {
  /**
   * Validate order data with enhanced business rules
   */
  static validateInsert(data: unknown): { success: boolean; data?: OrderInsert; errors?: string[] } {
    try {
      const validatedData = EnhancedOrderInsertSchema.parse(data)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        return { success: false, errors }
      }
      return { success: false, errors: ['Validation failed'] }
    }
  }

  /**
   * Validate order update data
   */
  static validateUpdate(data: unknown): { success: boolean; data?: OrderUpdate; errors?: string[] } {
    try {
      const validatedData = EnhancedOrderUpdateSchema.parse(data)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        return { success: false, errors }
      }
      return { success: false, errors: ['Validation failed'] }
    }
  }

  /**
   * Calculate order totals
   */
  static calculateTotals(items: Array<{ unit_price: number; quantity: number }>, options: {
    taxRate?: number
    discountAmount?: number
    deliveryFee?: number
  } = {}): {
    subtotal: number
    tax_amount: number
    discount_amount: number
    delivery_fee: number
    total_amount: number
  } {
    const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
    const tax_amount = options.taxRate ? subtotal * (options.taxRate / 100) : 0
    const discount_amount = options.discountAmount || 0
    const delivery_fee = options.deliveryFee || 0

    const total_amount = subtotal + tax_amount - discount_amount + delivery_fee

    return {
      subtotal,
      tax_amount,
      discount_amount,
      delivery_fee,
      total_amount
    }
  }

  /**
   * Validate order status transition
   */
  static validateStatusTransition(currentStatus: string, newStatus: string): {
    valid: boolean
    reason?: string
  } {
    const validTransitions: Record<string, string[]> = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['READY', 'CANCELLED'],
      'READY': ['DELIVERED', 'CANCELLED'],
      'DELIVERED': [], // Final status
      'CANCELLED': [] // Final status
    }

    if (validTransitions[currentStatus]?.includes(newStatus)) {
      return { valid: true }
    }

    return {
      valid: false,
      reason: `Invalid status transition from ${currentStatus} to ${newStatus}`
    }
  }

  /**
   * Check if order can be cancelled
   */
  static canCancelOrder(order: {
    status: string
    payment_status: string
    created_at: string
  }): { canCancel: boolean; reason?: string } {
    const { status, payment_status } = order

    // Cannot cancel delivered orders
    if (status === 'DELIVERED') {
      return { canCancel: false, reason: 'Cannot cancel delivered orders' }
    }

    // Cannot cancel paid orders without refund process
    if (payment_status === 'PAID') {
      return { canCancel: false, reason: 'Cannot cancel paid orders. Use refund process instead.' }
    }

    return { canCancel: true }
  }

  /**
   * Validate bulk order import
   */
  static validateBulkImport(orders: unknown[]): {
    valid: any[]
    invalid: Array<{ index: number; data: any; errors: string[] }>
  } {
    const valid: any[] = []
    const invalid: Array<{ index: number; data: any; errors: string[] }> = []

    orders.forEach((order, index) => {
      const result = this.validateInsert(order)
      if (result.success) {
        valid.push(result.data)
      } else {
        invalid.push({
          index,
          data: order,
          errors: result.errors || []
        })
      }
    })

    return { valid, invalid }
  }
}

// Type exports
export type EnhancedOrderInsert = z.infer<typeof EnhancedOrderInsertSchema>
export type EnhancedOrderUpdate = z.infer<typeof EnhancedOrderUpdateSchema>
