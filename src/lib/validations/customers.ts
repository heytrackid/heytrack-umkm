import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string().min(1, 'Nama pelanggan wajib diisi').max(255),
  phone: z.string().optional().nullable(),
  email: z.string().email('Email tidak valid').optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  is_vip: z.boolean().default(false),
})

export const customerUpdateSchema = customerSchema.partial()

export type CustomerFormData = z.infer<typeof customerSchema>
