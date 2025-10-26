/**
 * Supplier Validation Schemas
 * Validation schemas for supplier-related operations
 */

import { z } from 'zod'
import { UUIDSchema, EmailSchema, PhoneSchema, NonNegativeNumberSchema } from '../base-validations'

// Supplier database schemas
export const SupplierInsertSchema = z.object({
  name: z.string().min(1, 'Supplier name is required').max(255),
  contact_person: z.string().max(255).optional().nullable(),
  email: EmailSchema.optional().nullable(),
  phone: PhoneSchema.optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  company_type: z.string().max(100).optional().nullable(),
  payment_terms: z.string().max(100).optional().nullable(),
  credit_limit: NonNegativeNumberSchema.optional().nullable(),
  lead_time_days: z.number().int().positive().optional().nullable(),
  quality_rating: z.number().min(1).max(5).optional().nullable(),
  is_active: z.boolean().default(true).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  bank_details: z.object({
    bank_name: z.string().max(100).optional(),
    account_number: z.string().max(50).optional(),
    account_holder: z.string().max(255).optional(),
  }).optional().nullable(),
})

export const SupplierUpdateSchema = SupplierInsertSchema.partial()

// Supplier form schemas
export const SupplierFormSchema = z.object({
  name: z.string().min(1, 'validation.supplierNameRequired'),
  contact_person: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/, 'Invalid Indonesian phone number').optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  company_type: z.string().max(100).optional().or(z.literal('')),
  payment_terms: z.string().max(100).optional().or(z.literal('')),
  credit_limit: z.number().min(0).optional(),
  lead_time_days: z.number().int().min(1).optional(),
  quality_rating: z.number().min(1).max(5).optional(),
  is_active: z.boolean().default(true),
  notes: z.string().max(1000).optional().or(z.literal('')),
  bank_details: z.object({
    bank_name: z.string().optional(),
    account_number: z.string().optional(),
    account_holder: z.string().optional(),
  }).optional(),
})

// Supplier API schemas
export const SupplierQuerySchema = z.object({
  search: z.string().optional(),
  company_type: z.string().optional(),
  is_active: z.boolean().optional(),
  quality_rating_min: z.number().min(1).max(5).optional(),
  lead_time_max: z.number().int().positive().optional(),
})

export const SupplierRatingUpdateSchema = z.object({
  quality_rating: z.number().min(1).max(5),
  rating_notes: z.string().max(500).optional(),
})

export type SupplierInsert = z.infer<typeof SupplierInsertSchema>
export type SupplierUpdate = z.infer<typeof SupplierUpdateSchema>
export type SupplierForm = z.infer<typeof SupplierFormSchema>
export type SupplierQuery = z.infer<typeof SupplierQuerySchema>
export type SupplierRatingUpdate = z.infer<typeof SupplierRatingUpdateSchema>
