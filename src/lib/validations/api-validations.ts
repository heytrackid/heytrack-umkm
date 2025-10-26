// API validation schemas
// Validation schemas specifically for API request/response handling

import { z } from 'zod'
import { DateStringSchema, UUIDSchema } from './base-validations'

// API request/response schemas
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

export const DateRangeQuerySchema = z.object({
  start_date: DateStringSchema.optional(),
  end_date: DateStringSchema.optional(),
})

// Form schemas for frontend validation (handles form-specific requirements)
export const OrderFormSchema = z.object({
  order_no: z.string().min(1, 'validation.orderNumberRequired').optional(),
  customer_id: UUIDSchema.optional(),
  customer_name: z.string().min(1, 'validation.customerNameRequired'),
  customer_phone: z.string().regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/, 'Invalid Indonesian phone number').optional().or(z.literal('')),
  customer_address: z.string().max(500).optional().or(z.literal('')),
  items: z.array(z.object({
    recipe_id: UUIDSchema.optional(),
    product_name: z.string().min(1, 'validation.productNameRequired'),
    quantity: z.number().positive('validation.quantityPositive'),
    unit_price: z.number().min(0, 'validation.unitPriceNonNegative'),
    total_price: z.number().min(0, 'validation.totalPriceNonNegative'),
    special_requests: z.string().max(500).optional().or(z.literal('')),
  })).min(1, 'Order must have at least one item'),
}).extend({
  order_date: DateStringSchema.optional(),
  delivery_date: DateStringSchema.optional(),
  delivery_time: z.string().max(50).optional().or(z.literal('')),
  delivery_fee: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  notes: z.string().max(1000).optional().or(z.literal('')),
  special_instructions: z.string().max(1000).optional().or(z.literal('')),
})

export const CustomerFormSchema = z.object({
  name: z.string().min(1, 'Customer name is required').max(255),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/, 'Invalid Indonesian phone number').optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  birth_date: z.string().optional(),
  customer_type: z.enum(['REGULAR', 'VIP', 'WHOLESALE']).default('REGULAR'),
  discount_percentage: z.number().min(0).max(100).optional(),
  notes: z.string().max(1000).optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  loyalty_points: z.number().min(0).default(0),
  favorite_items: z.unknown().optional(),
})

export const IngredientFormSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required').max(255),
  category: z.string().min(1, 'Category is required').max(100).optional(),
  unit: z.enum(['kg', 'gram', 'liter', 'ml', 'pcs', 'pack']),
  current_stock: z.number().min(0).default(0),
  min_stock: z.number().min(0).default(0),
  max_stock: z.number().min(0).optional(),
  price_per_unit: z.number().min(0).optional(),
  supplier: z.string().optional(),
  supplier_id: UUIDSchema.optional(),
  supplier_info: z.object({
    name: z.string().optional(),
    contact: z.string().optional(),
  }).optional(),
  is_active: z.boolean().default(true),
  description: z.string().max(500).optional().or(z.literal('')),
  storage_location: z.string().max(100).optional().or(z.literal('')),
  expiry_date: DateStringSchema.optional(),
  reorder_point: z.number().min(0).optional(),
  lead_time_days: z.number().min(0).optional(),
  nutritional_info: z.unknown().optional(),
})

export const RecipeFormSchema = z.object({
  name: z.string().min(1, 'Recipe name is required').max(255),
  description: z.string().max(1000).optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required').max(100).optional(),
  servings: z.number().positive(),
  prep_time_minutes: z.number().min(0),
  cook_time_minutes: z.number().min(0).optional(),
  instructions: z.array(z.string()).min(1, 'Instructions are required'),
  difficulty_level: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  tags: z.array(z.string()).optional(),
  recipe_ingredients: z.array(z.object({
    ingredient_id: UUIDSchema,
    quantity: z.number().positive(),
    unit: z.string().max(50),
  })).min(1, 'Recipe must have at least one ingredient'),
  selling_price: z.number().min(0),
  cost_price: z.number().min(0).optional(),
  cost_per_serving: z.number().min(0).optional(),
  profit_margin: z.number().min(0).optional(),
  is_active: z.boolean().default(true),
  image_url: z.string().url().optional().or(z.literal('')),
  nutritional_info: z.record(z.string(), z.unknown()).optional(),
})

export const SupplierFormSchema = z.object({
  name: z.string().min(1, 'Supplier name is required').max(255),
  contact_person: z.string().max(255).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/, 'Invalid Indonesian phone number').optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  payment_terms: z.string().max(100).optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  notes: z.string().max(1000).optional().or(z.literal('')),
})

// Additional schema exports for API routes
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional()
})

export const IdParamSchema = z.object({
  id: z.string().uuid('validation.invalidIdFormat')
})

// HPP API validation schemas
export const TimePeriodEnum = z.enum(['7d', '30d', '90d', '1y', 'all'])
export type TimePeriod = z.infer<typeof TimePeriodEnum>

export const HPPExportQuerySchema = z.object({
  recipe_id: UUIDSchema,
  period: TimePeriodEnum.default('30d'),
  format: z.enum(['excel', 'csv', 'json']).default('excel'),
})

export const HPPComparisonQuerySchema = z.object({
  recipe_ids: z.array(UUIDSchema).min(1).max(10),
  period: TimePeriodEnum.default('30d'),
})

export const HPPAnalysisQuerySchema = z.object({
  recipe_id: UUIDSchema.optional(),
  period: TimePeriodEnum.default('30d'),
  include_cost_breakdown: z.coerce.boolean().default(true),
  include_trends: z.coerce.boolean().default(true),
})

// Reports API validation schemas
export const ReportTypeEnum = z.enum([
  'sales', 'inventory', 'profit', 'customers', 'orders',
  'hpp', 'operational_costs', 'financial', 'trends'
])

export const ReportQuerySchema = z.object({
  type: ReportTypeEnum,
  start_date: DateStringSchema.optional(),
  end_date: DateStringSchema.optional(),
  format: z.enum(['json', 'excel', 'pdf']).default('json'),
  group_by: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
})

// File upload validation schemas
export const FileUploadSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'), // 10MB
  type: z.string().refine(
    (type) => {
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv'
      ]
      return allowedTypes.includes(type)
    },
    'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, PDF, Excel, CSV'
  ),
  lastModified: z.number().optional(),
})

export type FileUpload = z.infer<typeof FileUploadSchema>

export const ImageUploadSchema = FileUploadSchema.extend({
  type: z.string().refine(
    (type) => type.startsWith('image/'),
    'File must be an image'
  ),
  width: z.number().min(100).max(4096).optional(),
  height: z.number().min(100).max(4096).optional(),
})

export type ImageUpload = z.infer<typeof ImageUploadSchema>

// Utility function validation schemas
export const DateRangeSchema = z.object({
  start: DateStringSchema,
  end: DateStringSchema,
}).refine((data) => {
  return new Date(data.start) <= new Date(data.end)
}, 'Start date must be before or equal to end date')

export const PaginationParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Webhook and integration schemas
export const WebhookPayloadSchema = z.object({
  event: z.string().min(1),
  data: z.unknown(),
  timestamp: z.string().datetime(),
  signature: z.string().optional(),
})

// Sales query schema
export const SalesQuerySchema = z.object({
  start_date: DateStringSchema.optional(),
  end_date: DateStringSchema.optional(),
  recipe_id: UUIDSchema.optional(),
  customer_name: z.string().optional(),
})

// Settings validation schemas
export const UserProfileSettingsSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100, 'Nama lengkap maksimal 100 karakter'),
  email: z.string().email().optional(),
  phone: z.string().regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/, 'Invalid Indonesian phone number').optional(),
  avatar: z.string().url('URL avatar tidak valid').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio maksimal 500 karakter').optional().or(z.literal('')),
  language: z.enum(['id', 'en']).default('id'),
  timezone: z.string().min(1, 'Timezone diperlukan'),
})

export const BusinessInfoSettingsSchema = z.object({
  businessName: z.string().min(1, 'Nama bisnis diperlukan').max(255, 'Nama bisnis maksimal 255 karakter'),
  businessType: z.enum(['UMKM', 'cafe', 'restaurant', 'food-truck', 'catering', 'other']),
  taxId: z.string().max(50, 'NPWP maksimal 50 karakter').optional().or(z.literal('')),
  address: z.string().max(500, 'Alamat maksimal 500 karakter').optional().or(z.literal('')),
  phone: z.string().regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/, 'Invalid Indonesian phone number').optional(),
  email: z.string().email().optional(),
  website: z.string().url('URL website tidak valid').optional().or(z.literal('')),
  description: z.string().max(1000, 'Deskripsi maksimal 1000 karakter').optional().or(z.literal('')),
})

export const NotificationSettingsSchema = z.object({
  email: z.object({
    orders: z.boolean().default(true),
    inventory: z.boolean().default(true),
    finance: z.boolean().default(true),
    system: z.boolean().default(true),
  }).default({}),
  push: z.object({
    orders: z.boolean().default(true),
    inventory: z.boolean().default(false),
    finance: z.boolean().default(false),
    system: z.boolean().default(true),
  }).default({}),
  sms: z.object({
    critical: z.boolean().default(true),
    orders: z.boolean().default(false),
  }).default({}).optional()
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
  sessionTimeout: z.number().min(5).max(480).default(60), // minutes
  passwordMinLength: z.number().int().min(6).default(8),
  requireSymbols: z.boolean().default(true),
  requireNumbers: z.boolean().default(true),
  suspiciousActivityAlerts: z.boolean().default(true),
})

export const ThemeSettingsSchema = z.object({
  mode: z.enum(['light', 'dark', 'system']).default('system'),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Warna harus dalam format hex').default('#3b82f6'),
  fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
  compactMode: z.boolean().default(false),
  animations: z.boolean().default(true),
})

// Combined settings schema
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
  })).min(1, 'Minimal 1 bahan diperlukan'),

  laborCost: z.number().min(0).default(0),
  overheadCost: z.number().min(0).default(0),
  packagingCost: z.number().min(0).default(0),
  operationalCosts: z.array(z.object({
    category: z.string().min(1),
    amount: z.number().min(0),
    allocation: z.number().min(0).max(100),
  })).default([]),

  sellingPrice: z.number().min(0).optional(),
  targetMargin: z.number().min(0).max(1).default(0.3), // 30% default margin
  taxRate: z.number().min(0).max(1).default(0.11), // 11% PPN default
}).refine((data) => {
  // Validate that total costs are reasonable
  const totalIngredientCost = data.ingredients.reduce((sum, ing) => sum + ing.totalCost, 0)
  const totalOperationalCost = data.laborCost + data.overheadCost + data.packagingCost

  if (totalIngredientCost === 0) {
    return false // Must have ingredients
  }

  // Selling price should be higher than total cost
  if (data.sellingPrice && data.sellingPrice <= (totalIngredientCost + totalOperationalCost)) {
    return false
  }

  return true
}, {
  message: 'Harga jual harus lebih tinggi dari total biaya',
  path: ['sellingPrice']
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
  leadTime: z.number().min(1).max(365).default(7), // days
  consumptionRate: z.number().min(0), // per day
}).refine((data) => {
  // Business rules for inventory
  if (data.minimumStock > data.currentStock) {
    return false // Current stock should be above minimum
  }

  if (data.maximumStock && data.maximumStock < data.currentStock) {
    return false // Current stock should be below maximum
  }

  return true
}, {
  message: 'Stok saat ini harus antara minimum dan maximum',
  path: ['currentStock']
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
}).refine((data) => {
  // Validate that discounts don't exceed item values
  const totalItemsValue = data.items.reduce((sum, item) =>
    sum + (item.quantity * item.unitPrice), 0)

  const totalDiscountValue = data.discounts.reduce((sum, discount) => {
    if (discount.type === 'percentage') {
      return sum + (totalItemsValue * discount.value)
    }
    return sum + discount.value
  }, 0)

  return totalDiscountValue <= totalItemsValue
}, {
  message: 'Total diskon tidak boleh melebihi nilai pesanan',
  path: ['discounts']
})

export const ReportGenerationSchema = z.object({
  type: z.enum(['sales', 'inventory', 'profit', 'customers', 'orders', 'hpp', 'financial']),
  dateRange: z.object({
    start: DateStringSchema,
    end: DateStringSchema,
  }).refine((range) => new Date(range.start) <= new Date(range.end), {
    message: 'Tanggal mulai harus sebelum tanggal akhir',
    path: ['start']
  }),

  filters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  groupBy: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
  format: z.enum(['json', 'excel', 'pdf']).default('json'),
  includeCharts: z.boolean().default(false),
  includeSummary: z.boolean().default(true),
})

export const CronJobConfigSchema = z.object({
  name: z.string().min(1, 'Nama job diperlukan'),
  schedule: z.string().regex(/^(\*|(\d+)) (\*|(\d+)) (\*|(\d+)) (\*|(\d+)) (\*|(\d+))$/, 'Format cron tidak valid'),
  enabled: z.boolean().default(true),
  timeout: z.number().min(1000).max(3600000).default(300000), // 5 minutes max
  retryAttempts: z.number().min(0).max(10).default(3),
  retryDelay: z.number().min(1000).max(300000).default(60000), // 1 minute default
  notificationOnFailure: z.boolean().default(true),
  priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
})

// Infer types from schemas
export type UserProfileSettings = z.infer<typeof UserProfileSettingsSchema>
export type BusinessInfoSettings = z.infer<typeof BusinessInfoSettingsSchema>
export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>
export type RegionalSettings = z.infer<typeof RegionalSettingsSchema>
export type SecuritySettings = z.infer<typeof SecuritySettingsSchema>
export type ThemeSettings = z.infer<typeof ThemeSettingsSchema>
export type AppSettings = z.infer<typeof AppSettingsSchema>

/**
 * Validates user profile settings
 */
export function validateUserProfileSettings(data: unknown): UserProfileSettings {
  const result = UserProfileSettingsSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
    throw new Error(`User profile validation failed: ${errors}`)
  }
  return result.data
}

/**
 * Validates business information settings
 */
export function validateBusinessInfoSettings(data: unknown): BusinessInfoSettings {
  const result = BusinessInfoSettingsSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
    throw new Error(`Business info validation failed: ${errors}`)
  }
  return result.data
}

/**
 * Validates notification settings
 */
export function validateNotificationSettings(data: unknown): NotificationSettings {
  const result = NotificationSettingsSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
    throw new Error(`Notification validation failed: ${errors}`)
  }
  return result.data
}

// Type exports for API schemas
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>
export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>
export type OrderForm = z.infer<typeof OrderFormSchema>
export type CustomerForm = z.infer<typeof CustomerFormSchema>
export type IngredientForm = z.infer<typeof IngredientFormSchema>
export type RecipeForm = z.infer<typeof RecipeFormSchema>
export type SupplierForm = z.infer<typeof SupplierFormSchema>
export type HPPCalculationInput = z.infer<typeof HPPCalculationInputSchema>
export type CurrencyFormat = z.infer<typeof CurrencyFormatSchema>
export type InventoryCalculation = z.infer<typeof InventoryCalculationSchema>
export type SalesCalculation = z.infer<typeof SalesCalculationSchema>
export type ReportGeneration = z.infer<typeof ReportGenerationSchema>
export type CronJobConfig = z.infer<typeof CronJobConfigSchema>
