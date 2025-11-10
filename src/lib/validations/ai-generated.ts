import { z } from 'zod'

export const unitSchema = z.enum([
  'g','kg','ml','l','pcs','butir','sachet','pack','cup','tbsp','tsp','portion'
])

export const ingredientSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2).nullable().optional(),
  unit: unitSchema,
  unit_price_idr: z.number().positive().max(5_000_000),
  initial_stock: z.number().nonnegative().max(1_000_000).default(0)
})

export const operationalCostSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['fixed','variable']),
  amount_idr: z.number().nonnegative().max(50_000_000),
  period: z.enum(['daily','weekly','monthly'])
})

export const recipeIngredientSchema = z.object({
  ingredient_name: z.string().min(2),
  quantity: z.number().positive().max(1_000_000),
  unit: unitSchema
})

export const recipeSchema = z.object({
  name: z.string().min(2),
  category: z.string().nullable().optional(),
  yield_quantity: z.number().positive().max(100_000),
  yield_unit: unitSchema,
  ingredients: z.array(recipeIngredientSchema).min(1)
})

export const businessBootstrapInputSchema = z.object({
  businessDescription: z.string().min(10),
  vertical: z.enum(['fnb','beauty','fashion','services','general']).default('fnb'),
  targetMarket: z.string().optional(),
  currency: z.literal('IDR').default('IDR')
})

export const businessBootstrapOutputSchema = z.object({
  ingredients: z.array(ingredientSchema).min(1),
  operational_costs: z.array(operationalCostSchema).min(1),
  recipes: z.array(recipeSchema).min(1)
})

export type BusinessBootstrapInput = z.infer<typeof businessBootstrapInputSchema>
export type BusinessBootstrapOutput = z.infer<typeof businessBootstrapOutputSchema>
