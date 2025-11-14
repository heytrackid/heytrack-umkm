import { z } from 'zod'

/**
 * Validation schemas for Recipes domain
 */

export const RecipeIngredientSchema = z.object({
  ingredient_id: z.string().uuid('ID bahan baku tidak valid'),
  quantity: z.number().positive('Jumlah harus lebih dari 0').finite(),
  unit: z.string().min(1, 'Satuan harus diisi').max(50, 'Satuan maksimal 50 karakter').trim(),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional().nullable(),
})

export const RecipeCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama resep harus diisi')
    .max(255, 'Nama resep maksimal 255 karakter')
    .trim(),
  description: z.string().max(2000, 'Deskripsi maksimal 2000 karakter').optional().nullable(),
  category: z.string().max(100, 'Kategori maksimal 100 karakter').optional().nullable(),
  serving_size: z
    .number()
    .positive('Porsi harus lebih dari 0')
    .finite('Porsi harus berupa angka valid'),
  serving_unit: z.string().max(50, 'Satuan porsi maksimal 50 karakter').default('porsi'),
  preparation_time: z.number().min(0, 'Waktu persiapan tidak boleh negatif').optional().nullable(),
  cooking_time: z.number().min(0, 'Waktu memasak tidak boleh negatif').optional().nullable(),
  instructions: z.string().max(10000, 'Instruksi maksimal 10000 karakter').optional().nullable(),
  notes: z.string().max(2000, 'Catatan maksimal 2000 karakter').optional().nullable(),
  ingredients: z
    .array(RecipeIngredientSchema)
    .min(1, 'Resep harus memiliki minimal 1 bahan baku')
    .max(100, 'Resep maksimal 100 bahan baku'),
})

export const RecipeUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama resep harus diisi')
    .max(255, 'Nama resep maksimal 255 karakter')
    .trim()
    .optional(),
  description: z.string().max(2000, 'Deskripsi maksimal 2000 karakter').optional().nullable(),
  category: z.string().max(100, 'Kategori maksimal 100 karakter').optional().nullable(),
  serving_size: z
    .number()
    .positive('Porsi harus lebih dari 0')
    .finite('Porsi harus berupa angka valid')
    .optional(),
  serving_unit: z.string().max(50, 'Satuan porsi maksimal 50 karakter').optional(),
  preparation_time: z.number().min(0, 'Waktu persiapan tidak boleh negatif').optional().nullable(),
  cooking_time: z.number().min(0, 'Waktu memasak tidak boleh negatif').optional().nullable(),
  instructions: z.string().max(10000, 'Instruksi maksimal 10000 karakter').optional().nullable(),
  notes: z.string().max(2000, 'Catatan maksimal 2000 karakter').optional().nullable(),
  ingredients: z
    .array(RecipeIngredientSchema)
    .min(1, 'Resep harus memiliki minimal 1 bahan baku')
    .max(100, 'Resep maksimal 100 bahan baku')
    .optional(),
})

export const RecipeGenerateSchema = z.object({
  prompt: z
    .string()
    .min(10, 'Prompt minimal 10 karakter')
    .max(1000, 'Prompt maksimal 1000 karakter')
    .trim(),
  cuisine_type: z.string().max(100).optional(),
  dietary_restrictions: z.array(z.string()).optional(),
})

export type RecipeIngredientInput = z.infer<typeof RecipeIngredientSchema>
export type RecipeCreateInput = z.infer<typeof RecipeCreateSchema>
export type RecipeUpdateInput = z.infer<typeof RecipeUpdateSchema>
export type RecipeGenerateInput = z.infer<typeof RecipeGenerateSchema>
