/**
 * Customer Validation Schemas
 * Validation schemas for customer-related operations
 */

import { z } from 'zod'
import { EmailSchema, PhoneSchema, NonNegativeNumberSchema } from '@/lib/validations/base-validations'

// Customer database schemas
export const CustomerInsertSchema = z.object({
  name: z.string().min(1, 'Customer name is required').max(255),
  email: EmailSchema.optional().nullable(),
  phone: PhoneSchema.optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  customer_type: z.string().max(50).optional().nullable(),
  discount_percentage: NonNegativeNumberSchema.max(100).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  is_active: z.boolean().default(true).optional().nullable(),
  loyalty_points: NonNegativeNumberSchema.default(0).optional().nullable(),
  favorite_items: z.array(z.string()).optional().nullable(),
})

export const CustomerUpdateSchema = CustomerInsertSchema.partial()

// Customer form schemas
export const CustomerFormSchema = z.object({
  name: z.string().min(1, 'Customer name is required').max(255),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/, 'Invalid Indonesian phone number').optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  customer_type: z.string().max(50).optional().or(z.literal('')),
  discount_percentage: z.number().min(0).max(100).optional(),
  notes: z.string().max(1000).optional().or(z.literal('')),
  is_active: z.boolean().default(true).optional(),
  loyalty_points: z.number().min(0).optional(),
})

// Customer API schemas
export const CustomerQuerySchema = z.object({
  search: z.string().optional(),
  customer_type: z.string().optional(),
  is_active: z.boolean().optional(),
  has_loyalty: z.boolean().optional(),
})

export type CustomerInsert = z.infer<typeof CustomerInsertSchema>
export type CustomerUpdate = z.infer<typeof CustomerUpdateSchema>
export type CustomerForm = z.infer<typeof CustomerFormSchema>
export type CustomerQuery = z.infer<typeof CustomerQuerySchema>
