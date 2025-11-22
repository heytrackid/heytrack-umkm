import { z } from 'zod'
import { UUIDSchema, PositiveNumberSchema, NonNegativeNumberSchema } from '@/lib/validations/base-validations'


/**
 * Ingredient Validation Schemas
 * Validation schemas for ingredient-related operations
 */


// Ingredient database schemas
export const IngredientInsertSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional().nullable(),
  unit: z.string().min(1, 'Unit is required').max(50),
  price_per_unit: PositiveNumberSchema,
  current_stock: NonNegativeNumberSchema.default(0),
  min_stock: NonNegativeNumberSchema.default(0),
  max_stock: NonNegativeNumberSchema.optional(),
  supplier: z.string().max(255).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  reorder_point: NonNegativeNumberSchema.optional(),
  lead_time: z.number().int().positive().optional(),
  usage_rate: NonNegativeNumberSchema.optional(),
  storage_requirements: z.string().max(500).optional().nullable(),
  expiry_date: z.string().datetime().optional().nullable(),
  cost_per_unit: PositiveNumberSchema.optional(),
  usage_rate_daily: PositiveNumberSchema.optional(),
  reorder_lead_time: z.number().int().min(1).optional(),
  supplier_info: z.object({
    name: z.string().max(255).optional(),
    contact: z.string().max(255).optional(),
    price: PositiveNumberSchema.optional()
  }).optional().nullable(),
  is_active: z.boolean().default(true).optional(),
})

export const IngredientUpdateSchema = IngredientInsertSchema.partial()

// Ingredient purchase status enum
export const IngredientPurchaseStatus = z.enum(['pending', 'ordered', 'received', 'cancelled'])

// Ingredient purchase schemas
export const IngredientPurchaseInsertSchema = z.object({
  ingredient_id: UUIDSchema,
  supplier_id: UUIDSchema,
  quantity: PositiveNumberSchema,
  unit_price: PositiveNumberSchema,
  total_cost: PositiveNumberSchema,
  purchase_date: z.string().datetime(),
  status: IngredientPurchaseStatus.default('pending'),
  expiry_date: z.string().datetime().optional(),
  batch_number: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
})

export const IngredientPurchaseUpdateSchema = IngredientPurchaseInsertSchema.partial()

// Ingredient form schemas
export const IngredientFormSchema = z.object({
  name: z.string().min(1, 'validation.ingredientNameRequired'),
  description: z.string().optional(),
  unit: z.enum(['kg', 'gram', 'liter', 'ml', 'pcs', 'pack'], {
    message: 'validation.invalidUnit'
  }),
  price_per_unit: z.number().positive('validation.pricePositive'),
  current_stock: z.number().min(0, 'validation.stockNonNegative'),
  min_stock: z.number().min(0, 'validation.minStockNonNegative'),
  max_stock: z.number().min(0).optional(),
  supplier: z.string().optional(),
  category: z.string().optional(),
  storage_requirements: z.string().optional(),
  expiry_date: z.string().datetime().optional(),
  cost_per_unit: z.number().positive().optional(),
  usage_rate_daily: z.number().positive().optional(),
  reorder_lead_time: z.number().int().min(1).optional(),
  supplier_info: z.object({
    name: z.string().optional(),
    contact: z.string().optional(),
    price: z.number().positive().optional()
  }).optional(),
  is_active: z.boolean().default(true)
}).refine(data => {
  // Custom validation: min_stock should be less than or equal to current_stock
  if (data.min_stock > data.current_stock) {
    return false
  }
  return true
}, {
  message: 'validation.minStockGreaterThanCurrent',
  path: ['min_stock']
})

// Ingredient API schemas
export const IngredientQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  supplier: z.string().optional(),
  is_active: z.boolean().optional(),
  low_stock_only: z.boolean().optional(),
  expiring_soon: z.boolean().optional(),
})

export const IngredientStockUpdateSchema = z.object({
  ingredient_id: UUIDSchema,
  quantity_change: z.number(),
  reason: z.enum(['PURCHASE', 'USAGE', 'ADJUSTMENT', 'WASTE', 'RETURN']),
  reference_id: z.string().optional(),
  notes: z.string().max(500).optional(),
})

// Ingredient import schemas
export const IngredientImportSchema = z.object({
  name: z.string().min(1, 'Nama bahan wajib diisi'),
  unit: z.string().min(1, 'Satuan wajib diisi'),
  price_per_unit: z.number().min(0, 'Harga per satuan harus positif'),
  current_stock: z.number().min(0).optional().default(0),
  min_stock: z.number().min(0).optional().default(0),
  description: z.string().optional(),
  category: z.string().optional(),
  supplier: z.string().optional(),
})

export const ImportIngredientsSchema = z.object({
  ingredients: z.array(IngredientImportSchema).min(1, 'Minimal satu bahan harus diimpor'),
})

// Ingredient stock validation schemas
export const ValidateStockItemSchema = z.object({
  ingredientId: UUIDSchema,
  requiredQuantity: NonNegativeNumberSchema,
})

export const ValidateStockSchema = z.object({
  items: z.array(ValidateStockItemSchema).min(1, 'At least one item is required'),
})

// Ingredient reorder calculation schema
export const CalculateReorderSchema = z.object({
  ingredientId: UUIDSchema,
  leadTimeDays: z.number().min(1).max(365).optional().default(7),
  safetyStockDays: z.number().min(0).max(365).optional().default(3),
})

// Bulk import schema
export const BulkImportSchema = z.object({
  ingredients: z.array(z.object({
    name: z.string(),
    category: z.string().optional(),
    unit: z.string(),
    price_per_unit: z.number(),
    current_stock: z.number(),
    reorder_point: z.number(),
    supplier: z.string().optional(),
  })).min(1).max(1000, 'Maximum 1000 ingredients per import'),
})

export type IngredientInsert = z.infer<typeof IngredientInsertSchema>
export type IngredientUpdate = z.infer<typeof IngredientUpdateSchema>
export type IngredientPurchaseInsert = z.infer<typeof IngredientPurchaseInsertSchema>
export type IngredientPurchaseUpdate = z.infer<typeof IngredientPurchaseUpdateSchema>
export type IngredientForm = z.infer<typeof IngredientFormSchema>
export type IngredientQuery = z.infer<typeof IngredientQuerySchema>
export type IngredientStockUpdate = z.infer<typeof IngredientStockUpdateSchema>
export type IngredientImport = z.infer<typeof IngredientImportSchema>
export type ImportIngredients = z.infer<typeof ImportIngredientsSchema>
export type ValidateStockItem = z.infer<typeof ValidateStockItemSchema>
export type ValidateStock = z.infer<typeof ValidateStockSchema>
export type CalculateReorder = z.infer<typeof CalculateReorderSchema>
export type BulkImport = z.infer<typeof BulkImportSchema>
