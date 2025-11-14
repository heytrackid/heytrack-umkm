import { z } from 'zod'

export const orderItemSchema = z.object({
  recipe_id: z.string().uuid('ID resep tidak valid').optional().nullable(),
  product_name: z.string().min(1, 'Nama produk wajib diisi').max(255),
  quantity: z.number().min(1, 'Jumlah minimal 1'),
  unit_price: z.number().min(0, 'Harga tidak boleh negatif'),
  notes: z.string().optional().nullable(),
})

export const orderSchema = z.object({
  customer_id: z.string().uuid('ID pelanggan tidak valid').optional().nullable(),
  customer_name: z.string().min(1, 'Nama pelanggan wajib diisi').max(255),
  customer_phone: z.string().optional().nullable(),
  customer_address: z.string().optional().nullable(),
  order_date: z.string().optional(),
  delivery_date: z.string().optional().nullable(),
  status: z
    .enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'])
    .optional()
    .default('PENDING'),
  payment_status: z.enum(['unpaid', 'partial', 'paid']).optional().default('unpaid'),
  payment_method: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(orderItemSchema).min(1, 'Minimal 1 item diperlukan'),
})

export const orderUpdateSchema = orderSchema.partial()

export type OrderFormData = z.infer<typeof orderSchema>
export type OrderItemFormData = z.infer<typeof orderItemSchema>
