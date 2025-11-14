import { z } from 'zod'

/**
 * Validation schemas for Ingredients domain
 */

export const IngredientCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama bahan baku harus diisi')
    .max(255, 'Nama bahan baku maksimal 255 karakter')
    .trim(),
  unit: z
    .string()
    .min(1, 'Satuan harus diisi')
    .max(50, 'Satuan maksimal 50 karakter')
    .trim(),
  price_per_unit: z
    .number()
    .positive('Harga harus lebih dari 0')
    .finite('Harga harus berupa angka valid'),
  current_stock: z
    .number()
    .min(0, 'Stok tidak boleh negatif')
    .finite('Stok harus berupa angka valid'),
  minimum_stock: z
    .number()
    .min(0, 'Stok minimum tidak boleh negatif')
    .finite('Stok minimum harus berupa angka valid'),
  category: z.string().max(100, 'Kategori maksimal 100 karakter').optional().nullable(),
  supplier: z.string().max(255, 'Supplier maksimal 255 karakter').optional().nullable(),
  notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional().nullable(),
})

export const IngredientUpdateSchema = IngredientCreateSchema.partial()

export const IngredientBulkImportSchema = z.array(IngredientCreateSchema).min(1, 'Minimal 1 bahan baku')

export const IngredientStockUpdateSchema = z.object({
  current_stock: z.number().min(0, 'Stok tidak boleh negatif').finite(),
})

export const IngredientReorderCalculationSchema = z.object({
  ingredient_ids: z.array(z.string().uuid()).optional(),
  threshold_multiplier: z.number().positive().default(1.5),
})

export type IngredientCreateInput = z.infer<typeof IngredientCreateSchema>
export type IngredientUpdateInput = z.infer<typeof IngredientUpdateSchema>
export type IngredientBulkImportInput = z.infer<typeof IngredientBulkImportSchema>
