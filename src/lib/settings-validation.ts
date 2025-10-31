/**
 * Settings Validation
 * Validation schemas and functions for application settings
 */

import { z } from 'zod'

// Business info validation schema
export const BusinessInfoSchema = z.object({
  businessName: z.string()
    .min(1, 'Nama bisnis wajib diisi')
    .max(100, 'Nama bisnis terlalu panjang'),
  businessType: z.enum(['UMKM', 'cafe', 'restaurant', 'food-truck', 'catering', 'other'])
    .default('UMKM'),
  address: z.string()
    .max(500, 'Alamat terlalu panjang')
    .optional(),
  phone: z.string()
    .regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/, 'Format nomor telepon tidak valid')
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('Format email tidak valid')
    .optional()
    .or(z.literal('')),
  website: z.string()
    .url('Format URL tidak valid')
    .optional()
    .or(z.literal('')),
  description: z.string()
    .max(1000, 'Deskripsi terlalu panjang')
    .optional()
})

export type BusinessInfoData = z.infer<typeof BusinessInfoSchema>

/**
 * Validate business info settings
 */
export function validateBusinessInfoSettings(data: unknown): BusinessInfoData {
  return BusinessInfoSchema.parse(data)
}

/**
 * Validate business info settings safely (returns errors instead of throwing)
 */
export function validateBusinessInfoSettingsSafe(data: unknown): {
  isValid: boolean
  data?: BusinessInfoData
  errors?: Record<string, string>
} {
  try {
    const validatedData = BusinessInfoSchema.parse(data)
    return { isValid: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.issues.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message
        }
      })
      return { isValid: false, errors }
    }
    return { isValid: false, errors: { general: 'Validation failed' } }
  }
}
