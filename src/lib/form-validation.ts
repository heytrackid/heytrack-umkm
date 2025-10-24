import { z } from 'zod'

/**
 * Form Validation Utilities - Reusable Zod schemas for common form fields
 */

export const ValidationSchemas = {
  // Basic fields
  requiredString: z.string().min(1, 'This field is required'),
  requiredEmail: z.string().email('Invalid email address'),
  requiredNumber: z.string().or(z.number()).refine((val) => !isNaN(Number(val)), 'Must be a number'),
  requiredPositiveNumber: z.string().or(z.number()).refine((val) => Number(val) > 0, 'Must be greater than 0'),
  optionalString: z.string().optional().nullable(),

  // Specific fields
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^[0-9+\-\s()]*$/, 'Invalid phone number'),
  percentage: z.number().min(0).max(100, 'Must be between 0 and 100'),
  currency: z.string().or(z.number()).refine((val) => Number(val) >= 0, 'Must be a valid currency'),

  // Common composite schemas
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    province: z.string().optional(),
    postal_code: z.string().optional(),
  }),

  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
}

/**
 * Parse form data and return errors object
 */
export function parseFormErrors<T extends Record<string, unknown>>(
  schema: z.ZodSchema<T>,
  data: any): {
  errors: Partial<Record<keyof T, string>>
  data: null
} | {
  errors: null
  data: T
} {
  try {
    const validated = schema.parse(data)
    return { errors: null, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Partial<Record<keyof T, string>> = {}
      error.errors.forEach((err) => {
        const key = err.path.join('.') as keyof T
        errors[key] = err.message
      })
      return { errors, data: null }
    }
    return { errors: { _form: 'Validation failed' } as any, data: null }
  }
}

/**
 * Create a safe form validator that catches errors
 */
export function createFormValidator<T extends Record<string, unknown>>(schema: z.ZodSchema<T>) {
  return (data: any) => {
    try {
      return {
        success: true,
        data: schema.parse(data),
        errors: null,
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof T, string>> = {}
        error.errors.forEach((err) => {
          const key = err.path.join('.') as keyof T
          errors[key] = err.message
        })
        return {
          success: false,
          data: null,
          errors,
        }
      }
      return {
        success: false,
        data: null,
        errors: { _form: 'Validation failed' } as any,
      }
    }
  }
}

/**
 * Common form schemas ready to use
 */
export const CommonFormSchemas = {
  LoginForm: z.object({
    email: ValidationSchemas.requiredEmail,
    password: z.string().min(1, 'Password is required'),
  }),

  RegisterForm: z.object({
    email: ValidationSchemas.requiredEmail,
    password: ValidationSchemas.password,
    confirmPassword: z.string(),
    name: ValidationSchemas.name,
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }),

  CustomerForm: z.object({
    name: ValidationSchemas.name,
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: ValidationSchemas.phone.optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    notes: z.string().optional(),
  }),

  IngredientForm: z.object({
    name: ValidationSchemas.name,
    unit: ValidationSchemas.requiredString,
    price_per_unit: ValidationSchemas.requiredPositiveNumber,
    supplier: z.string().optional(),
    notes: z.string().optional(),
  }),

  RecipeForm: z.object({
    name: ValidationSchemas.name,
    description: z.string().optional(),
    serving_size: ValidationSchemas.requiredPositiveNumber,
    unit: ValidationSchemas.requiredString,
    selling_price: ValidationSchemas.requiredPositiveNumber,
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    preparation_time: ValidationSchemas.requiredNumber.optional(),
  }),

  OperationalCostForm: z.object({
    name: ValidationSchemas.name,
    category: ValidationSchemas.requiredString,
    amount: ValidationSchemas.requiredPositiveNumber,
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    is_fixed: z.boolean().default(true),
    description: z.string().optional(),
  }),
}
