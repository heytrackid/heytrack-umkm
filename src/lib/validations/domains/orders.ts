import { z } from 'zod'

/**
 * Validation schemas for Orders domain
 */

export const OrderStatus = z.enum([
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'READY',
  'DELIVERED',
  'CANCELLED',
])
export const PaymentStatus = z.enum(['unpaid', 'partial', 'paid'])
export const PaymentMethod = z.enum(['cash', 'transfer', 'e-wallet', 'other'])

export const OrderItemSchema = z.object({
  recipe_id: z.string().uuid('ID resep tidak valid').optional().nullable(),
  product_name: z
    .string()
    .min(1, 'Nama produk harus diisi')
    .max(255, 'Nama produk maksimal 255 karakter')
    .trim(),
  quantity: z.number().positive('Jumlah harus lebih dari 0').finite(),
  unit_price: z.number().positive('Harga satuan harus lebih dari 0').finite(),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional().nullable(),
})

export const OrderCreateSchema = z.object({
  customer_id: z.string().uuid('ID pelanggan tidak valid').optional().nullable(),
  customer_name: z
    .string()
    .min(1, 'Nama pelanggan harus diisi')
    .max(255, 'Nama pelanggan maksimal 255 karakter')
    .trim(),
  customer_phone: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor HP tidak valid')
    .optional()
    .nullable(),
  customer_address: z.string().max(500, 'Alamat maksimal 500 karakter').optional().nullable(),
  order_date: z.string().datetime('Format tanggal tidak valid'),
  delivery_date: z.string().datetime('Format tanggal tidak valid').optional().nullable(),
  status: OrderStatus.default('PENDING'),
  payment_status: PaymentStatus.default('unpaid'),
  payment_method: PaymentMethod.optional().nullable(),
  notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional().nullable(),
  items: z
    .array(OrderItemSchema)
    .min(1, 'Pesanan harus memiliki minimal 1 item')
    .max(100, 'Pesanan maksimal 100 item'),
})

export const OrderUpdateSchema = z.object({
  customer_id: z.string().uuid('ID pelanggan tidak valid').optional().nullable(),
  customer_name: z
    .string()
    .min(1, 'Nama pelanggan harus diisi')
    .max(255, 'Nama pelanggan maksimal 255 karakter')
    .trim()
    .optional(),
  customer_phone: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor HP tidak valid')
    .optional()
    .nullable(),
  customer_address: z.string().max(500, 'Alamat maksimal 500 karakter').optional().nullable(),
  order_date: z.string().datetime('Format tanggal tidak valid').optional(),
  delivery_date: z.string().datetime('Format tanggal tidak valid').optional().nullable(),
  status: OrderStatus.optional(),
  payment_status: PaymentStatus.optional(),
  payment_method: PaymentMethod.optional().nullable(),
  notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional().nullable(),
  items: z
    .array(OrderItemSchema)
    .min(1, 'Pesanan harus memiliki minimal 1 item')
    .max(100, 'Pesanan maksimal 100 item')
    .optional(),
})

export const OrderStatusUpdateSchema = z.object({
  status: OrderStatus,
})

export const OrderPaymentUpdateSchema = z.object({
  payment_status: PaymentStatus,
  payment_method: PaymentMethod.optional(),
})

// Status transition validation
export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export type OrderItemInput = z.infer<typeof OrderItemSchema>
export type OrderCreateInput = z.infer<typeof OrderCreateSchema>
export type OrderUpdateInput = z.infer<typeof OrderUpdateSchema>
export type OrderStatusUpdateInput = z.infer<typeof OrderStatusUpdateSchema>
export type OrderPaymentUpdateInput = z.infer<typeof OrderPaymentUpdateSchema>
