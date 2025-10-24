// Database validation schemas
// Validation schemas specifically for database operations and CRUD

import { z } from 'zod'
import {
  UUIDSchema,
  EmailSchema,
  PhoneSchema,
  DateStringSchema,
  PositiveNumberSchema,
  NonNegativeNumberSchema,
  OrderStatusEnum,
  PaymentMethodEnum,
  BusinessUnitEnum,
  RecordTypeEnum,
  TransactionTypeEnum
} from './base-validations'

// Customer database schemas
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

// Order database schemas
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

// Payment database schemas
export const PaymentInsertSchema = z.object({
  order_id: UUIDSchema,
  amount: PositiveNumberSchema,
  method: PaymentMethodEnum,
  reference: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

// Ingredient database schemas
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

// Recipe database schemas
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

// Supplier database schemas
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

// Operational costs database schemas
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

// Expenses database schemas
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

// Sales database schemas
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

export const IngredientPurchaseInsertSchema = z.object({
  bahan_id: UUIDSchema,
  supplier: z.string().max(255).optional().nullable(),
  qty_beli: PositiveNumberSchema,
  harga_satuan: NonNegativeNumberSchema,
  tanggal_beli: DateStringSchema.optional(),
  catatan: z.string().max(500).optional().nullable()
})

export const IngredientPurchaseUpdateSchema = IngredientPurchaseInsertSchema.partial()

// Type exports for ingredient purchase schemas
export type IngredientPurchaseInsert = z.infer<typeof IngredientPurchaseInsertSchema>
export type IngredientPurchaseUpdate = z.infer<typeof IngredientPurchaseUpdateSchema>
