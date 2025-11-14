import { z } from 'zod'

/**
 * Validation schemas for Customers domain
 */

export const CustomerCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama pelanggan harus diisi')
    .max(255, 'Nama pelanggan maksimal 255 karakter')
    .trim(),
  phone: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor HP tidak valid (contoh: 081234567890)')
    .optional()
    .nullable(),
  email: z
    .string()
    .email('Format email tidak valid')
    .max(255, 'Email maksimal 255 karakter')
    .optional()
    .nullable(),
  address: z.string().max(500, 'Alamat maksimal 500 karakter').optional().nullable(),
  is_vip: z.boolean().default(false),
  notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional().nullable(),
})

export const CustomerUpdateSchema = CustomerCreateSchema.partial()

export type CustomerCreateInput = z.infer<typeof CustomerCreateSchema>
export type CustomerUpdateInput = z.infer<typeof CustomerUpdateSchema>
