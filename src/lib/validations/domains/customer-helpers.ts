import { z } from 'zod'
import { CustomerInsertSchema } from './customer'
import type { Insert, Update } from '@/types/database'


/**
 * Customer Validation Helpers
 * Domain-specific validation helpers for customer-related business rules
 */


// Re-export for convenience
export { CustomerUpdateSchema } from './customer'

// Custom validation for Indonesian phone numbers
export const indonesianPhoneValidation = (phone: string): boolean => {
  const indonesianPhoneRegex = /^(\+62|62|0)[8-9][0-9]{7,11}$/
  return indonesianPhoneRegex.test(phone)
}

// Custom validation for customer uniqueness
export const customerUniquenessValidation = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
}).refine((data) => 
  // At least one contact method is required
   !!(data.phone ?? data.email)
, {
  message: 'Either phone or email is required for customer identification',
  path: ['phone']
})

// Enhanced customer validation with business rules
export const EnhancedCustomerInsertSchema = CustomerInsertSchema
  .extend({
    phone: z.string().optional().refine((phone) => {
      if (!phone) {return true} // Optional field
      return indonesianPhoneValidation(phone)
    }, {
      message: 'Invalid Indonesian phone number format'
    }),

    email: z.string().email().optional().transform((email) => email?.toLowerCase()),

    loyalty_points: z.number().min(0).max(1000000).optional(), // Reasonable upper limit

    discount_percentage: z.number().min(0).max(50).optional(), // Max 50% discount
  })
  .refine((data) => {
    // Business rule: VIP customers should have contact info
    if (data.customer_type === 'vip' && !data.phone && !data.email) {
      return false
    }
    return true
  }, {
    message: 'VIP customers must have phone or email contact',
    path: ['customer_type']
  })

export const EnhancedCustomerUpdateSchema = EnhancedCustomerInsertSchema.partial()

// Validation helpers
export class CustomerValidationHelpers {
  /**
   * Validate customer data with enhanced business rules
   */
  static validateInsert(data: unknown): { success: boolean; data?: Insert<'customers'>; errors?: string[] } {
    try {
      const validatedData = EnhancedCustomerInsertSchema.parse(data)
      return { success: true, data: validatedData as Insert<'customers'> }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.issues.map(err => `${err.path.join('.')}: ${err.message}`)
        return { success: false, errors }
      }
      return { success: false, errors: ['Validation failed'] }
    }
  }

  /**
   * Validate customer update data
   */
  static validateUpdate(data: unknown): { success: boolean; data?: Update<'customers'>; errors?: string[] } {
    try {
      const validatedData = EnhancedCustomerUpdateSchema.parse(data)
      return { success: true, data: validatedData }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.issues.map(err => `${err.path.join('.')}: ${err.message}`)
        return { success: false, errors }
      }
      return { success: false, errors: ['Validation failed'] }
    }
  }

  /**
   * Check if customer qualifies for VIP status
   */
  static qualifiesForVIP(customer: { loyalty_points?: number; discount_percentage?: number }): boolean {
    const points = customer.loyalty_points ?? 0
    const discount = customer.discount_percentage ?? 0

    return points >= 1000 || discount >= 10
  }

  /**
   * Calculate recommended discount based on loyalty points
   */
  static calculateRecommendedDiscount(loyaltyPoints: number): number {
    if (loyaltyPoints >= 5000) {return 15}
    if (loyaltyPoints >= 2000) {return 10}
    if (loyaltyPoints >= 1000) {return 5}
    return 0
  }

  /**
   * Validate bulk customer import data
   */
  static validateBulkImport(customers: unknown[]): {
    valid: Array<Insert<'customers'>>
    invalid: Array<{ index: number; data: unknown; errors: string[] }>
  } {
    const valid: Array<Insert<'customers'>> = []
    const invalid: Array<{ index: number; data: unknown; errors: string[] }> = []

    customers.forEach((customer, index) => {
      const result = this.validateInsert(customer)
      if (result.success && result.data) {
        valid.push(result.data)
      } else {
        invalid.push({
          index,
          data: customer,
          errors: result.errors ?? []
        })
      }
    })

    return { valid, invalid }
  }
}

// Type exports
export type EnhancedCustomerInsert = z.infer<typeof EnhancedCustomerInsertSchema>
export type EnhancedCustomerUpdate = z.infer<typeof EnhancedCustomerUpdateSchema>
