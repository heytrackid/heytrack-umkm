// Base validation utilities and core schemas
// Core validation functions and basic schemas used across the application

import { z } from 'zod'
import { apiLogger } from '@/lib/logger'
import { InputSanitizer } from '@/utils/security'

// Base validation utilities
export const requiredString = z.string().min(1, 'validation.fieldRequired')
export const optionalString = z.string().optional()
export const positiveNumber = z.number().positive('validation.positiveNumber')
export const nonNegativeNumber = z.number().min(0, 'validation.nonNegative')
export const email = z.string().email('validation.invalidEmail')
export const phone = z.string().min(10, 'validation.phoneMinLength')
export const uuid = z.string().uuid('validation.invalidId')

// Indonesian specific validations
export const rupiah = z.number().min(0, 'validation.nonNegativeAmount').transform(val => Math.round(val))
export const percentage = z.number().min(0, 'validation.nonNegativePercentage').max(100, 'validation.maxPercentage')
export const indonesianName = z.string().min(2, 'validation.nameMinLength').max(100, 'validation.nameMaxLength')

// Enhanced base schemas
export const UUIDSchema = z.string().uuid({ message: 'Invalid UUID format' })
export const EmailSchema = z.string().email({ message: 'Invalid email format' })
export const PhoneSchema = z.string().regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/, 'Invalid Indonesian phone number')
export const DateStringSchema = z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date string')
export const PositiveNumberSchema = z.number().positive()
export const NonNegativeNumberSchema = z.number().nonnegative()

// Enums
export const OrderStatusEnum = z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'])
export const PaymentMethodEnum = z.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DIGITAL_WALLET', 'OTHER'])
export const UserRoleEnum = z.enum(['OWNER', 'MANAGER', 'STAFF', 'VIEWER'])
export const ProductionStatusEnum = z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
export const BusinessUnitEnum = z.enum(['RESTAURANT', 'CAFE', 'UMKM', 'CATERING', 'OTHER'])
export const RecordTypeEnum = z.enum(['INCOME', 'EXPENSE'])
export const TransactionTypeEnum = z.enum(['SALES', 'PURCHASE', 'SALARY', 'RENT', 'UTILITIES', 'OTHER'])

// Environment validation
export const EnvSchema = z.object({
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),

  // AI Services (at least one required)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // Application Settings
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']),

  // Cron removed - no longer needed
  // CRON_SECRET: z.string().optional(),
}).refine((env) => 
  // At least one AI service must be configured
   env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY
, {
  message: 'At least one AI service (OpenAI or Anthropic) must be configured',
  path: ['OPENAI_API_KEY']
})

// Type for validated environment
export type EnvConfig = z.infer<typeof EnvSchema>

// Function to validate environment variables
export function validateEnvironment(): EnvConfig {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    NEXT_PUBLIC_APP_URL: process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000',
    NODE_ENV: process.env.NODE_ENV || 'development',
    // CRON_SECRET: process.env.CRON_SECRET, // Removed
  }

  const validation = EnvSchema.safeParse(env)

  if (!validation.success) {
    apiLogger.error({ error: '❌ Environment validation failed:' }, 'Console error replaced with logger')
    validation.error.issues.forEach((issue) => {
      apiLogger.error({ error: `  - ${issue.path.join('.')}: ${issue.message}` })
    })
    throw new Error('Invalid environment configuration')
  }

  return validation.data
}

// Validation utility functions
export function validateFormData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: z.ZodIssue[]
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, errors: err.issues }
    }
    throw err
  }
}

// Format validation errors for display
export function formatValidationErrors(errors: z.ZodIssue[]): string[] {
  return errors.map((error) => {
    const path = error.path.join('.')
    return path ? `${path}: ${error.message}` : error.message
  })
}

// Convert Zod errors to field-level errors for form libraries
export function zodErrorsToFieldErrors(errors: z.ZodIssue[]): Record<string, string> {
  const fieldErrors: Record<string, string> = {}

  errors.forEach((error) => {
    const fieldName = error.path.join('.')
    if (!fieldErrors[fieldName]) {
      // Sanitize error messages to prevent XSS
      fieldErrors[fieldName] = InputSanitizer.sanitizeHtml(error.message)
    }
  })

  return fieldErrors
}

// Legacy validation function (still used in supabase.ts)
export function validateInput(data: unknown, rules?: Record<string, unknown>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (typeof data !== 'object' || data === null) {
    return { isValid: false, errors: ['Data must be an object'] }
  }

  const objData = data as Record<string, unknown>

  for (const [field, rule] of Object.entries(rules || {})) {
    const value = objData[field]

    if (rule && typeof rule === 'object') {
      const ruleObj = rule as {
        required?: boolean
        type?: string
        minLength?: number
        maxLength?: number
        pattern?: RegExp
        isEmail?: boolean
      }

      if (ruleObj?.required && (!value || value === '')) {
        errors.push(`validation.fieldRequired`)
        continue
      }

      if (value !== undefined && value !== null) {
        if (ruleObj?.type && typeof value !== ruleObj?.type) {
          errors.push(`validation.invalidType`)
        }

        if (ruleObj?.minLength && typeof value === 'string' && value.length < ruleObj?.minLength) {
          errors.push(`validation.minLength`)
        }

        if (ruleObj?.maxLength && typeof value === 'string' && value.length > ruleObj?.maxLength) {
          errors.push(`validation.maxLength`)
        }

        if (ruleObj?.pattern && typeof value === 'string' && !ruleObj?.pattern?.test(value)) {
          errors.push(`validation.invalidFormat`)
        }

        if (ruleObj?.isEmail && typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push(`validation.invalidEmail`)
        }

        if (typeof value === 'string' && /<script|javascript:|on\w+=/i.test(value)) {
          errors.push(`validation.dangerousContent`)
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// SQL injection prevention sanitization
export function sanitizeSQL(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/xp_/gi, '')
    .replace(/sp_/gi, '')
}
