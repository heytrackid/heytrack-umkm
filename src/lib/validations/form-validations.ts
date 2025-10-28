// Form validation schemas
// Validation schemas specifically for form submissions and user input

import { z } from 'zod'
import {
  UUIDSchema,
  EmailSchema,
  PhoneSchema,
  DateStringSchema,
  PositiveNumberSchema,
  NonNegativeNumberSchema,
  indonesianName,
  optionalString,
  positiveNumber,
  rupiah,
  percentage
} from './base-validations'

// Common validation field types for forms
const RequiredString = z.string().min(1, 'Field ini wajib diisi')
const EmailField = EmailSchema
const PhoneField = PhoneSchema

// Ingredient validation schema
export const IngredientSchema = z.object({
  name: indonesianName,
  description: optionalString,
  unit: z.enum(['kg', 'gram', 'liter', 'ml', 'pcs', 'pack'], {
    message: 'validation.invalidUnit'
  }),
  price_per_unit: rupiah,
  current_stock: positiveNumber,
  min_stock: positiveNumber,
  max_stock: positiveNumber.optional(),
  supplier: optionalString,
  category: optionalString,
  storage_requirements: optionalString,
  expiry_date: z.string().datetime().optional(),
  cost_per_unit: rupiah.optional(),
  usage_rate_daily: positiveNumber.optional(),
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
  recipe_id: UUIDSchema,
  ingredient_id: UUIDSchema,
  quantity: positiveNumber,
  unit: z.string().min(1, 'validation.unitRequired'),
  notes: optionalString
})

export type RecipeIngredientFormData = z.infer<typeof RecipeIngredientSchema>

// Customer validation schema
export const CustomerSchema = z.object({
  name: indonesianName,
  email: EmailSchema.optional(),
  phone: PhoneSchema.optional(),
  address: optionalString,
  birth_date: z.string().datetime().optional(),
  loyalty_points: positiveNumber.optional().default(0),
  customer_type: z.enum(['REGULAR', 'VIP', 'WHOLESALE'], {
    message: 'validation.invalidCustomerType'
  }).optional().default("REGULAR"),
  notes: optionalString,
  is_active: z.boolean().default(true)
}).refine(data => 
  // At least one contact method should be provided
   data.email || data.phone
, {
  message: 'validation.contactRequired',
  path: ['email']
})

export type CustomerFormData = z.infer<typeof CustomerSchema>

// Order validation schema
export const OrderSchema = z.object({
  order_no: z.string().min(1, 'validation.orderNumberRequired'),
  customer_id: UUIDSchema.optional(),
  customer_name: optionalString,
  customer_phone: PhoneSchema.optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'], {
    message: 'validation.invalidOrderStatus'
  }).default("PENDING"),
  order_date: z.string().datetime(),
  delivery_date: z.string().datetime().optional(),
  total_amount: rupiah,
  discount: positiveNumber.optional().default(0),
  tax: positiveNumber.optional().default(0),
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
  order_id: UUIDSchema,
  recipe_id: UUIDSchema.optional(),
  product_name: z.string().min(1, 'validation.productNameRequired'),
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
  recipe_id: UUIDSchema,
  planned_quantity: positiveNumber,
  actual_quantity: positiveNumber.optional(),
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
  category: z.string().min(1, 'validation.categoryRequired'),
  amount: rupiah,
  description: z.string().min(1, 'validation.descriptionRequired'),
  date: z.string().datetime(),
  payment_method: z.enum(['CASH', 'TRANSFER', 'CREDIT_CARD', 'E_WALLET'], {
    message: 'validation.invalidPaymentMethod'
  }).optional(),
  reference_no: optionalString,
  receipt_url: z.string().url('validation.invalidReceiptUrl').optional(),
  is_recurring: z.boolean().optional(),
  recurring_period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'], {
    message: 'validation.invalidRecurringPeriod'
  }).optional(),
  tags: z.array(z.string()).optional(),
  notes: optionalString
})

export type FinancialRecordFormData = z.infer<typeof FinancialRecordSchema>

// Stock Transaction validation schema
export const StockTransactionSchema = z.object({
  ingredient_id: UUIDSchema,
  transaction_type: z.enum(['IN', 'OUT', 'ADJUSTMENT'], {
    message: 'validation.invalidTransactionType'
  }),
  quantity: positiveNumber,
  unit: z.string().min(1, 'validation.unitRequired'),
  unit_cost: rupiah.optional(),
  total_cost: rupiah.optional(),
  reference_type: z.enum(['PURCHASE', 'PRODUCTION', 'SALE', 'WASTE', 'ADJUSTMENT'], {
    message: 'validation.invalidReferenceType'
  }).optional(),
  reference_id: UUIDSchema.optional(),
  notes: optionalString,
  transaction_date: z.string().datetime()
})

export type StockTransactionFormData = z.infer<typeof StockTransactionSchema>

// Bulk validation schemas
export const BulkIngredientSchema = z.object({
  ingredients: z.array(IngredientSchema).min(1, 'validation.minOneIngredient')
})

export const BulkRecipeSchema = z.object({
  recipes: z.array(RecipeSchema).min(1, 'validation.minOneRecipe')
})

// Supplier forms
export const SupplierFormSchema = z.object({
  name: RequiredString.max(255, 'Nama maksimal 255 karakter'),
  contact_person: z.string().max(255, 'Contact person maksimal 255 karakter').optional().or(z.literal('')),
  email: EmailField.optional().or(z.literal('')),
  phone: PhoneField.optional().or(z.literal('')),
  address: z.string().max(500, 'Alamat maksimal 500 karakter').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional().or(z.literal(''))
})

export const SupplierCreateSchema = SupplierFormSchema
export const SupplierUpdateSchema = SupplierFormSchema.partial()

// Operational Cost Form Schema
export const OperationalCostFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  frequency: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME']),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
})

// Simple Ingredient Form Schema (matches the form fields used)
export const IngredientFormSchema = z.object({
  name: indonesianName,
  unit: z.enum(['kg', 'g', 'l', 'ml', 'pcs', 'dozen'], {
    message: 'Satuan tidak valid'
  }),
  price_per_unit: z.number().positive('Harga harus lebih dari 0'),
  current_stock: positiveNumber,
  min_stock: positiveNumber.optional(),
  description: optionalString
}).refine(data => {
  // Custom validation: min_stock should be less than or equal to current_stock
  const minStock = data.min_stock
  if (minStock && data.current_stock && minStock > data.current_stock) {
    return false
  }
  return true
}, {
  message: 'Stok minimum tidak boleh lebih besar dari stok tersedia',
  path: ['min_stock']
})

// Use the existing IngredientFormData type but make it compatible with form
export type SimpleIngredientFormData = z.infer<typeof IngredientFormSchema>

// Type exports for forms
export type CustomerForm = z.infer<typeof CustomerSchema>
export type IngredientForm = z.infer<typeof IngredientSchema>
export type RecipeForm = z.infer<typeof RecipeSchema>
export type OrderForm = z.infer<typeof OrderSchema>
export type ExpenseForm = z.infer<typeof FinancialRecordSchema>
export type SupplierForm = z.infer<typeof SupplierFormSchema>
export type OperationalCostForm = z.infer<typeof OperationalCostFormSchema>

// Order validation helper function (moved from components/orders/utils.ts)
export function validateOrderData(data: Record<string, unknown>): string[] {
  const errors: string[] = []

  if (!data.customer_name?.trim()) {
    errors.push('Nama pelanggan harus diisi')
  }

  if (!data.customer_phone?.trim()) {
    errors.push('Nomor telepon harus diisi')
  }

  if (!data.delivery_date) {
    errors.push('Tanggal pengiriman harus diisi')
  }

  if (!data.order_items || data.order_items.length === 0) {
    errors.push('Minimal harus ada 1 item pesanan')
  }

  return errors
}
