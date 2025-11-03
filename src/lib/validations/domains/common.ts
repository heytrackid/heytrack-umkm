import { z } from 'zod'
import { UUIDSchema, DateStringSchema, NonNegativeNumberSchema } from '@/lib/validations/base-validations'


/**
 * Common API Validation Schemas
 * Shared validation schemas for common API operations
 */


// Pagination schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).catch(() => 1),
  limit: z.coerce.number().int().min(1).max(100).default(10).catch(() => 10),
  search: z.string().nullable().optional().transform(val => val ?? undefined),
  sort_by: z.string().nullable().optional().transform(val => val ?? undefined),
  sort_order: z.enum(['asc', 'desc']).default('desc').catch(() => 'desc' as const),
})

// Date range schemas
export const DateRangeSchema = z.object({
  startDate: DateStringSchema.optional(),
  endDate: DateStringSchema.optional(),
})

export const DateRangeQuerySchema = z.object({
  start_date: DateStringSchema.optional(),
  end_date: DateStringSchema.optional(),
})

// Common filter schemas
export const StatusFilterSchema = z.object({
  status: z.string().optional(),
  is_active: z.boolean().optional(),
})

export const SearchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
})

// File upload schemas
export const FileUploadSchema = z.object({
  file: z.instanceof(File),
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.string().regex(/^[^/]+\/[^/]+$/, 'Invalid content type'),
  size: NonNegativeNumberSchema.max(10 * 1024 * 1024, 'File size must be less than 10MB'),
})

export const ImageUploadSchema = z.object({
  file: z.instanceof(File),
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.string().regex(/^image\//, 'File must be an image'),
  size: NonNegativeNumberSchema.max(5 * 1024 * 1024, 'Image size must be less than 5MB'),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
})

// ID parameter schemas
export const IdParamSchema = z.object({
  id: UUIDSchema,
})

export const IdsParamSchema = z.object({
  ids: z.array(UUIDSchema).min(1, 'At least one ID is required'),
})

// Bulk operation schemas
export const BulkDeleteSchema = z.object({
  ids: z.array(UUIDSchema).min(1, 'At least one ID is required'),
  reason: z.string().max(500).optional(),
})

export const BulkUpdateSchema = z.object({
  ids: z.array(UUIDSchema).min(1, 'At least one ID is required'),
  updates: z.record(z.string(), z.unknown()),
  reason: z.string().max(500).optional(),
})

// Report query schemas
export const ReportQuerySchema = z.object({
  report_type: z.string().min(1, 'Report type is required'),
  format: z.enum(['PDF', 'EXCEL', 'CSV']).default('PDF'),
  start_date: DateStringSchema,
  end_date: DateStringSchema,
  include_charts: z.boolean().default(true),
  filters: z.record(z.string(), z.unknown()).optional(),
})

export const SalesQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('monthly'),
  start_date: DateStringSchema.optional(),
  end_date: DateStringSchema.optional(),
  category: z.string().optional(),
  recipe_id: UUIDSchema.optional(),
  include_trends: z.boolean().default(true),
})

// HPP specific schemas
export const HPPExportQuerySchema = z.object({
  recipe_ids: z.array(UUIDSchema).optional(),
  start_date: DateStringSchema.optional(),
  end_date: DateStringSchema.optional(),
  include_trends: z.boolean().default(true),
  include_cost_breakdown: z.boolean().default(true),
})

export const HPPComparisonQuerySchema = z.object({
  recipe_ids: z.array(UUIDSchema).min(2, 'At least 2 recipes are required for comparison'),
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  compare_with: z.enum(['previous_period', 'industry_average', 'target']).default('previous_period'),
})

export const HPPAnalysisQuerySchema = z.object({
  recipe_id: UUIDSchema,
  analysis_type: z.enum(['cost_trends', 'profitability', 'efficiency', 'breakdown']).default('cost_trends'),
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  include_recommendations: z.boolean().default(true),
})

// Type exports
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>
export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>
export type FileUpload = z.infer<typeof FileUploadSchema>
export type ImageUpload = z.infer<typeof ImageUploadSchema>
export type ReportQuery = z.infer<typeof ReportQuerySchema>
export type SalesQuery = z.infer<typeof SalesQuerySchema>
