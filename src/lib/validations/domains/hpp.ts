import { z } from 'zod'

export const hppCalculationSchema = z.object({
  recipeId: z.string().uuid(),
  batchSize: z.number().positive().optional(),
  overheadCost: z.number().min(0).optional(),
  profitMargin: z.number().min(0).max(100).optional(),
})

export const hppRecommendationSchema = z.object({
  recipeId: z.string().uuid(),
  recommendationType: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  potentialSavings: z.number().min(0).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
})

export const hppRecommendationUpdateSchema = z.object({
  isImplemented: z.boolean().optional(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  potentialSavings: z.number().min(0).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
})

export type HppCalculationInput = z.infer<typeof hppCalculationSchema>
export type HppRecommendationInput = z.infer<typeof hppRecommendationSchema>
export type HppRecommendationUpdate = z.infer<typeof hppRecommendationUpdateSchema>
