import { z } from 'zod'

import { EmailSchema, PhoneSchema, NonNegativeNumberSchema } from '@/lib/validations/base-validations'


/**
 * Supplier Validation Schemas
 * Validation schemas for supplier-related operations
 */


// Supplier database schemas
export const SupplierInsertSchema = z.object({
  name: z.string().min(1, 'Nama supplier wajib diisi').max(255, 'Nama supplier maksimal 255 karakter'),
  contact_person: z.string().max(255, 'Contact person maksimal 255 karakter').optional().nullable(),
  email: EmailSchema.optional().nullable(),
  phone: PhoneSchema.optional().nullable(),
  address: z.string().max(500, 'Alamat maksimal 500 karakter').optional().nullable(),
  supplier_type: z.enum(['preferred', 'standard', 'trial', 'blacklisted']).default('standard').optional().nullable(),
  company_type: z.string().max(100, 'Tipe perusahaan maksimal 100 karakter').optional().nullable(),
  payment_terms: z.string().max(100, 'Syarat pembayaran maksimal 100 karakter').optional().nullable(),
  credit_limit: NonNegativeNumberSchema.optional().nullable(),
  lead_time_days: z.number().int().positive('Lead time harus positif').optional().nullable(),
  quality_rating: z.number().min(1, 'Rating minimal 1').max(5, 'Rating maksimal 5').optional().nullable(),
  is_active: z.boolean().default(true).optional().nullable(),
  notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional().nullable(),
  bank_details: z.object({
    bank_name: z.string().max(100, 'Nama bank maksimal 100 karakter').optional(),
    account_holder: z.string().max(255, 'Nama pemegang rekening maksimal 255 karakter').optional(),
    account_number: z.string().max(50, 'Nomor rekening maksimal 50 karakter').optional(),
  }).optional().nullable(),
})

export const SupplierUpdateSchema = SupplierInsertSchema.partial()

// Supplier form schemas (basic fields for UI)
export const SupplierBasicFormSchema = z.object({
  name: z.string().min(1, 'Nama supplier wajib diisi').max(255, 'Nama maksimal 255 karakter'),
  contact_person: z.string().max(255, 'Contact person maksimal 255 karakter').optional().or(z.literal('')),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  phone: z.string().regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/, 'Format nomor telepon Indonesia tidak valid').optional().or(z.literal('')),
  address: z.string().max(500, 'Alamat maksimal 500 karakter').optional().or(z.literal('')),
  supplier_type: z.enum(['preferred', 'standard', 'trial', 'blacklisted']).optional(),
  notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional().or(z.literal('')),
})

export type SupplierBasicForm = z.infer<typeof SupplierBasicFormSchema>

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
export type SupplierQuery = z.infer<typeof SupplierQuerySchema>
export type SupplierRatingUpdate = z.infer<typeof SupplierRatingUpdateSchema>

/**
 * Calculate supplier performance score
 * Score ranges from 0-100 based on multiple factors
 */
export function calculateSupplierScore(supplier: {
  rating?: number | null
  total_spent?: number | null
  lead_time_days?: number | null
  supplier_type?: string
}): number {
  let score = 0

  // Rating score (0-40 points)
  if (supplier.rating) {
    score += (supplier.rating / 5) * 40
  }

  // Spending volume score (0-30 points)
  if (supplier.total_spent) {
    const spentScore = Math.min(supplier.total_spent / 10000000, 1) * 30 // Cap at 10M
    score += spentScore
  }

  // Lead time efficiency score (0-20 points)
  if (supplier.lead_time_days) {
    const leadTimeScore = Math.max(0, (14 - supplier.lead_time_days) / 14) * 20 // Better if < 14 days
    score += leadTimeScore
  }

  // Supplier type bonus (0-10 points)
  if (supplier.supplier_type === 'preferred') {
    score += 10
  } else if (supplier.supplier_type === 'standard') {
    score += 5
  }

  return Math.round(Math.min(score, 100))
}
