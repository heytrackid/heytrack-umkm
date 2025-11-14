import { z } from 'zod'

/**
 * Validation schemas for Production domain
 */

export const ProductionBatchStatus = z.enum(['planned', 'in_progress', 'completed', 'cancelled'])

export const ProductionBatchCreateSchema = z.object({
  recipe_id: z.string().uuid('ID resep tidak valid'),
  batch_number: z
    .string()
    .min(1, 'Nomor batch harus diisi')
    .max(50, 'Nomor batch maksimal 50 karakter')
    .trim(),
  quantity: z.number().positive('Jumlah harus lebih dari 0').finite(),
  planned_date: z.string().datetime('Format tanggal tidak valid'),
  unit: z.string().min(1, 'Unit harus diisi').max(20, 'Unit maksimal 20 karakter'),
  status: ProductionBatchStatus.default('planned'),
  notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional().nullable(),
})

export const ProductionBatchUpdateSchema = z.object({
  batch_number: z
    .string()
    .min(1, 'Nomor batch harus diisi')
    .max(50, 'Nomor batch maksimal 50 karakter')
    .trim()
    .optional(),
  quantity: z.number().positive('Jumlah harus lebih dari 0').finite().optional(),
  planned_date: z.string().datetime('Format tanggal tidak valid').optional(),
  unit: z.string().min(1, 'Unit harus diisi').max(20, 'Unit maksimal 20 karakter').optional(),
  status: ProductionBatchStatus.optional(),
  actual_cost: z.number().min(0, 'Biaya aktual tidak boleh negatif').finite().optional().nullable(),
  notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional().nullable(),
})

export const ProductionBatchStatusUpdateSchema = z.object({
  status: ProductionBatchStatus,
})

// Status transition validation
export const VALID_PRODUCTION_STATUS_TRANSITIONS: Record<string, string[]> = {
  planned: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export type ProductionBatchCreateInput = z.infer<typeof ProductionBatchCreateSchema>
export type ProductionBatchUpdateInput = z.infer<typeof ProductionBatchUpdateSchema>
export type ProductionBatchStatusUpdateInput = z.infer<typeof ProductionBatchStatusUpdateSchema>
