import { z } from 'zod'

export const ingredientSchema = z.object({
  name: z.string().min(1, 'Nama bahan baku wajib diisi').max(255),
  category: z.string().min(1, 'Kategori wajib diisi').max(100).nullable(),
  unit: z.string().min(1, 'Satuan wajib diisi').max(50),
  price_per_unit: z.number().min(0, 'Harga harus lebih dari 0'),
  current_stock: z.number().min(0, 'Stok tidak boleh negatif').nullable(),
  min_stock: z.number().min(0, 'Stok minimum tidak boleh negatif').nullable(),
  supplier: z.string().max(255).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
})

export const ingredientUpdateSchema = ingredientSchema.partial()

// Export with PascalCase for consistency
export const IngredientCreateSchema = ingredientSchema
export const IngredientUpdateSchema = ingredientUpdateSchema

export type IngredientFormData = z.infer<typeof ingredientSchema>
