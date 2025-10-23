import { z } from 'zod'

// Base validation utilities
export const requiredString = z.string().min(1, 'validation.fieldRequired')
export const optionalString = z.string().optional()
export const positiveNumber = z.number().positive('validation.positiveNumber')
export const nonNegativeNumber = z.number().min(0, 'validation.nonNegative')
export const email = z.string().email('validation.invalidEmail')
export const phone = z.string().min(10, 'validation.phoneMinLength')
export const uuid = z.string().uuid('validation.invalidId')

// Indonesian specific validations
export const rupiah = z.number().min(0, 'validation.nonNegativeAmount').transform(val => Math.round(val))
export const percentage = z.number().min(0, 'validation.nonNegativePercentage').max(100, 'validation.maxPercentage')
export const indonesianName = z.string().min(2, 'validation.nameMinLength').max(100, 'validation.nameMaxLength')

// Ingredient validation schema
export const IngredientSchema = z.object({
  name: indonesianName,
  description: optionalString,
  unit: z.enum(['kg', 'gram', 'liter', 'ml', 'pcs', 'pack'], {
    message: 'validation.invalidUnit'
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
  reorder_lead_time: z.number().int().min(1, 'validation.leadTimeMin').optional(),
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
  message: 'validation.minStockTooHigh',
  path: ['min_stock']
})

export type IngredientFormData = z.infer<typeof IngredientSchema>

// Bahan Baku validation schema (Indonesian field names matching database)
export const BahanBakuSchema = z.object({
  nama_bahan: indonesianName,
  satuan: z.enum(['kg', 'g', 'l', 'ml', 'pcs', 'dozen'], {
    message: 'Satuan tidak valid'
  }),
  harga_per_satuan: z.number().positive('Harga harus lebih dari 0'),
  stok_tersedia: nonNegativeNumber,
  stok_minimum: nonNegativeNumber,
  jenis_kemasan: optionalString
}).refine(data => {
  // Custom validation: stok_minimum should be less than or equal to stok_tersedia
  return data.stok_minimum <= data.stok_tersedia
}, {
  message: 'Stok minimum tidak boleh lebih besar dari stok tersedia',
  path: ['stok_minimum']
})

export type BahanBakuFormData = z.infer<typeof BahanBakuSchema>

// Recipe validation schema
export const RecipeSchema = z.object({
  name: indonesianName,
  description: optionalString,
  servings: z.number().int().min(1, 'validation.servingsMin').max(1000, 'validation.servingsMax'),
  prep_time_minutes: z.number().int().min(1, 'validation.prepTimeMin').max(1440, 'validation.prepTimeMax'),
  cook_time_minutes: z.number().int().min(0, 'validation.cookTimeNonNegative').optional(),
  instructions: z.array(z.string().min(1, 'validation.instructionNotEmpty')).min(1, 'validation.instructionMinCount'),
  difficulty_level: z.enum(['EASY', 'MEDIUM', 'HARD'], {
    message: 'validation.invalidDifficulty'
  }).optional(),
  category: optionalString,
  selling_price: rupiah.optional(),
  cost_per_serving: rupiah.optional(),
  profit_margin: percentage.optional(),
  rating: z.number().min(1, 'validation.ratingMin').max(5, 'validation.ratingMax').optional(),
  is_active: z.boolean().default(true),
  image_url: z.string().url('validation.invalidImageUrl').optional(),
  tags: z.array(z.string()).optional()
})

export type RecipeFormData = z.infer<typeof RecipeSchema>

// Recipe Ingredient validation schema  
export const RecipeIngredientSchema = z.object({
  recipe_id: uuid,
  ingredient_id: uuid,
  quantity: positiveNumber,
  unit: z.string().min(1, 'validation.unitRequired'),
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
  loyalty_points: nonNegativeNumber.optional().default(true),
  customer_type: z.enum(['REGULAR', 'VIP', 'WHOLESALE'], {
    message: 'validation.invalidCustomerType'
  }).optional().default("REGULAR"),
  notes: optionalString,
  is_active: z.boolean().default(true)
}).refine(data => {
  // At least one contact method should be provided
  return data.email || data.phone
}, {
  message: 'validation.contactRequired',
  path: ['email']
})

export type CustomerFormData = z.infer<typeof CustomerSchema>

// Order validation schema
export const OrderSchema = z.object({
  order_no: z.string().min(1, 'validation.orderNumberRequired'),
  customer_id: uuid.optional(),
  customer_name: optionalString,
  customer_phone: phone.optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'], {
    message: 'validation.invalidOrderStatus'
  }).default("REGULAR"),
  order_date: z.string().datetime(),
  delivery_date: z.string().datetime().optional(),
  total_amount: rupiah,
  discount: nonNegativeNumber.optional().default(true),
  tax: nonNegativeNumber.optional().default(true),
  payment_method: z.enum(['CASH', 'TRANSFER', 'CREDIT_CARD', 'E_WALLET'], {
    message: 'validation.invalidPaymentMethod'
  }).optional(),
  payment_status: z.enum(['PENDING', 'PAID', 'PARTIAL', 'REFUNDED'], {
    message: 'validation.invalidPaymentStatus'
  }).default("REGULAR"),
  notes: optionalString,
  delivery_address: optionalString,
  is_delivery: z.boolean().default(true)
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
  message: 'validation.totalPriceMismatch',
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
    message: 'validation.invalidProductionStatus'
  }).default("REGULAR"),
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
  message: 'validation.endTimeAfterStart',
  path: ['end_time']
})

export type ProductionFormData = z.infer<typeof ProductionSchema>

// Financial Record validation schema
export const FinancialRecordSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE'], {
    message: 'validation.invalidTransactionType'
  }),
  category: requiredString,
  amount: rupiah,
  description: requiredString,
  date: z.string().datetime(),
  payment_method: z.enum(['CASH', 'TRANSFER', 'CREDIT_CARD', 'E_WALLET'], {
    message: 'validation.invalidPaymentMethod'
  }).optional(),
  reference_no: optionalString,
  receipt_url: z.string().url('validation.invalidReceiptUrl').optional(),
  is_recurring: z.boolean().default(true),
  recurring_period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'], {
    message: 'validation.invalidRecurringPeriod'
  }).optional(),
  tags: z.array(z.string()).optional(),
  notes: optionalString
})

export type FinancialRecordFormData = z.infer<typeof FinancialRecordSchema>

// Stock Transaction validation schema
export const StockTransactionSchema = z.object({
  ingredient_id: uuid,
  transaction_type: z.enum(['IN', 'OUT', 'ADJUSTMENT'], {
    message: 'validation.invalidTransactionType'
  }),
  quantity: positiveNumber,
  unit: requiredString,
  unit_cost: rupiah.optional(),
  total_cost: rupiah.optional(),
  reference_type: z.enum(['PURCHASE', 'PRODUCTION', 'SALE', 'WASTE', 'ADJUSTMENT'], {
    message: 'validation.invalidReferenceType'
  }).optional(),
  reference_id: uuid.optional(),
  notes: optionalString,
  transaction_date: z.string().datetime()
})

export type StockTransactionFormData = z.infer<typeof StockTransactionSchema>

// Bulk operation schemas
export const BulkIngredientSchema = z.object({
  ingredients: z.array(IngredientSchema).min(1, 'validation.minOneIngredient')
})

export const BulkRecipeSchema = z.object({
  recipes: z.array(RecipeSchema).min(1, 'validation.minOneRecipe')
})

// Additional schema exports for API routes
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(true),
  limit: z.number().int().min(1).max(100).default(true),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default("REGULAR"),
  search: z.string().optional()
})

export const IdParamSchema = z.object({
  id: z.string().uuid('validation.invalidIdFormat')
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
  } catch (error: any) {
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

// ============================================================================
// UTILITY VALIDATION FUNCTIONS
// ============================================================================

/**
 * Generic input validation helper
 */
export function validateInput(data: any, rules?: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const [field, rule] of Object.entries(rules || {})) {
    const value = data[field]

    if (rule?.required && (!value || value === '')) {
      errors.push(`validation.fieldRequired`)
      continue
    }

    if (value) {
      if (rule?.type && typeof value !== rule?.type) {
        errors.push(`validation.invalidType`)
      }

      if (rule?.minLength && value.length < rule?.minLength) {
        errors.push(`validation.minLength`)
      }

      if (rule?.maxLength && value.length > rule?.maxLength) {
        errors.push(`validation.maxLength`)
      }

      if (rule?.pattern && !rule?.pattern?.test(data[field])) {
        errors.push(`validation.invalidFormat`)
      }

      if (rule?.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[field])) {
        errors.push(`validation.invalidEmail`)
      }

      if (typeof value === 'string' && /<script|javascript:|on\w+=/i.test(value)) {
        errors.push(`validation.dangerousContent`)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * SQL injection prevention sanitization
 */
export function sanitizeSQL(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/xp_/gi, '')
    .replace(/sp_/gi, '')
}
