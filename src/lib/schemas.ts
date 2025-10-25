import { z } from 'zod'

// Enums
export const OrderStatusEnum = z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'])
export const PaymentMethodEnum = z.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DIGITAL_WALLET', 'OTHER'])
export const UserRoleEnum = z.enum(['OWNER', 'MANAGER', 'STAFF', 'VIEWER'])
export const ProductionStatusEnum = z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
export const BusinessUnitEnum = z.enum(['RESTAURANT', 'CAFE', 'UMKM', 'CATERING', 'OTHER'])
export const RecordTypeEnum = z.enum(['INCOME', 'EXPENSE'])
export const TransactionTypeEnum = z.enum(['SALES', 'PURCHASE', 'SALARY', 'RENT', 'UTILITIES', 'OTHER'])

// Base schemas
export const UUIDSchema = z.string().uuid()
export const EmailSchema = z.string().email()
export const PhoneSchema = z.string().regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/, 'Invalid Indonesian phone number')
export const DateStringSchema = z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date string')
export const PositiveNumberSchema = z.number().positive()
export const NonNegativeNumberSchema = z.number().nonnegative()

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
  favorite_items: z.array(z.string()).optional().nullable(), // Array of item IDs
})

export const CustomerUpdateSchema = CustomerInsertSchema.partial()

// Order schemas
export const OrderItemSchema = z.object({
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
  items: z.array(OrderItemSchema).min(1, 'Order must have at least one item'),
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
  nutritional_info: z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional(),
    fiber: z.number().optional(),
    sugar: z.number().optional(),
  }).optional().nullable(),
})

export const IngredientUpdateSchema = IngredientInsertSchema.partial()

// Recipe schemas
export const RecipeIngredientSchema = z.object({
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
  ingredients: z.array(RecipeIngredientSchema).min(1, 'Recipe must have at least one ingredient'),
  selling_price: NonNegativeNumberSchema,
  cost_price: NonNegativeNumberSchema.optional().nullable(),
  profit_margin: NonNegativeNumberSchema.optional().nullable(),
  is_active: z.boolean().default(true),
  image_url: z.string().url().optional().nullable(),
  nutritional_info: z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional(),
    fiber: z.number().optional(),
    sugar: z.number().optional(),
  }).optional().nullable(),
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
  tags: z.array(z.string()).optional().nullable(), // Array of tag strings
  metadata: z.record(z.unknown()).optional().nullable(), // Generic metadata object
  reference_type: z.string().max(50).optional().nullable(),
  reference_id: UUIDSchema.optional().nullable(),
})

export const ExpenseUpdateSchema = ExpenseInsertSchema.partial()

// HPP schemas
export const CostBreakdownSchema = z.object({
  ingredients: z.record(z.string(), NonNegativeNumberSchema),
  labor: NonNegativeNumberSchema,
  overhead: NonNegativeNumberSchema,
  packaging: NonNegativeNumberSchema,
  other: NonNegativeNumberSchema,
})

export const HPPSnapshotSchema = z.object({
  recipe_id: UUIDSchema,
  hpp_value: NonNegativeNumberSchema,
  material_cost: NonNegativeNumberSchema,
  operational_cost: NonNegativeNumberSchema,
  cost_breakdown: CostBreakdownSchema,
  selling_price: NonNegativeNumberSchema.optional().nullable(),
  margin_percentage: NonNegativeNumberSchema.optional().nullable(),
})

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

// Form schemas for frontend validation
export const OrderFormSchema = OrderInsertSchema.omit({ order_no: true, items: true }).extend({
  items: z.array(OrderItemSchema).min(1, 'Order must have at least one item'),
})

export const CustomerFormSchema = CustomerInsertSchema

export const IngredientFormSchema = IngredientInsertSchema

export const RecipeFormSchema = RecipeInsertSchema

export const SupplierFormSchema = SupplierInsertSchema

// Type exports
export type OrderStatus = z.infer<typeof OrderStatusEnum>
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>
export type UserRole = z.infer<typeof UserRoleEnum>
export type ProductionStatus = z.infer<typeof ProductionStatusEnum>
export type BusinessUnit = z.infer<typeof BusinessUnitEnum>
export type RecordType = z.infer<typeof RecordTypeEnum>
export type TransactionType = z.infer<typeof TransactionTypeEnum>

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
export type HPPSnapshot = z.infer<typeof HPPSnapshotSchema>

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>
export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>
export type OrderForm = z.infer<typeof OrderFormSchema>
export type CustomerForm = z.infer<typeof CustomerFormSchema>
export type IngredientForm = z.infer<typeof IngredientFormSchema>
export type RecipeForm = z.infer<typeof RecipeFormSchema>
export type SupplierForm = z.infer<typeof SupplierFormSchema>
