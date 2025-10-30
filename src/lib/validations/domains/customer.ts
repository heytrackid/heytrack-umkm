// Customer Domain Validation Schemas
// Source of truth for customer data validation

import { z } from 'zod'

/**
 * Customer Insert Schema
 * Used for creating new customers
 */
export const CustomerInsertSchema = z.object({
  name: z.string()
    .min(1, 'Nama pelanggan wajib diisi')
    .max(255, 'Nama terlalu panjang (maksimal 255 karakter)'),
  
  phone: z.string()
    .min(1, 'Nomor telepon wajib diisi')
    .regex(/^[0-9+\-\s()]+$/, 'Format nomor telepon tidak valid')
    .max(20, 'Nomor telepon terlalu panjang')
    .optional()
    .nullable(),
  
  email: z.string()
    .email('Format email tidak valid')
    .max(255, 'Email terlalu panjang')
    .optional()
    .nullable(),
  
  address: z.string()
    .max(500, 'Alamat terlalu panjang (maksimal 500 karakter)')
    .optional()
    .nullable(),
  
  customer_type: z.enum(['retail', 'wholesale', 'vip', 'regular'])
    .optional()
    .nullable(),
  
  discount_percentage: z.number()
    .min(0, 'Diskon tidak boleh negatif')
    .max(100, 'Diskon maksimal 100%')
    .optional()
    .nullable(),
  
  notes: z.string()
    .max(1000, 'Catatan terlalu panjang (maksimal 1000 karakter)')
    .optional()
    .nullable(),
  
  is_active: z.boolean()
    .optional()
    .nullable(),
  
  user_id: z.string().uuid()
})

/**
 * Customer Update Schema
 * Used for updating existing customers
 * All fields optional except user_id
 */
export const CustomerUpdateSchema = CustomerInsertSchema.partial().extend({
  user_id: z.string().uuid()
})

/**
 * Customer Query Schema
 * Used for filtering and searching customers
 */
export const CustomerQuerySchema = z.object({
  search: z.string().optional(),
  customer_type: z.enum(['retail', 'wholesale', 'vip', 'regular']).optional(),
  is_active: z.boolean().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
})

/**
 * Type exports for convenience
 */
export type CustomerInsertInput = z.infer<typeof CustomerInsertSchema>
export type CustomerUpdateInput = z.infer<typeof CustomerUpdateSchema>
export type CustomerQueryInput = z.infer<typeof CustomerQuerySchema>
