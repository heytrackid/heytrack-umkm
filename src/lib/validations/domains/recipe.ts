import { z } from 'zod'
import { UUIDSchema, PositiveNumberSchema, NonNegativeNumberSchema } from '@/lib/validations/base-validations'


/**
 * Recipe Validation Schemas
 * Validation schemas for recipe-related operations
 */


// Recipe ingredient schemas
export const RecipeIngredientInsertSchema = z.object({
  ingredient_id: UUIDSchema,
  quantity: PositiveNumberSchema,
  unit: z.string().min(1, 'Unit is required').max(50),
  notes: z.string().max(500).optional().nullable(),
})

export const RecipeIngredientUpdateSchema = RecipeIngredientInsertSchema.partial()

// Recipe database schemas
export const RecipeInsertSchema = z.object({
  name: z.string().min(1, 'Recipe name is required').max(255),
  description: z.string().max(1000).optional().nullable(),
  servings: PositiveNumberSchema,
  preparation_time: NonNegativeNumberSchema.optional(),
  cooking_time: NonNegativeNumberSchema.optional(),
  total_time: NonNegativeNumberSchema.optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  category: z.string().max(100).optional().nullable(),
  cuisine_type: z.string().max(100).optional().nullable(),
  cost_per_serving: NonNegativeNumberSchema.optional(),
  selling_price: NonNegativeNumberSchema.optional(),
  profit_margin: NonNegativeNumberSchema.max(100).optional(),
  is_active: z.boolean().default(true).optional(),
  is_available: z.boolean().default(true).optional(),
  image_url: z.string().url().optional().nullable(),
  instructions: z.array(z.object({
    step_number: PositiveNumberSchema,
    instruction: z.string().min(1, 'Instruction is required').max(1000),
    duration: NonNegativeNumberSchema.optional(),
    notes: z.string().max(500).optional(),
  })).optional(),
  ingredients: z.array(RecipeIngredientInsertSchema).min(1, 'Recipe must have at least one ingredient'),
})

export const RecipeUpdateSchema = RecipeInsertSchema.partial().omit({ ingredients: true })

// Recipe form schemas
export const RecipeFormSchema = z.object({
  name: z.string().min(1, 'validation.recipeNameRequired'),
  description: z.string().optional(),
  servings: z.number().positive('validation.servingsPositive'),
  preparation_time: z.number().min(0).optional(),
  cooking_time: z.number().min(0).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  category: z.string().optional(),
  cuisine_type: z.string().optional(),
  cost_per_serving: z.number().min(0).optional(),
  selling_price: z.number().min(0).optional(),
  profit_margin: z.number().min(0).max(100).optional(),
  is_active: z.boolean().default(true),
  is_available: z.boolean().default(true),
  image_url: z.string().url().optional().or(z.literal('')),
  instructions: z.array(z.object({
    step_number: z.number().positive(),
    instruction: z.string().min(1),
    duration: z.number().min(0).optional(),
    notes: z.string().optional(),
  })).optional(),
  ingredients: z.array(z.object({
    ingredient_id: UUIDSchema.optional(),
    ingredient_name: z.string().min(1, 'validation.ingredientNameRequired'),
    quantity: z.number().positive('validation.quantityPositive'),
    unit: z.string().min(1, 'validation.unitRequired'),
    notes: z.string().optional(),
  })).min(1, 'validation.recipeMustHaveIngredients'),
})

// Recipe API schemas
export const RecipeQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  cuisine_type: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  is_active: z.boolean().optional(),
  is_available: z.boolean().optional(),
  min_cost: NonNegativeNumberSchema.optional(),
  max_cost: NonNegativeNumberSchema.optional(),
  min_selling_price: NonNegativeNumberSchema.optional(),
  max_selling_price: NonNegativeNumberSchema.optional(),
})

export const RecipeAvailabilityUpdateSchema = z.object({
  is_available: z.boolean(),
  reason: z.string().max(500).optional(),
})

export type RecipeIngredientInsert = z.infer<typeof RecipeIngredientInsertSchema>
export type RecipeIngredientUpdate = z.infer<typeof RecipeIngredientUpdateSchema>
export type RecipeInsert = z.infer<typeof RecipeInsertSchema>
export type RecipeUpdate = z.infer<typeof RecipeUpdateSchema>
export type RecipeForm = z.infer<typeof RecipeFormSchema>
export type RecipeQuery = z.infer<typeof RecipeQuerySchema>
export type RecipeAvailabilityUpdate = z.infer<typeof RecipeAvailabilityUpdateSchema>
