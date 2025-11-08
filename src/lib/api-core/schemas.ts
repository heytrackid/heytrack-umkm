import { z } from 'zod'

/**
 * Common Schemas Module
 * Reusable Zod validation schemas for API endpoints
 */


// ==========================================================
// COMMON SCHEMAS
// ==========================================================

// ID parameter validation
export const IdParamSchema = z.object({
  id: z.string().min(1, 'ID is required')
})

// Pagination parameters
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
})

// Date range filtering
export const DateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
})

// Status filtering
export const StatusFilterSchema = z.object({
  status: z.enum(['active', 'inactive', 'pending', 'completed']).optional()
})

// Search parameters
export const SearchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional()
})

// Bulk operations
export const BulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one ID is required')
})

export const BulkUpdateSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one ID is required'),
  updates: z.object({}).passthrough() // Allow any object with additional properties
})
