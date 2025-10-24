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

// Enhanced base schemas from schemas.ts
export const UUIDSchema = z.string().uuid()
export const EmailSchema = z.string().email()
export const PhoneSchema = z.string().regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/, 'Invalid Indonesian phone number')
export const DateStringSchema = z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date string')
export const PositiveNumberSchema = z.number().positive()
export const NonNegativeNumberSchema = z.number().nonnegative()

// Enums from schemas.ts
export const OrderStatusEnum = z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'])
export const PaymentMethodEnum = z.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DIGITAL_WALLET', 'OTHER'])
export const UserRoleEnum = z.enum(['OWNER', 'MANAGER', 'STAFF', 'VIEWER'])
export const ProductionStatusEnum = z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
export const BusinessUnitEnum = z.enum(['RESTAURANT', 'CAFE', 'BAKERY', 'CATERING', 'OTHER'])
export const RecordTypeEnum = z.enum(['INCOME', 'EXPENSE'])
export const TransactionTypeEnum = z.enum(['SALES', 'PURCHASE', 'SALARY', 'RENT', 'UTILITIES', 'OTHER'])

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
  loyalty_points: nonNegativeNumber.optional().default(0),
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
  }).default("PENDING"),
  order_date: z.string().datetime(),
  delivery_date: z.string().datetime().optional(),
  total_amount: rupiah,
  discount: nonNegativeNumber.optional().default(0),
  tax: nonNegativeNumber.optional().default(0),
  payment_method: z.enum(['CASH', 'TRANSFER', 'CREDIT_CARD', 'E_WALLET'], {
    message: 'validation.invalidPaymentMethod'
  }).optional(),
  payment_status: z.enum(['PENDING', 'PAID', 'PARTIAL', 'REFUNDED'], {
    message: 'validation.invalidPaymentStatus'
  }).default("PENDING"),
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
  }).default("PLANNED"),
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

// ============================================================================
// COMPREHENSIVE DATABASE SCHEMAS (from schemas.ts)
// ============================================================================

// Database-focused schemas from schemas.ts
// Customer schemas
export const CustomerInsertSchema = z.object({
  name: z.string().min(1, 'Customer name is required').max(255),
  email: EmailSchema.optional().nullable(),
  phone: PhoneSchema.optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  customer_type: z.string().max(50).optional().nullable(),
  discount_percentage: NonNegativeNumberSchema.max(100).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  is_active: z.boolean().default(true).optional().nullable(),
  loyalty_points: NonNegativeNumberSchema.default(0).optional().nullable(),
  favorite_items: z.unknown().optional().nullable(),
})

export const CustomerUpdateSchema = CustomerInsertSchema.partial()

// Order schemas
export const OrderItemInsertSchema = z.object({
  recipe_id: UUIDSchema,
  product_name: z.string().max(255).optional().nullable(),
  quantity: PositiveNumberSchema,
  unit_price: NonNegativeNumberSchema,
  total_price: NonNegativeNumberSchema,
  special_requests: z.string().max(500).optional().nullable(),
})

export const OrderInsertSchema = z.object({
  order_no: z.string().min(1, 'Order number is required').max(50),
  customer_id: UUIDSchema.optional().nullable(),
  customer_name: z.string().min(1, 'Customer name is required').max(255),
  customer_phone: PhoneSchema.optional().nullable(),
  customer_address: z.string().max(500).optional().nullable(),
  order_date: DateStringSchema.optional().nullable(),
  delivery_date: DateStringSchema.optional().nullable(),
  delivery_time: z.string().max(50).optional().nullable(),
  delivery_fee: NonNegativeNumberSchema.optional().nullable(),
  status: OrderStatusEnum.optional().nullable(),
  priority: z.string().max(50).optional().nullable(),
  payment_method: PaymentMethodEnum.optional().nullable(),
  payment_status: z.string().max(50).optional().nullable(),
  discount: NonNegativeNumberSchema.optional().nullable(),
  tax_amount: NonNegativeNumberSchema.optional().nullable(),
  total_amount: NonNegativeNumberSchema.optional().nullable(),
  paid_amount: NonNegativeNumberSchema.optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  special_instructions: z.string().max(1000).optional().nullable(),
  items: z.array(OrderItemInsertSchema).min(1, 'Order must have at least one item'),
}).refine((data) => {
  if (data.total_amount && data.paid_amount) {
    return data.paid_amount <= data.total_amount
  }
  return true
}, 'Paid amount cannot exceed total amount')

export const OrderUpdateSchema = OrderInsertSchema.omit({ order_no: true, items: true }).partial()

// Payment schemas
export const PaymentInsertSchema = z.object({
  order_id: UUIDSchema,
  amount: PositiveNumberSchema,
  method: PaymentMethodEnum,
  reference: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

// Ingredient schemas
export const IngredientInsertSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required').max(255),
  category: z.string().min(1, 'Category is required').max(100),
  unit: z.string().min(1, 'Unit is required').max(50),
  current_stock: NonNegativeNumberSchema.default(0),
  minimum_stock: NonNegativeNumberSchema.default(0),
  maximum_stock: NonNegativeNumberSchema.optional().nullable(),
  unit_cost: NonNegativeNumberSchema,
  supplier_id: UUIDSchema.optional().nullable(),
  is_active: z.boolean().default(true),
  description: z.string().max(500).optional().nullable(),
  storage_location: z.string().max(100).optional().nullable(),
  expiry_date: DateStringSchema.optional().nullable(),
  nutritional_info: z.unknown().optional().nullable(),
})

export const IngredientUpdateSchema = IngredientInsertSchema.partial()

// Recipe schemas
export const RecipeIngredientInsertSchema = z.object({
  ingredient_id: UUIDSchema,
  quantity: PositiveNumberSchema,
  unit: z.string().max(50),
})

export const RecipeInsertSchema = z.object({
  name: z.string().min(1, 'Recipe name is required').max(255),
  description: z.string().max(1000).optional().nullable(),
  category: z.string().min(1, 'Category is required').max(100),
  serving_size: PositiveNumberSchema,
  preparation_time: NonNegativeNumberSchema,
  cooking_time: NonNegativeNumberSchema,
  instructions: z.string().min(1, 'Instructions are required'),
  ingredients: z.array(RecipeIngredientInsertSchema).min(1, 'Recipe must have at least one ingredient'),
  selling_price: NonNegativeNumberSchema,
  cost_price: NonNegativeNumberSchema.optional().nullable(),
  profit_margin: NonNegativeNumberSchema.optional().nullable(),
  is_active: z.boolean().default(true),
  image_url: z.string().url().optional().nullable(),
  nutritional_info: z.unknown().optional().nullable(),
}).refine((data) => {
  if (data.cost_price && data.selling_price) {
    return data.selling_price >= data.cost_price
  }
  return true
}, 'Selling price must be greater than or equal to cost price')

export const RecipeUpdateSchema = RecipeInsertSchema.partial()

// Supplier schemas
export const SupplierInsertSchema = z.object({
  name: z.string().min(1, 'Supplier name is required').max(255),
  contact_person: z.string().max(255).optional().nullable(),
  email: EmailSchema.optional().nullable(),
  phone: PhoneSchema.optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  payment_terms: z.string().max(100).optional().nullable(),
  is_active: z.boolean().default(true),
  notes: z.string().max(1000).optional().nullable(),
})

export const SupplierUpdateSchema = SupplierInsertSchema.partial()

// Operational costs schemas
export const OperationalCostInsertSchema = z.object({
  category: z.string().min(1, 'Category is required').max(100),
  subcategory: z.string().max(100).optional().nullable(),
  description: z.string().min(1, 'Description is required').max(500),
  amount: PositiveNumberSchema,
  cost_date: DateStringSchema,
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'ONE_TIME']).default('MONTHLY'),
  is_recurring: z.boolean().default(true),
  allocated_percentage: z.record(z.string(), NonNegativeNumberSchema).optional(),
})

export const OperationalCostUpdateSchema = OperationalCostInsertSchema.partial()

// Expenses schemas
export const ExpenseInsertSchema = z.object({
  amount: PositiveNumberSchema,
  category: z.string().min(1, 'Category is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  expense_date: DateStringSchema.optional().nullable(),
  payment_method: z.string().max(50).optional().nullable(),
  supplier: z.string().max(255).optional().nullable(),
  receipt_number: z.string().max(100).optional().nullable(),
  tax_amount: NonNegativeNumberSchema.optional().nullable(),
  is_recurring: z.boolean().default(false).optional().nullable(),
  recurring_frequency: z.string().max(50).optional().nullable(),
  status: z.string().max(50).optional().nullable(),
  subcategory: z.string().max(100).optional().nullable(),
  tags: z.unknown().optional().nullable(),
  metadata: z.unknown().optional().nullable(),
  reference_type: z.string().max(50).optional().nullable(),
  reference_id: UUIDSchema.optional().nullable(),
})

export const ExpenseUpdateSchema = ExpenseInsertSchema.partial()

// API request/response schemas
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

export const DateRangeQuerySchema = z.object({
  start_date: DateStringSchema.optional(),
  end_date: DateStringSchema.optional(),
})

// Form schemas for frontend validation (handles form-specific requirements)
export const OrderFormSchema = OrderInsertSchema.omit({ order_no: true, items: true }).extend({
  items: z.array(OrderItemInsertSchema).min(1, 'Order must have at least one item'),
})

export const CustomerFormSchema = z.object({
  name: z.string().min(1, 'Customer name is required').max(255),
  email: z.string().email().optional().or(z.literal('')),
  phone: PhoneSchema.optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  customer_type: z.string().max(50).optional().or(z.literal('')),
  discount_percentage: NonNegativeNumberSchema.max(100).optional(),
  notes: z.string().max(1000).optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  loyalty_points: NonNegativeNumberSchema.default(0),
  favorite_items: z.unknown().optional(),
})

export const IngredientFormSchema = IngredientInsertSchema
export const RecipeFormSchema = RecipeInsertSchema
export const SupplierFormSchema = SupplierInsertSchema

// Type exports for comprehensive schemas
export type CustomerInsert = z.infer<typeof CustomerInsertSchema>
export type CustomerUpdate = z.infer<typeof CustomerUpdateSchema>
export type OrderInsert = z.infer<typeof OrderInsertSchema>
export type OrderUpdate = z.infer<typeof OrderUpdateSchema>
export type PaymentInsert = z.infer<typeof PaymentInsertSchema>
export type IngredientInsert = z.infer<typeof IngredientInsertSchema>
export type IngredientUpdate = z.infer<typeof IngredientUpdateSchema>
export type RecipeInsert = z.infer<typeof RecipeInsertSchema>
export type RecipeUpdate = z.infer<typeof RecipeUpdateSchema>
export type SupplierInsert = z.infer<typeof SupplierInsertSchema>
export type SupplierUpdate = z.infer<typeof SupplierUpdateSchema>
export type OperationalCostInsert = z.infer<typeof OperationalCostInsertSchema>
export type OperationalCostUpdate = z.infer<typeof OperationalCostUpdateSchema>
export type ExpenseInsert = z.infer<typeof ExpenseInsertSchema>
export type ExpenseUpdate = z.infer<typeof ExpenseUpdateSchema>
export type SalesInsert = z.infer<typeof SalesInsertSchema>
export type SalesUpdate = z.infer<typeof SalesUpdateSchema>

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>
export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>
export type OrderForm = z.infer<typeof OrderFormSchema>
export type CustomerForm = z.infer<typeof CustomerFormSchema>
export type IngredientForm = z.infer<typeof IngredientFormSchema>
export type RecipeForm = z.infer<typeof RecipeFormSchema>
export type SupplierForm = z.infer<typeof SupplierFormSchema>

// ============================================================================
export const BulkIngredientSchema = z.object({
  ingredients: z.array(IngredientSchema).min(1, 'validation.minOneIngredient')
})

export const BulkRecipeSchema = z.object({
  recipes: z.array(RecipeSchema).min(1, 'validation.minOneRecipe')
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
  } catch (error: unknown) {
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

// ============================================================================
// LEGACY VALIDATION FUNCTIONS (still used in supabase.ts)
// ============================================================================

/**
 * Generic input validation helper
 */
export function validateInput(data: any, rules?: Record<string, any>): { isValid: boolean; errors: string[] } {
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

      if (rule?.pattern && !rule?.pattern?.test(value)) {
        errors.push(`validation.invalidFormat`)
      }

      if (rule?.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
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

// ============================================================================
// ENVIRONMENT VARIABLE VALIDATION
// ============================================================================

export const EnvSchema = z.object({
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),

  // AI Services (at least one required)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // Application Settings
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']),

  // Optional: Cron Job Authentication
  CRON_SECRET: z.string().optional(),
}).refine((env) => {
  // At least one AI service must be configured
  return env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY
}, {
  message: 'At least one AI service (OpenAI or Anthropic) must be configured',
  path: ['OPENAI_API_KEY']
})

// Type for validated environment
export type EnvConfig = z.infer<typeof EnvSchema>

// Function to validate environment variables
export function validateEnvironment(): EnvConfig {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NODE_ENV: process.env.NODE_ENV || 'development',
    CRON_SECRET: process.env.CRON_SECRET,
  }

  const validation = EnvSchema.safeParse(env)

  if (!validation.success) {
    console.error('❌ Environment validation failed:')
    validation.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
    })
    throw new Error('Invalid environment configuration')
  }

  return validation.data
}

// ============================================================================
// HPP API VALIDATION SCHEMAS
// ============================================================================

export const TimePeriodEnum = z.enum(['7d', '30d', '90d', '1y', 'all'])
export type TimePeriod = z.infer<typeof TimePeriodEnum>

export const HPPExportQuerySchema = z.object({
  recipe_id: UUIDSchema,
  period: TimePeriodEnum.default('30d'),
  format: z.enum(['excel', 'csv', 'json']).default('excel'),
})

export const HPPComparisonQuerySchema = z.object({
  recipe_ids: z.array(UUIDSchema).min(1).max(10),
  period: TimePeriodEnum.default('30d'),
})

export const HPPAnalysisQuerySchema = z.object({
  recipe_id: UUIDSchema.optional(),
  period: TimePeriodEnum.default('30d'),
  include_cost_breakdown: z.coerce.boolean().default(true),
  include_trends: z.coerce.boolean().default(true),
})

// ============================================================================
// REPORTS API VALIDATION SCHEMAS
// ============================================================================

export const ReportTypeEnum = z.enum([
  'sales', 'inventory', 'profit', 'customers', 'orders',
  'hpp', 'operational_costs', 'financial', 'trends'
])

export const ReportQuerySchema = z.object({
  type: ReportTypeEnum,
  start_date: DateStringSchema.optional(),
  end_date: DateStringSchema.optional(),
  format: z.enum(['json', 'excel', 'pdf']).default('json'),
  group_by: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
})

// ============================================================================
// FILE UPLOAD VALIDATION SCHEMAS
// ============================================================================

export const FileUploadSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'), // 10MB
  type: z.string().refine(
    (type) => {
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv'
      ]
      return allowedTypes.includes(type)
    },
    'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, PDF, Excel, CSV'
  ),
  lastModified: z.number().optional(),
})

export const ImageUploadSchema = FileUploadSchema.extend({
  type: z.string().refine(
    (type) => type.startsWith('image/'),
    'File must be an image'
  ),
  width: z.number().min(100).max(4096).optional(),
  height: z.number().min(100).max(4096).optional(),
})

// ============================================================================
// UTILITY FUNCTION VALIDATION SCHEMAS
// ============================================================================

export const CurrencyFormatSchema = z.object({
  amount: NonNegativeNumberSchema,
  currency: z.string().default('IDR'),
  locale: z.string().default('id-ID'),
  showSymbol: z.boolean().default(true),
})

export const DateRangeSchema = z.object({
  start: DateStringSchema,
  end: DateStringSchema,
}).refine((data) => {
  return new Date(data.start) <= new Date(data.end)
}, 'Start date must be before or equal to end date')

export const PaginationParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// ============================================================================
// CONFIGURATION VALIDATION SCHEMAS
// ============================================================================

export const AppSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.string().default('id'),
  currency: z.string().default('IDR'),
  timezone: z.string().default('Asia/Jakarta'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    hpp_alerts: z.boolean().default(true),
    inventory_alerts: z.boolean().default(true),
  }).default({}),
  business_info: z.object({
    name: z.string().max(255),
    address: z.string().max(500).optional(),
    phone: PhoneSchema.optional(),
    email: EmailSchema.optional(),
    tax_id: z.string().max(50).optional(),
  }).optional(),
})

// ============================================================================
// WEBHOOK AND INTEGRATION SCHEMAS
// ============================================================================

export const WebhookPayloadSchema = z.object({
  event: z.string().min(1),
  data: z.unknown(),
  timestamp: z.string().datetime(),
  signature: z.string().optional(),
})

// Sales validation schemas
export const SalesInsertSchema = z.object({
  recipe_id: UUIDSchema,
  quantity: PositiveNumberSchema,
  unit_price: NonNegativeNumberSchema,
  total_amount: NonNegativeNumberSchema,
  date: DateStringSchema,
  customer_name: z.string().max(255).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
}).refine((data) => {
  // Validate total amount calculation
  const expectedTotal = data.quantity * data.unit_price
  return Math.abs(data.total_amount - expectedTotal) < 0.01
}, 'Total amount must equal quantity × unit price')

export const SalesUpdateSchema = SalesInsertSchema.partial()

export const SalesQuerySchema = z.object({
  start_date: DateStringSchema.optional(),
  end_date: DateStringSchema.optional(),
  recipe_id: UUIDSchema.optional(),
  customer_name: z.string().optional(),
})

// ============================================================================
// SETTINGS VALIDATION SCHEMAS
// ============================================================================

export const UserProfileSettingsSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100, 'Nama lengkap maksimal 100 karakter'),
  email: EmailSchema.optional(),
  phone: PhoneSchema.optional(),
  avatar: z.string().url('URL avatar tidak valid').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio maksimal 500 karakter').optional().or(z.literal('')),
  language: z.enum(['id', 'en']).default('id'),
  timezone: z.string().min(1, 'Timezone diperlukan'),
})

export const BusinessInfoSettingsSchema = z.object({
  businessName: z.string().min(1, 'Nama bisnis diperlukan').max(255, 'Nama bisnis maksimal 255 karakter'),
  businessType: z.enum(['bakery', 'cafe', 'restaurant', 'food-truck', 'catering', 'other']),
  taxId: z.string().max(50, 'NPWP maksimal 50 karakter').optional().or(z.literal('')),
  address: z.string().max(500, 'Alamat maksimal 500 karakter').optional().or(z.literal('')),
  phone: PhoneSchema.optional(),
  email: EmailSchema.optional(),
  website: z.string().url('URL website tidak valid').optional().or(z.literal('')),
  description: z.string().max(1000, 'Deskripsi maksimal 1000 karakter').optional().or(z.literal('')),
})

export const NotificationSettingsSchema = z.object({
  email: z.object({
    orders: z.boolean().default(true),
    inventory: z.boolean().default(true),
    finance: z.boolean().default(true),
    system: z.boolean().default(true),
  }).default({}),
  push: z.object({
    orders: z.boolean().default(true),
    inventory: z.boolean().default(false),
    finance: z.boolean().default(false),
    system: z.boolean().default(true),
  }).default({}),
  sms: z.object({
    critical: z.boolean().default(true),
    orders: z.boolean().default(false),
  }).default({}),
})

export const RegionalSettingsSchema = z.object({
  language: z.enum(['id', 'en', 'jv']).default('id'),
  timezone: z.string().min(1, 'Timezone diperlukan'),
  currency: z.enum(['IDR', 'USD', 'EUR', 'SGD', 'MYR']).default('IDR'),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD/MM/YYYY'),
  timeFormat: z.enum(['12h', '24h']).default('24h'),
  numberFormat: z.enum(['id', 'en']).default('id'),
})

export const SecuritySettingsSchema = z.object({
  twoFactorEnabled: z.boolean().default(false),
  sessionTimeout: z.number().min(5).max(480).default(60), // minutes
  passwordMinLength: z.number().min(8).max(32).default(12),
  loginNotifications: z.boolean().default(true),
  suspiciousActivityAlerts: z.boolean().default(true),
})

export const BackupSettingsSchema = z.object({
  autoBackup: z.boolean().default(true),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  retentionPeriod: z.number().min(1).max(365).default(30), // days
  backupLocation: z.enum(['local', 'cloud', 'both']).default('both'),
  includeAttachments: z.boolean().default(true),
  encryptBackups: z.boolean().default(true),
})

export const ThemeSettingsSchema = z.object({
  mode: z.enum(['light', 'dark', 'system']).default('system'),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Warna harus dalam format hex').default('#3b82f6'),
  fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
  compactMode: z.boolean().default(false),
  animations: z.boolean().default(true),
})

// Combined settings schema
export const AppSettingsSchema = z.object({
  user: UserProfileSettingsSchema.optional(),
  business: BusinessInfoSettingsSchema.optional(),
  notifications: NotificationSettingsSchema.optional(),
  regional: RegionalSettingsSchema.optional(),
  security: SecuritySettingsSchema.optional(),
  backup: BackupSettingsSchema.optional(),
  theme: ThemeSettingsSchema.optional(),
})

// ============================================================================
// BUSINESS LOGIC VALIDATION SCHEMAS
// ============================================================================

// HPP Calculation validation
export const HPPCalculationInputSchema = z.object({
  ingredients: z.array(z.object({
    ingredientId: UUIDSchema,
    name: z.string().min(1),
    quantity: PositiveNumberSchema,
    unit: z.string().min(1),
    unitCost: NonNegativeNumberSchema,
    totalCost: NonNegativeNumberSchema,
  })).min(1, 'Minimal 1 bahan diperlukan'),

  laborCost: NonNegativeNumberSchema.default(0),
  overheadCost: NonNegativeNumberSchema.default(0),
  packagingCost: NonNegativeNumberSchema.default(0),
  operationalCosts: z.array(z.object({
    category: z.string().min(1),
    amount: NonNegativeNumberSchema,
    allocation: NonNegativeNumberSchema.min(0).max(100),
  })).default([]),

  sellingPrice: NonNegativeNumberSchema.optional(),
  targetMargin: z.number().min(0).max(1).default(0.3), // 30% default margin
  taxRate: z.number().min(0).max(1).default(0.11), // 11% PPN default
}).refine((data) => {
  // Validate that total costs are reasonable
  const totalIngredientCost = data.ingredients.reduce((sum, ing) => sum + ing.totalCost, 0)
  const totalOperationalCost = data.laborCost + data.overheadCost + data.packagingCost

  if (totalIngredientCost === 0) {
    return false // Must have ingredients
  }

  // Selling price should be higher than total cost
  if (data.sellingPrice && data.sellingPrice <= (totalIngredientCost + totalOperationalCost)) {
    return false
  }

  return true
}, {
  message: 'Harga jual harus lebih tinggi dari total biaya',
  path: ['sellingPrice']
})

// Currency formatting validation
export const CurrencyFormatSchema = z.object({
  amount: NonNegativeNumberSchema,
  currency: z.enum(['IDR', 'USD', 'EUR', 'SGD', 'MYR']).default('IDR'),
  locale: z.string().default('id-ID'),
  showSymbol: z.boolean().default(true),
  decimals: z.number().min(0).max(4).default(0),
  useGrouping: z.boolean().default(true),
})

// Inventory calculation validation
export const InventoryCalculationSchema = z.object({
  currentStock: NonNegativeNumberSchema,
  minimumStock: NonNegativeNumberSchema,
  maximumStock: NonNegativeNumberSchema.optional(),
  reorderPoint: NonNegativeNumberSchema,
  reorderQuantity: PositiveNumberSchema,
  leadTime: z.number().min(1).max(365).default(7), // days
  consumptionRate: NonNegativeNumberSchema, // per day
}).refine((data) => {
  // Business rules for inventory
  if (data.minimumStock > data.currentStock) {
    return false // Current stock should be above minimum
  }

  if (data.maximumStock && data.maximumStock < data.currentStock) {
    return false // Current stock should be below maximum
  }

  return true
}, {
  message: 'Stok saat ini harus antara minimum dan maximum',
  path: ['currentStock']
})

// Sales calculation validation
export const SalesCalculationSchema = z.object({
  items: z.array(z.object({
    recipeId: UUIDSchema,
    quantity: PositiveNumberSchema,
    unitPrice: NonNegativeNumberSchema,
    discount: NonNegativeNumberSchema.default(0),
  })).min(1),

  taxes: z.array(z.object({
    name: z.string().min(1),
    rate: z.number().min(0).max(1),
    amount: NonNegativeNumberSchema,
  })).default([]),

  discounts: z.array(z.object({
    type: z.enum(['percentage', 'fixed']),
    value: NonNegativeNumberSchema,
    description: z.string().optional(),
  })).default([]),

  paymentMethod: PaymentMethodEnum,
  customerId: UUIDSchema.optional(),
}).refine((data) => {
  // Validate that discounts don't exceed item values
  const totalItemsValue = data.items.reduce((sum, item) =>
    sum + (item.quantity * item.unitPrice), 0)

  const totalDiscountValue = data.discounts.reduce((sum, discount) => {
    if (discount.type === 'percentage') {
      return sum + (totalItemsValue * discount.value)
    }
    return sum + discount.value
  }, 0)

  return totalDiscountValue <= totalItemsValue
}, {
  message: 'Total diskon tidak boleh melebihi nilai pesanan',
  path: ['discounts']
})

// Report generation validation
export const ReportGenerationSchema = z.object({
  type: z.enum(['sales', 'inventory', 'profit', 'customers', 'orders', 'hpp', 'financial']),
  dateRange: z.object({
    start: DateStringSchema,
    end: DateStringSchema,
  }).refine((range) => new Date(range.start) <= new Date(range.end), {
    message: 'Tanggal mulai harus sebelum tanggal akhir',
    path: ['start']
  }),

  filters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  groupBy: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
  format: z.enum(['json', 'excel', 'pdf']).default('json'),
  includeCharts: z.boolean().default(false),
  includeSummary: z.boolean().default(true),
})

// Cron job configuration validation
export const CronJobConfigSchema = z.object({
  name: z.string().min(1, 'Nama job diperlukan'),
  schedule: z.string().regex(/^(\*|(\d+)) (\*|(\d+)) (\*|(\d+)) (\*|(\d+)) (\*|(\d+))$/, 'Format cron tidak valid'),
  enabled: z.boolean().default(true),
  timeout: z.number().min(1000).max(3600000).default(300000), // 5 minutes max
  retryAttempts: z.number().min(0).max(10).default(3),
  retryDelay: z.number().min(1000).max(300000).default(60000), // 1 minute default
  notificationOnFailure: z.boolean().default(true),
  priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
})

// Type exports for business logic
export type HPPCalculationInput = z.infer<typeof HPPCalculationInputSchema>
export type CurrencyFormat = z.infer<typeof CurrencyFormatSchema>
export type InventoryCalculation = z.infer<typeof InventoryCalculationSchema>
export type SalesCalculation = z.infer<typeof SalesCalculationSchema>
export type ReportGeneration = z.infer<typeof ReportGenerationSchema>
export type CronJobConfig = z.infer<typeof CronJobConfigSchema>
