import { z } from 'zod'

export const recipeIngredientSchema = z.object({
  ingredient_id: z.string().uuid('ID ingredient tidak valid'),
  quantity: z.number().min(0.01, 'Jumlah harus lebih dari 0'),
  unit: z.string().optional(),
  notes: z.string().optional().nullable(),
})

export const recipeSchema = z.object({
  name: z.string().min(1, 'Nama resep wajib diisi').max(255),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  servings: z.number().min(1, 'Porsi minimal 1').optional().nullable(),
  yield_unit: z.string().min(1, 'Unit hasil wajib diisi').max(50).default('porsi'),
  prep_time: z.number().min(0, 'Waktu tidak boleh negatif').optional().nullable(),
  cook_time: z.number().min(0, 'Waktu tidak boleh negatif').optional().nullable(),
  instructions: z.string().optional().nullable(),
  selling_price: z.number().min(0, 'Harga tidak boleh negatif').optional().nullable(),
  ingredients: z.array(recipeIngredientSchema).min(1, 'Minimal 1 bahan baku diperlukan'),
})

export const recipeUpdateSchema = recipeSchema.partial()

export type RecipeFormData = z.infer<typeof recipeSchema>
export type RecipeFormInput = z.input<typeof recipeSchema>
export type RecipeIngredientFormData = z.infer<typeof recipeIngredientSchema>
