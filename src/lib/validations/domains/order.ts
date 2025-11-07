import { z } from 'zod'

import { UUIDSchema, PositiveNumberSchema, NonNegativeNumberSchema, DateStringSchema } from '@/lib/validations/base-validations'


/**
 * Order Validation Schemas
 * Validation schemas for order-related operations
 */


// Order item schemas
export const OrderItemInsertSchema = z.object({
  recipe_id: UUIDSchema,
  product_name: z.string().max(255).optional().nullable(),
  quantity: PositiveNumberSchema,
  unit_price: NonNegativeNumberSchema,
  total_price: NonNegativeNumberSchema,
  special_requests: z.string().max(500).optional().nullable(),
})

export const OrderItemUpdateSchema = OrderItemInsertSchema.partial()

// Order database schemas
export const OrderInsertSchema = z.object({
  order_no: z.string().min(1, 'Order number is required').max(50),
  customer_id: UUIDSchema.optional().nullable(),
  customer_name: z.string().min(1, 'Customer name is required').max(255),
  customer_phone: z.string().regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/, 'Invalid Indonesian phone number').optional().nullable(),
  customer_address: z.string().max(500).optional().nullable(),
  order_date: DateStringSchema.optional().nullable(),
  delivery_date: DateStringSchema.optional().nullable(),
  delivery_time: z.string().max(50).optional().nullable(),
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED']).default('PENDING'),
  payment_status: z.enum(['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED']).default('UNPAID'),
  payment_method: z.enum(['CASH', 'TRANSFER', 'QRIS', 'CREDIT_CARD']).optional().nullable(),
  subtotal: NonNegativeNumberSchema,
  tax_amount: NonNegativeNumberSchema.default(0),
  discount_amount: NonNegativeNumberSchema.default(0),
  delivery_fee: NonNegativeNumberSchema.default(0),
  total_amount: NonNegativeNumberSchema,
  notes: z.string().max(1000).optional().nullable(),
  special_instructions: z.string().max(1000).optional().nullable(),
  items: z.array(OrderItemInsertSchema).optional(),
})

export const OrderUpdateSchema = OrderInsertSchema.partial().omit({ items: true })

// Order form schemas
export const OrderFormSchema = z.object({
  order_no: z.string().min(1, 'validation.OrderNoRequired').optional(),
  customer_id: UUIDSchema.optional(),
  customer_name: z.string().min(1, 'validation.customerNameRequired'),
  customer_phone: z.string().regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/, 'Invalid Indonesian phone number').optional().or(z.literal('')),
  customer_address: z.string().max(500).optional().or(z.literal('')),
  items: z.array(z.object({
    recipe_id: UUIDSchema.optional(),
    product_name: z.string().min(1, 'validation.productNameRequired'),
    quantity: z.number().positive('validation.quantityPositive'),
    unit_price: z.number().min(0, 'validation.unitPriceNonNegative'),
    total_price: z.number().min(0, 'validation.totalPriceNonNegative'),
    special_requests: z.string().max(500).optional().or(z.literal('')),
  })).min(1, 'Order must have at least one item'),
}).extend({
  order_date: DateStringSchema.optional(),
  delivery_date: DateStringSchema.optional(),
  delivery_time: z.string().max(50).optional().or(z.literal('')),
  delivery_fee: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  notes: z.string().max(1000).optional().or(z.literal('')),
  special_instructions: z.string().max(1000).optional().or(z.literal('')),
})

// Order API schemas
export const OrderQuerySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED']).optional(),
  payment_status: z.enum(['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED']).optional(),
  customer_id: UUIDSchema.optional(),
  start_date: DateStringSchema.optional(),
  end_date: DateStringSchema.optional(),
  min_amount: NonNegativeNumberSchema.optional(),
  max_amount: NonNegativeNumberSchema.optional(),
})

export const OrderStatusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED']),
  notes: z.string().max(500).optional(),
})

export type OrderItemInsert = z.infer<typeof OrderItemInsertSchema>
export type OrderItemUpdate = z.infer<typeof OrderItemUpdateSchema>
export type OrderInsert = z.infer<typeof OrderInsertSchema>
export type OrderUpdate = z.infer<typeof OrderUpdateSchema>
export type OrderForm = z.infer<typeof OrderFormSchema>
export type OrderQuery = z.infer<typeof OrderQuerySchema>
export type OrderStatusUpdate = z.infer<typeof OrderStatusUpdateSchema>
