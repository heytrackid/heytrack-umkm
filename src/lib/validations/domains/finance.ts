/**
 * Finance Validation Schemas
 * Validation schemas for finance-related operations
 */

import { z } from 'zod'
import { UUIDSchema, NonNegativeNumberSchema, DateStringSchema } from '../base-validations'

// Financial record schemas
export const FinancialRecordInsertSchema = z.object({
  date: DateStringSchema,
  type: z.enum(['INCOME', 'EXPENSE', 'INVESTMENT', 'WITHDRAWAL']),
  category: z.string().min(1, 'Category is required').max(100),
  subcategory: z.string().max(100).optional().nullable(),
  amount: NonNegativeNumberSchema,
  description: z.string().max(500).optional().nullable(),
  reference_type: z.enum(['ORDER', 'PURCHASE', 'SALARY', 'UTILITIES', 'RENT', 'EQUIPMENT', 'OTHER']).optional().nullable(),
  reference_id: UUIDSchema.optional().nullable(),
  payment_method: z.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'QRIS', 'OTHER']).optional().nullable(),
  is_recurring: z.boolean().default(false).optional(),
  recurring_frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional().nullable(),
  tax_amount: NonNegativeNumberSchema.default(0).optional(),
  tax_rate: NonNegativeNumberSchema.max(100).optional(),
  notes: z.string().max(1000).optional().nullable(),
})

export const FinancialRecordUpdateSchema = FinancialRecordInsertSchema.partial()

// Sales summary schemas
export const DailySalesSummaryInsertSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  total_orders: z.number().int().nonnegative().default(0),
  total_revenue: NonNegativeNumberSchema.default(0),
  total_cost: NonNegativeNumberSchema.default(0),
  gross_profit: NonNegativeNumberSchema.default(0),
  net_profit: NonNegativeNumberSchema.default(0),
  average_order_value: NonNegativeNumberSchema.default(0),
  top_selling_items: z.array(z.object({
    recipe_id: UUIDSchema,
    recipe_name: z.string().max(255),
    quantity_sold: z.number().int().nonnegative(),
    revenue: NonNegativeNumberSchema,
  })).optional(),
})

export const DailySalesSummaryUpdateSchema = DailySalesSummaryInsertSchema.partial()

// Operational cost schemas (maps to expenses table)
export const OperationalCostInsertSchema = z.object({
  date: DateStringSchema,
  category: z.enum(['LABOR', 'UTILITIES', 'RENT', 'MAINTENANCE', 'SUPPLIES', 'MARKETING', 'OTHER']),
  subcategory: z.string().max(100).optional().nullable(),
  amount: NonNegativeNumberSchema,
  description: z.string().max(500).optional().nullable(),
  is_recurring: z.boolean().default(false).optional(),
  recurring_frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional().nullable(),
  vendor_name: z.string().max(255).optional().nullable(),
  invoice_number: z.string().max(100).optional().nullable(),
  payment_due_date: DateStringSchema.optional().nullable(),
  is_paid: z.boolean().default(false).optional(),
  notes: z.string().max(1000).optional().nullable(),
})

export const OperationalCostUpdateSchema = OperationalCostInsertSchema.partial()

// Finance API schemas
export const FinancialRecordQuerySchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'INVESTMENT', 'WITHDRAWAL']).optional(),
  category: z.string().optional(),
  start_date: DateStringSchema.optional(),
  end_date: DateStringSchema.optional(),
  payment_method: z.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'QRIS', 'OTHER']).optional(),
  is_recurring: z.boolean().optional(),
  min_amount: NonNegativeNumberSchema.optional(),
  max_amount: NonNegativeNumberSchema.optional(),
})

export const FinancialReportQuerySchema = z.object({
  report_type: z.enum(['PROFIT_LOSS', 'CASH_FLOW', 'BALANCE_SHEET', 'EXPENSE_BREAKDOWN']),
  period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  start_date: DateStringSchema,
  end_date: DateStringSchema,
  include_charts: z.boolean().default(true),
  include_details: z.boolean().default(true),
  categories: z.array(z.string()).optional(),
})

export const ExpenseQuerySchema = z.object({
  category: z.enum(['LABOR', 'UTILITIES', 'RENT', 'MAINTENANCE', 'SUPPLIES', 'MARKETING', 'OTHER']).optional(),
  is_paid: z.boolean().optional(),
  start_date: DateStringSchema.optional(),
  end_date: DateStringSchema.optional(),
  min_amount: NonNegativeNumberSchema.optional(),
  max_amount: NonNegativeNumberSchema.optional(),
})

export type FinancialRecordInsert = z.infer<typeof FinancialRecordInsertSchema>
export type FinancialRecordUpdate = z.infer<typeof FinancialRecordUpdateSchema>
export type DailySalesSummaryInsert = z.infer<typeof DailySalesSummaryInsertSchema>
export type DailySalesSummaryUpdate = z.infer<typeof DailySalesSummaryUpdateSchema>
export type OperationalCostInsert = z.infer<typeof OperationalCostInsertSchema>
export type OperationalCostUpdate = z.infer<typeof OperationalCostUpdateSchema>
export type FinancialRecordQuery = z.infer<typeof FinancialRecordQuerySchema>
export type FinancialReportQuery = z.infer<typeof FinancialReportQuerySchema>
export type ExpenseQuery = z.infer<typeof ExpenseQuerySchema>
