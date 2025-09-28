import { z } from 'zod'

// Base validation utilities
export const requiredString = z.string().min(1, 'Field ini wajib diisi')
export const optionalString = z.string().optional()
export const positiveNumber = z.number().positive('Harus berupa angka positif')
export const nonNegativeNumber = z.number().min(0, 'Tidak boleh negatif')
export const email = z.string().email('Format email tidak valid')
export const phone = z.string().min(10, 'Nomor telepon minimal 10 digit')
export const uuid = z.string().uuid('Format ID tidak valid')

// Indonesian specific validations
export const rupiah = z.number().min(0, 'Jumlah tidak boleh negatif').transform(val => Math.round(val))
export const percentage = z.number().min(0, 'Persentase tidak boleh negatif').max(100, 'Persentase maksimal 100%')
export const indonesianName = z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter')

// Ingredient validation schema
export const IngredientSchema = z.object({
  name: indonesianName,
  description: optionalString,
  unit: z.enum(['kg', 'gram', 'liter', 'ml', 'pcs', 'pack'], {
    message: 'Unit tidak valid'
  }),
  price_per_unit: rupiah,
  current_stock: nonNegativeNumber,
  min_stock: nonNegativeNumber,
  max_stock: positiveNumber.optional(),
  supplier: optionalString,
  category: optionalString,
  storage_requirements: optionalString,
  expiry_date: z.string().datetime().optional(),
  cost_per_unit: rupiah.optional(),
  usage_rate_daily: nonNegativeNumber.optional(),
  reorder_lead_time: z.number().int().min(1, 'Lead time minimal 1 hari').optional(),
  supplier_info: z.object({
    name: optionalString,
    contact: optionalString,
    price: rupiah.optional()
  }).optional(),
  is_active: z.boolean().default(true)
}).refine(data => {
  // Custom validation: min_stock should be less than or equal to current_stock
  if (data.min_stock > data.current_stock) {
    return false
  }
  return true
}, {
  message: 'Stok minimum tidak boleh lebih besar dari stok saat ini',
  path: ['min_stock']
})

export type IngredientFormData = z.infer<typeof IngredientSchema>

// Recipe validation schema
export const RecipeSchema = z.object({
  name: indonesianName,
  description: optionalString,
  servings: z.number().int().min(1, 'Porsi minimal 1').max(1000, 'Porsi maksimal 1000'),
  prep_time_minutes: z.number().int().min(1, 'Waktu persiapan minimal 1 menit').max(1440, 'Waktu persiapan maksimal 24 jam'),
  cook_time_minutes: z.number().int().min(0, 'Waktu memasak tidak boleh negatif').optional(),
  instructions: z.array(z.string().min(1, 'Instruksi tidak boleh kosong')).min(1, 'Minimal 1 instruksi'),
  difficulty_level: z.enum(['EASY', 'MEDIUM', 'HARD'], {
    message: 'Level kesulitan tidak valid'
  }).optional(),
  category: optionalString,
  selling_price: rupiah.optional(),
  cost_per_serving: rupiah.optional(),
  profit_margin: percentage.optional(),
  rating: z.number().min(1, 'Rating minimal 1').max(5, 'Rating maksimal 5').optional(),
  is_active: z.boolean().default(true),
  image_url: z.string().url('URL gambar tidak valid').optional(),
  tags: z.array(z.string()).optional()
})

export type RecipeFormData = z.infer<typeof RecipeSchema>

// Recipe Ingredient validation schema  
export const RecipeIngredientSchema = z.object({
  recipe_id: uuid,
  ingredient_id: uuid,
  quantity: positiveNumber,
  unit: z.string().min(1, 'Unit wajib diisi'),
  notes: optionalString
})

export type RecipeIngredientFormData = z.infer<typeof RecipeIngredientSchema>

// Customer validation schema
export const CustomerSchema = z.object({
  name: indonesianName,
  email: email.optional(),
  phone: phone.optional(),
  address: optionalString,
  birth_date: z.string().datetime().optional(),
  loyalty_points: nonNegativeNumber.optional().default(0),
  customer_type: z.enum(['REGULAR', 'VIP', 'WHOLESALE'], {
    message: 'Tipe customer tidak valid'
  }).optional().default('REGULAR'),
  notes: optionalString,
  is_active: z.boolean().default(true)
}).refine(data => {
  // At least one contact method should be provided
  return data.email || data.phone
}, {
  message: 'Email atau nomor telepon wajib diisi',
  path: ['email']
})

export type CustomerFormData = z.infer<typeof CustomerSchema>

// Order validation schema
export const OrderSchema = z.object({
  order_no: z.string().min(1, 'Nomor order wajib diisi'),
  customer_id: uuid.optional(),
  customer_name: optionalString,
  customer_phone: phone.optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'], {
    message: 'Status order tidak valid'
  }).default('PENDING'),
  order_date: z.string().datetime(),
  delivery_date: z.string().datetime().optional(),
  total_amount: rupiah,
  discount: nonNegativeNumber.optional().default(0),
  tax: nonNegativeNumber.optional().default(0),
  payment_method: z.enum(['CASH', 'TRANSFER', 'CREDIT_CARD', 'E_WALLET'], {
    message: 'Metode pembayaran tidak valid'
  }).optional(),
  payment_status: z.enum(['PENDING', 'PAID', 'PARTIAL', 'REFUNDED'], {
    message: 'Status pembayaran tidak valid'
  }).default('PENDING'),
  notes: optionalString,
  delivery_address: optionalString,
  is_delivery: z.boolean().default(false)
})

export type OrderFormData = z.infer<typeof OrderSchema>

// Order Item validation schema
export const OrderItemSchema = z.object({
  order_id: uuid,
  recipe_id: uuid.optional(),
  product_name: requiredString,
  quantity: positiveNumber,
  unit_price: rupiah,
  total_price: rupiah,
  notes: optionalString
}).refine(data => {
  // Validate total price calculation
  const expectedTotal = data.quantity * data.unit_price
  return Math.abs(data.total_price - expectedTotal) < 0.01 // Allow small floating point differences
}, {
  message: 'Total harga tidak sesuai dengan quantity × unit price',
  path: ['total_price']
})

export type OrderItemFormData = z.infer<typeof OrderItemSchema>

// Production validation schema
export const ProductionSchema = z.object({
  recipe_id: uuid,
  planned_quantity: positiveNumber,
  actual_quantity: nonNegativeNumber.optional(),
  production_date: z.string().datetime(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], {
    message: 'Status produksi tidak valid'
  }).default('PLANNED'),
  batch_no: optionalString,
  quality_score: z.number().min(1).max(10).optional(),
  notes: optionalString,
  cost_total: rupiah.optional(),
  efficiency_score: percentage.optional(),
  waste_percentage: percentage.optional()
}).refine(data => {
  // Validate that end_time is after start_time
  if (data.start_time && data.end_time) {
    return new Date(data.end_time) > new Date(data.start_time)
  }
  return true
}, {
  message: 'Waktu selesai harus setelah waktu mulai',
  path: ['end_time']
})

export type ProductionFormData = z.infer<typeof ProductionSchema>

// Financial Record validation schema
export const FinancialRecordSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE'], {
    message: 'Tipe transaksi tidak valid'
  }),
  category: requiredString,
  amount: rupiah,
  description: requiredString,
  date: z.string().datetime(),
  payment_method: z.enum(['CASH', 'TRANSFER', 'CREDIT_CARD', 'E_WALLET'], {
    message: 'Metode pembayaran tidak valid'
  }).optional(),
  reference_no: optionalString,
  receipt_url: z.string().url('URL struk tidak valid').optional(),
  is_recurring: z.boolean().default(false),
  recurring_period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'], {
    message: 'Periode recurring tidak valid'
  }).optional(),
  tags: z.array(z.string()).optional(),
  notes: optionalString
})

export type FinancialRecordFormData = z.infer<typeof FinancialRecordSchema>

// Stock Transaction validation schema
export const StockTransactionSchema = z.object({
  ingredient_id: uuid,
  transaction_type: z.enum(['IN', 'OUT', 'ADJUSTMENT'], {
    message: 'Tipe transaksi tidak valid'
  }),
  quantity: positiveNumber,
  unit: requiredString,
  unit_cost: rupiah.optional(),
  total_cost: rupiah.optional(),
  reference_type: z.enum(['PURCHASE', 'PRODUCTION', 'SALE', 'WASTE', 'ADJUSTMENT'], {
    message: 'Tipe referensi tidak valid'
  }).optional(),
  reference_id: uuid.optional(),
  notes: optionalString,
  transaction_date: z.string().datetime()
})

export type StockTransactionFormData = z.infer<typeof StockTransactionSchema>

// Bulk operation schemas
export const BulkIngredientSchema = z.object({
  ingredients: z.array(IngredientSchema).min(1, 'Minimal 1 ingredient')
})

export const BulkRecipeSchema = z.object({
  recipes: z.array(RecipeSchema).min(1, 'Minimal 1 recipe')
})

// Additional schema exports for API routes
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional()
})

export const IdParamSchema = z.object({
  id: z.string().uuid('Invalid ID format')
})

// Validation utility functions
export function validateFormData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: z.ZodIssue[]
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.issues }
    }
    throw error
  }
}

// Format validation errors for display
export function formatValidationErrors(errors: z.ZodIssue[]): string[] {
  return errors.map((error) => {
    const path = error.path.join('.')
    return path ? `${path}: ${error.message}` : error.message
  })
}

// Convert Zod errors to field-level errors for form libraries
export function zodErrorsToFieldErrors(errors: z.ZodIssue[]): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  
  errors.forEach((error) => {
    const fieldName = error.path.join('.')
    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = error.message
    }
  })
  
  return fieldErrors
}
