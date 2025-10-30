/**
 * API Validation Schemas (Clean Version)
 * 
 * This file contains only API-specific validation schemas.
 * Domain schemas have been moved to src/lib/validations/domains/
 * 
 * Import structure:
 * - Common schemas (pagination, date ranges): @/lib/validations/domains/common
 * - Entity schemas (customer, order, etc): @/lib/validations/domains/{entity}
 * - API-specific schemas: This file
 */

import { z } from 'zod'
import { DateStringSchema, UUIDSchema } from './base-validations'

// Re-export common schemas for backward compatibility
export {
  PaginationQuerySchema,
  DateRangeQuerySchema,
  IdParamSchema,
  HPPExportQuerySchema,
  HPPComparisonQuerySchema,
  HPPAnalysisQuerySchema,
  SalesQuerySchema,
  ReportQuerySchema,
} from './domains/common'

// Re-export domain schemas for backward compatibility
export {
  CustomerInsertSchema,
  CustomerUpdateSchema,
  CustomerQuerySchema
} from './domains/customer'

export {
  OrderFormSchema,
  OrderInsertSchema,
} from './domains/order'

export {
  IngredientFormSchema,
  IngredientInsertSchema,
} from './domains/ingredient'

export {
  RecipeFormSchema,
  RecipeInsertSchema,
} from './domains/recipe'

export {
  SupplierFormSchema,
  SupplierInsertSchema,
} from './domains/supplier'

// Reports API validation schemas
export const ReportTypeEnum = z.enum([
  'sales', 'inventory', 'profit', 'customers', 'orders',
  'hpp', 'operational_costs', 'financial', 'trends'
])

// File upload validation schemas
export const FileUploadSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  type: z.string().refine(
    (type) => {
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ]
      return allowedTypes.includes(type)
    },
    'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, PDF, Excel, CSV'
  ),
  lastModified: z.number().optional(),
})

export const ImageUploadSchema = FileUploadSchema.extend({
  type: z.string().refine(
    (type) => type.startsWith('image/'),
    'File must be an image'
  ),
  width: z.number().min(100).max(4096).optional(),
  height: z.number().min(100).max(4096).optional(),
})

// Webhook and integration schemas
export const WebhookPayloadSchema = z.object({
  event: z.string().min(1),
  data: z.unknown(),
  timestamp: z.string().datetime(),
  signature: z.string().optional(),
})

// Settings validation schemas
export const UserProfileSettingsSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100),
  email: z.string().email().optional(),
  phone: z.string().regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
  language: z.enum(['id', 'en']).default('id'),
  timezone: z.string().min(1),
})

export const BusinessInfoSettingsSchema = z.object({
  businessName: z.string().min(1).max(255),
  businessType: z.enum(['UMKM', 'cafe', 'restaurant', 'food-truck', 'catering', 'other']),
  taxId: z.string().max(50).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  phone: z.string().regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
})

export const NotificationSettingsSchema = z.object({
  email: z.object({
    orders: z.boolean().default(true),
    inventory: z.boolean().default(true),
    finance: z.boolean().default(true),
    system: z.boolean().default(true),
  }),
  push: z.object({
    orders: z.boolean().default(true),
    inventory: z.boolean().default(false),
    finance: z.boolean().default(false),
    system: z.boolean().default(true),
  }),
  sms: z.object({
    critical: z.boolean().default(true),
    orders: z.boolean().default(false),
  }).optional()
})

export const RegionalSettingsSchema = z.object({
  language: z.enum(['id', 'en', 'jv']).default('id'),
  timezone: z.string().min(1).default('Asia/Jakarta'),
  currency: z.enum(['IDR', 'USD', 'EUR', 'SGD', 'MYR']).default('IDR'),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD/MM/YYYY'),
  timeFormat: z.enum(['12h', '24h']).default('24h'),
  numberFormat: z.enum(['id', 'en']).default('id'),
})

export const SecuritySettingsSchema = z.object({
  twoFactorEnabled: z.boolean().default(false),
  sessionTimeout: z.number().min(5).max(480).default(60),
  passwordMinLength: z.number().int().min(6).default(8),
  requireSymbols: z.boolean().default(true),
  requireNumbers: z.boolean().default(true),
  suspiciousActivityAlerts: z.boolean().default(true),
})

export const ThemeSettingsSchema = z.object({
  mode: z.enum(['light', 'dark', 'system']).default('system'),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3b82f6'),
  fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
  compactMode: z.boolean().default(false),
  animations: z.boolean().default(true),
})

export const AppSettingsSchema = z.object({
  user: UserProfileSettingsSchema.optional(),
  business: BusinessInfoSettingsSchema.optional(),
  notifications: NotificationSettingsSchema.optional(),
  regional: RegionalSettingsSchema.optional(),
  security: SecuritySettingsSchema.optional(),
  theme: ThemeSettingsSchema.optional(),
})

// Business logic validation schemas
export const HPPCalculationInputSchema = z.object({
  ingredients: z.array(z.object({
    ingredientId: UUIDSchema,
    name: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.string().min(1),
    unitCost: z.number().min(0),
    totalCost: z.number().min(0),
  })).min(1),
  laborCost: z.number().min(0).default(0),
  overheadCost: z.number().min(0).default(0),
  packagingCost: z.number().min(0).default(0),
  operationalCosts: z.array(z.object({
    category: z.string().min(1),
    amount: z.number().min(0),
    allocation: z.number().min(0).max(100),
  })).default([]),
  sellingPrice: z.number().min(0).optional(),
  targetMargin: z.number().min(0).max(1).default(0.3),
  taxRate: z.number().min(0).max(1).default(0.11),
})

export const CurrencyFormatSchema = z.object({
  amount: z.number().min(0),
  currency: z.enum(['IDR', 'USD', 'EUR', 'SGD', 'MYR']).default('IDR'),
  locale: z.string().default('id-ID'),
  showSymbol: z.boolean().default(true),
  decimals: z.number().min(0).max(4).default(0),
  useGrouping: z.boolean().default(true),
})

export const InventoryCalculationSchema = z.object({
  currentStock: z.number().min(0),
  minimumStock: z.number().min(0),
  maximumStock: z.number().min(0).optional(),
  reorderPoint: z.number().min(0),
  reorderQuantity: z.number().positive(),
  leadTime: z.number().min(1).max(365).default(7),
  consumptionRate: z.number().min(0),
})

export const SalesCalculationSchema = z.object({
  items: z.array(z.object({
    recipeId: UUIDSchema,
    quantity: z.number().positive(),
    unitPrice: z.number().min(0),
    discount: z.number().min(0).default(0),
  })).min(1),
  taxes: z.array(z.object({
    name: z.string().min(1),
    rate: z.number().min(0).max(1),
    amount: z.number().min(0),
  })).default([]),
  discounts: z.array(z.object({
    type: z.enum(['percentage', 'fixed']),
    value: z.number().min(0),
    description: z.string().optional(),
  })).default([]),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DIGITAL_WALLET', 'OTHER']),
  customerId: UUIDSchema.optional(),
})

export const ReportGenerationSchema = z.object({
  type: z.enum(['sales', 'inventory', 'profit', 'customers', 'orders', 'hpp', 'financial']),
  dateRange: z.object({
    start: DateStringSchema,
    end: DateStringSchema,
  }),
  filters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  groupBy: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
  format: z.enum(['json', 'excel', 'pdf']).default('json'),
  includeCharts: z.boolean().default(false),
  includeSummary: z.boolean().default(true),
})

// Cron job config removed - no longer using internal cron
// export const CronJobConfigSchema = z.object({
//   name: z.string().min(1),
//   schedule: z.string().regex(/^(\*|(\d+)) (\*|(\d+)) (\*|(\d+)) (\*|(\d+)) (\*|(\d+))$/),
//   enabled: z.boolean().default(true),
//   timeout: z.number().min(1000).max(3600000).default(300000),
//   retryAttempts: z.number().min(0).max(10).default(3),
//   retryDelay: z.number().min(1000).max(300000).default(60000),
//   notificationOnFailure: z.boolean().default(true),
//   priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
// })

// Type exports
export type FileUpload = z.infer<typeof FileUploadSchema>
export type ImageUpload = z.infer<typeof ImageUploadSchema>
export type UserProfileSettings = z.infer<typeof UserProfileSettingsSchema>
export type BusinessInfoSettings = z.infer<typeof BusinessInfoSettingsSchema>
export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>
export type RegionalSettings = z.infer<typeof RegionalSettingsSchema>
export type SecuritySettings = z.infer<typeof SecuritySettingsSchema>
export type ThemeSettings = z.infer<typeof ThemeSettingsSchema>
export type AppSettings = z.infer<typeof AppSettingsSchema>
export type HPPCalculationInput = z.infer<typeof HPPCalculationInputSchema>
export type CurrencyFormat = z.infer<typeof CurrencyFormatSchema>
export type InventoryCalculation = z.infer<typeof InventoryCalculationSchema>
export type SalesCalculation = z.infer<typeof SalesCalculationSchema>
export type ReportGeneration = z.infer<typeof ReportGenerationSchema>
// export type CronJobConfig = z.infer<typeof CronJobConfigSchema>
