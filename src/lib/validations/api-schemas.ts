import { z } from 'zod'
import { 


/**
 * API Request Validation Schemas
 * 
 * Comprehensive Zod schemas for all API endpoints
 * Use these schemas to validate request bodies and ensure type safety
 * 
 * NOTE: Order schemas now use domain schemas as source of truth
 */

  OrderInsertSchema, 
  OrderUpdateSchema as DomainOrderUpdateSchema, 
  OrderStatusUpdateSchema
} from './domains/order'

// ============================================
// Base Schemas
// ============================================

export const UUIDSchema = z.string().uuid('Invalid UUID format')

export const PositiveNumberSchema = z.number().positive('Must be a positive number')

export const NonNegativeNumberSchema = z.number().nonnegative('Must be non-negative')

export const DateStringSchema = z.string().datetime('Invalid date format')

export const EmailSchema = z.string().email('Invalid email format')

export const PhoneSchema = z.string().regex(
  /^(\+62|62|0)[0-9]{9,12}$/,
  'Invalid phone number format'
).optional()

// ============================================
// Ingredient Schemas
// ============================================

export const CreateIngredientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
  unit: z.string().min(1, 'Unit is required').max(50),
  price_per_unit: PositiveNumberSchema,
  current_stock: NonNegativeNumberSchema.default(0),
  min_stock: NonNegativeNumberSchema.default(0),
  max_stock: NonNegativeNumberSchema.optional(),
  supplier: z.string().max(255).optional(),
  category: z.string().max(100).optional(),
  reorder_point: NonNegativeNumberSchema.optional(),
  lead_time: z.number().int().positive().optional(),
  usage_rate: NonNegativeNumberSchema.optional(),
})

export const UpdateIngredientSchema = CreateIngredientSchema.partial()

export const IngredientPurchaseSchema = z.object({
  ingredient_id: UUIDSchema,
  quantity: PositiveNumberSchema,
  unit_price: PositiveNumberSchema,
  total_price: PositiveNumberSchema,
  supplier: z.string().max(255).optional(),
  purchase_date: DateStringSchema.optional(),
  notes: z.string().max(1000).optional(),
})

// ============================================
// Recipe Schemas
// ============================================

export const RecipeIngredientSchema = z.object({
  ingredient_id: UUIDSchema,
  quantity: PositiveNumberSchema,
  unit: z.string().min(1).max(50),
})

export const CreateRecipeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(2000).optional(),
  instructions: z.string().max(5000).optional(),
  servings: z.number().int().positive().default(1),
  prep_time: z.number().int().nonnegative().optional(),
  cook_time: z.number().int().nonnegative().optional(),
  selling_price: PositiveNumberSchema.optional(),
  category: z.string().max(100).optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  batch_size: z.number().int().positive().default(1),
  image_url: z.string().url().optional(),
  is_active: z.boolean().default(true),
  ingredients: z.array(RecipeIngredientSchema).min(1, 'At least one ingredient required'),
})

export const UpdateRecipeSchema = CreateRecipeSchema.partial().extend({
  ingredients: z.array(RecipeIngredientSchema).optional(),
})

// ============================================
// Customer Schemas
// ============================================

export const CreateCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: EmailSchema.optional(),
  phone: PhoneSchema,
  address: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  customer_type: z.enum(['new', 'regular', 'vip', 'inactive']).default('regular'),
  discount_percentage: z.number().min(0).max(100).default(0),
  is_active: z.boolean().default(true),
})

export const UpdateCustomerSchema = CreateCustomerSchema.partial()

// ============================================
// Order Schemas
// ============================================
// Using domain schemas as source of truth for consistency

export const CreateOrderSchema = OrderInsertSchema
export const UpdateOrderSchema = DomainOrderUpdateSchema
export const UpdateOrderStatusSchema = OrderStatusUpdateSchema

// Re-export for backward compatibility
export { OrderItemInsertSchema as OrderItemSchema } from './domains/order'

// ============================================
// Operational Cost Schemas
// ============================================

export const CreateOperationalCostSchema = z.object({
  category: z.string().min(1).max(100),
  amount: PositiveNumberSchema,
  description: z.string().min(1).max(500),
  date: z.string().optional(),
  reference: z.string().max(100).optional(),
  payment_method: z.string().max(50).optional(),
  supplier: z.string().max(255).optional(),
  recurring: z.boolean().default(false),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  notes: z.string().max(1000).optional(),
})

export const UpdateOperationalCostSchema = CreateOperationalCostSchema.partial()

// ============================================
// Expense Schemas
// ============================================

export const CreateExpenseSchema = z.object({
  category: z.string().min(1).max(100),
  subcategory: z.string().max(100).optional(),
  amount: PositiveNumberSchema,
  description: z.string().min(1).max(500),
  expense_date: z.string().optional(),
  receipt_number: z.string().max(100).optional(),
  supplier: z.string().max(255).optional(),
  tax_amount: NonNegativeNumberSchema.default(0),
  is_recurring: z.boolean().default(false),
  recurring_frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  payment_method: z.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DIGITAL_WALLET']).default('CASH'),
  status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).default('paid'),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const UpdateExpenseSchema = CreateExpenseSchema.partial()

// ============================================
// Production Schemas
// ============================================

export const CreateProductionBatchSchema = z.object({
  recipe_id: UUIDSchema,
  quantity: z.number().int().positive(),
  cost_per_unit: PositiveNumberSchema,
  total_cost: PositiveNumberSchema,
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PLANNED'),
  started_at: DateStringSchema.optional(),
  completed_at: DateStringSchema.optional(),
  notes: z.string().max(1000).optional(),
})

export const UpdateProductionBatchSchema = CreateProductionBatchSchema.partial()

// ============================================
// Supplier Schemas
// ============================================

export const CreateSupplierSchema = z.object({
  name: z.string().min(1).max(255),
  contact_person: z.string().max(255).optional(),
  phone: PhoneSchema,
  email: EmailSchema.optional(),
  address: z.string().max(500).optional(),
  payment_terms: z.string().max(255).optional(),
  lead_time_days: z.number().int().positive().default(7),
  minimum_order: NonNegativeNumberSchema.default(0),
  delivery_fee: NonNegativeNumberSchema.default(0),
  rating: z.number().min(0).max(5).optional(),
  is_active: z.boolean().default(true),
  notes: z.string().max(1000).optional(),
})

export const UpdateSupplierSchema = CreateSupplierSchema.partial()

// ============================================
// HPP Automation Schemas
// ============================================

export const HPPAutomationSchema = z.object({
  action: z.enum(['ingredient_price_changed', 'operational_cost_changed', 'recipe_hpp_calculate', 'batch_hpp_recalculate', 'all']),
  recipe_ids: z.array(UUIDSchema).optional(),
  force: z.boolean().default(false),
})

// ============================================
// AI Recipe Generation Schemas
// ============================================

export const AIRecipeGenerationSchema = z.object({
  name: z.string().min(1, 'Recipe name is required').max(255),
  type: z.string().min(1, 'Recipe type is required').max(100),
  servings: z.number().int().positive().default(1),
  targetPrice: PositiveNumberSchema.optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  preferredIngredients: z.array(z.string()).optional(),
  complexity: z.enum(['simple', 'moderate', 'complex']).optional(),
})

// ============================================
// Automation Task Schemas
// ============================================

export const AutomationTaskSchema = z.object({
  task: z.enum(['reorder', 'notifications', 'engine', 'cleanup', 'all']),
  force: z.boolean().default(false),
})

// ============================================
// Error Logging Schemas
// ============================================

export const ErrorLogSchema = z.object({
  message: z.string().min(1),
  url: z.string().optional(),
  stack: z.string().optional(),
  level: z.enum(['error', 'warn', 'info']).default('error'),
  context: z.record(z.string(), z.unknown()).optional(),
  timestamp: DateStringSchema.optional(),
})

// ============================================
// Export all schemas
// ============================================

export const APISchemas = {
  // Ingredients
  CreateIngredient: CreateIngredientSchema,
  UpdateIngredient: UpdateIngredientSchema,
  IngredientPurchase: IngredientPurchaseSchema,
  
  // Recipes
  CreateRecipe: CreateRecipeSchema,
  UpdateRecipe: UpdateRecipeSchema,
  
  // Customers
  CreateCustomer: CreateCustomerSchema,
  UpdateCustomer: UpdateCustomerSchema,
  
  // Orders
  CreateOrder: CreateOrderSchema,
  UpdateOrder: UpdateOrderSchema,
  UpdateOrderStatus: UpdateOrderStatusSchema,
  
  // Operational Costs
  CreateOperationalCost: CreateOperationalCostSchema,
  UpdateOperationalCost: UpdateOperationalCostSchema,
  
  // Expenses
  CreateExpense: CreateExpenseSchema,
  UpdateExpense: UpdateExpenseSchema,
  
  // Production
  CreateProductionBatch: CreateProductionBatchSchema,
  UpdateProductionBatch: UpdateProductionBatchSchema,
  
  // Suppliers
  CreateSupplier: CreateSupplierSchema,
  UpdateSupplier: UpdateSupplierSchema,
  
  // HPP
  HPPAutomation: HPPAutomationSchema,
  
  // AI
  AIRecipeGeneration: AIRecipeGenerationSchema,
  
  // Automation
  AutomationTask: AutomationTaskSchema,
  
  // Error Logging
  ErrorLog: ErrorLogSchema,
}

// Type exports for TypeScript
export type CreateIngredientInput = z.infer<typeof CreateIngredientSchema>
export type UpdateIngredientInput = z.infer<typeof UpdateIngredientSchema>
export type IngredientPurchaseInput = z.infer<typeof IngredientPurchaseSchema>

export type CreateRecipeInput = z.infer<typeof CreateRecipeSchema>
export type UpdateRecipeInput = z.infer<typeof UpdateRecipeSchema>

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>

export type CreateOperationalCostInput = z.infer<typeof CreateOperationalCostSchema>
export type UpdateOperationalCostInput = z.infer<typeof UpdateOperationalCostSchema>

export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseSchema>

export type CreateProductionBatchInput = z.infer<typeof CreateProductionBatchSchema>
export type UpdateProductionBatchInput = z.infer<typeof UpdateProductionBatchSchema>

export type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>
export type UpdateSupplierInput = z.infer<typeof UpdateSupplierSchema>

export type HPPAutomationInput = z.infer<typeof HPPAutomationSchema>

export type AIRecipeGenerationInput = z.infer<typeof AIRecipeGenerationSchema>
export type AutomationTaskInput = z.infer<typeof AutomationTaskSchema>
export type ErrorLogInput = z.infer<typeof ErrorLogSchema>
