// Advanced validation utilities and rules

import { z } from 'zod'
import { VALIDATION_MESSAGES } from './constants'

// Common validation patterns
export const validationPatterns = {
  phone: /^(\+62|62|0)[8-9][0-9]{7,11}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  postalCode: /^\d{5}$/,
  taxId: /^\d{15}$/,
  bankAccount: /^\d{10,20}$/,
  url: /^https?:\/\/.+/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
}

// Custom validation functions
export const validationFunctions = {
  // Phone number validation
  phone: (value: string) => {
    if (!value) {return true} // Optional field
    return validationPatterns.phone.test(value.replace(/\s/g, ''))
  },

  // Email validation
  email: (value: string) => {
    if (!value) {return true} // Optional field
    return validationPatterns.email.test(value)
  },

  // Indonesian name validation (no numbers, reasonable length)
  indonesianName: (value: string) => {
    if (!value || value.length < 2) {return false}
    if (value.length > 50) {return false}
    if (/\d/.test(value)) {return false} // No numbers in names
    return true
  },

  // Positive number validation
  positiveNumber: (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return !isNaN(num) && num > 0
  },

  // Non-negative number validation
  nonNegativeNumber: (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return !isNaN(num) && num >= 0
  },

  // Currency validation (Indonesian Rupiah)
  rupiah: (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value
    return !isNaN(num) && num >= 0 && num <= 999999999 // Max 999M
  },

  // Percentage validation
  percentage: (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return !isNaN(num) && num >= 0 && num <= 100
  },

  // Date validation (not in future for some cases)
  notInFuture: (date: string | Date) => {
    const dateObj = new Date(date)
    const now = new Date()
    return dateObj <= now
  },

  // Age validation (for customers)
  validAge: (birthDate: string | Date) => {
    const birth = new Date(birthDate)
    const now = new Date()
    const age = now.getFullYear() - birth.getFullYear()
    return age >= 0 && age <= 150 // Reasonable age range
  },

  // Stock validation (min_stock <= current_stock)
  validStockLevels: (data: { min_stock?: number; current_stock: number }) => {
    if (!data.min_stock) {return true}
    return data.min_stock <= data.current_stock
  },

  // Business hours validation
  businessHours: (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
  },

  // File size validation
  fileSize: (file: File, maxSize: number) => file.size <= maxSize,

  // File type validation
  fileType: (file: File, allowedTypes: string[]) => allowedTypes.includes(file.type),

  // URL validation
  url: (value: string) => {
    if (!value) {return true} // Optional field
    try {
      new URL(value)
      return validationPatterns.url.test(value)
    } catch (error) {
      return false
    }
  }
}

// Enhanced Zod schemas with custom validations
export const enhancedSchemas = {
  // Indonesian phone number
  indonesianPhone: z
    .string()
    .optional()
    .refine((val) => !val || validationFunctions.phone(val), {
      message: VALIDATION_MESSAGES.INVALID_PHONE
    }),

  // Indonesian name
  indonesianName: z
    .string()
    .min(2, VALIDATION_MESSAGES.MIN_LENGTH(2))
    .max(50, VALIDATION_MESSAGES.MAX_LENGTH(50))
    .refine(validationFunctions.indonesianName, {
      message: 'Nama tidak boleh mengandung angka'
    }),

  // Enhanced email
  enhancedEmail: z
    .string()
    .optional()
    .refine((val) => !val || validationFunctions.email(val), {
      message: VALIDATION_MESSAGES.INVALID_EMAIL
    }),

  // Currency amount
  currency: z
    .number()
    .min(0, VALIDATION_MESSAGES.MIN_VALUE(0))
    .max(999999999, VALIDATION_MESSAGES.MAX_VALUE(999999999))
    .refine(validationFunctions.rupiah, {
      message: 'Format mata uang tidak valid'
    }),

  // Percentage
  percentage: z
    .number()
    .min(0, VALIDATION_MESSAGES.MIN_VALUE(0))
    .max(100, VALIDATION_MESSAGES.MAX_VALUE(100))
    .refine(validationFunctions.percentage, {
      message: 'Persentase harus antara 0-100'
    }),

  // Business time
  businessTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu harus HH:MM')
    .refine(validationFunctions.businessHours, {
      message: 'Format waktu tidak valid'
    }),

  // Birth date (not in future, reasonable age)
  birthDate: z
    .string()
    .datetime()
    .refine(validationFunctions.notInFuture, {
      message: 'Tanggal lahir tidak boleh di masa depan'
    })
    .refine((val) => validationFunctions.validAge(val), {
      message: 'Umur tidak valid'
    }),

  // URL validation
  url: z
    .string()
    .optional()
    .refine((val) => !val || validationFunctions.url(val), {
      message: 'URL tidak valid'
    }),

  // Username validation
  username: z
    .string()
    .min(3, VALIDATION_MESSAGES.MIN_LENGTH(3))
    .max(20, VALIDATION_MESSAGES.MAX_LENGTH(20))
    .regex(validationPatterns.username, 'Username hanya boleh huruf, angka, dan underscore')
    .refine((val) => !val || val.length >= 3, {
      message: VALIDATION_MESSAGES.MIN_LENGTH(3)
    }),

  // Strong password
  strongPassword: z
    .string()
    .min(8, VALIDATION_MESSAGES.MIN_LENGTH(8))
    .regex(validationPatterns.password, 'Password harus mengandung huruf besar, kecil, angka, dan simbol')
}

// Complex validation schemas
export const complexSchemas = {
  // Stock levels validation
  stockLevels: z.object({
    min_stock: z.number().min(0).optional(),
    current_stock: z.number().min(0),
  }).refine(validationFunctions.validStockLevels, {
    message: 'Stok minimum tidak boleh lebih besar dari stok saat ini',
    path: ['min_stock']
  }),

  // Order validation
  order: z.object({
    customer_name: z.string().min(1, 'Nama pelanggan wajib diisi'),
    customer_phone: z.string().min(1, 'Nomor telepon wajib diisi'),
    delivery_date: z.string().min(1, 'Tanggal pengiriman wajib diisi'),
    order_items: z.array(z.object({
      quantity: z.number().min(1, 'Quantity minimal 1'),
      unit_price: z.number().min(0, 'Harga tidak boleh negatif'),
    })).min(1, 'Minimal harus ada 1 item pesanan'),
  }),

  // Recipe validation
  recipe: z.object({
    name: z.string().min(1, 'Nama resep wajib diisi'),
    ingredients: z.array(z.object({
      ingredient_id: z.string().min(1, 'Bahan wajib dipilih'),
      quantity: z.number().min(0.01, 'Quantity minimal 0.01'),
      unit: z.string().min(1, 'Satuan wajib diisi'),
    })).min(1, 'Minimal harus ada 1 bahan'),
    instructions: z.array(z.string().min(1, 'Instruksi tidak boleh kosong')).min(1, 'Minimal harus ada 1 instruksi'),
  }),

  // Financial record validation
  financial: z.object({
    type: z.enum(['INCOME', 'EXPENSE']),
    amount: z.number().min(0.01, 'Jumlah minimal 0.01'),
    category: z.string().min(1, 'Kategori wajib diisi'),
    description: z.string().min(1, 'Deskripsi wajib diisi'),
    date: z.string().datetime(),
  }),

  // User profile validation
  userProfile: z.object({
    name: enhancedSchemas.indonesianName,
    email: enhancedSchemas.enhancedEmail,
    phone: enhancedSchemas.indonesianPhone,
    birth_date: enhancedSchemas.birthDate.optional(),
  }),

  // Company settings validation
  companySettings: z.object({
    name: z.string().min(1, 'Nama perusahaan wajib diisi'),
    address: z.string().min(1, 'Alamat wajib diisi'),
    phone: enhancedSchemas.indonesianPhone,
    email: enhancedSchemas.enhancedEmail,
    tax_id: z.string().optional().refine((val) => !val || validationPatterns.taxId.test(val), {
      message: 'Format NPWP tidak valid'
    }),
    business_hours: z.object({
      open: enhancedSchemas.businessTime,
      close: enhancedSchemas.businessTime,
    }).optional(),
  }),
}

// Validation helper functions
export const validationHelpers = {
  // Validate form data
  validateForm: <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: z.ZodError } => {
    try {
      const result = schema.parse(data)
      return { success: true, data: result }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return { success: false, errors: _error }
      }
      return { success: false, errors: new z.ZodError([]) }
    }
  },

  // Get validation errors as string array
  getValidationErrors: (errors: z.ZodError): string[] => errors.issues.map(error => {
      const path = error.path.join('.')
      return path ? `${path}: ${error.message}` : error.message
    }),

  // Get validation errors as object
  getValidationErrorsObject: (errors: z.ZodError): Record<string, string> => errors.issues.reduce((acc, error) => {
      const path = error.path.join('.')
      acc[path] = error.message
      return acc
    }, {} as Record<string, string>),

  // Validate single field
  validateField: <T>(schema: z.ZodSchema<T>, field: keyof T, value: unknown): string | null => {
    try {
      const fieldSchema = (schema as any)._def.shape?.[field]
      if (fieldSchema) {
        fieldSchema.parse(value)
        return null
      }
      return 'Field not found in schema'
    } catch (err) {
      if (err instanceof z.ZodError) {
        return err.issues[0]?.message || 'Validation failed'
      }
      return 'Validation failed'
    }
  },

  // Check if value is valid for schema
  isValid: <T>(schema: z.ZodSchema<T>, data: unknown): boolean => {
    try {
      schema.parse(data)
      return true
    } catch (error) {
      return false
    }
  }
}

// File validation utilities
export const fileValidators = {
  // Image validation
  image: (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const maxSize = 5 * 1024 * 1024 // 5MB

    return validationFunctions.fileType(file, allowedTypes) && validationFunctions.fileSize(file, maxSize)
  },

  // Document validation
  document: (file: File) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const maxSize = 10 * 1024 * 1024 // 10MB

    return validationFunctions.fileType(file, allowedTypes) && validationFunctions.fileSize(file, maxSize)
  },

  // Avatar validation
  avatar: (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 2 * 1024 * 1024 // 2MB

    return validationFunctions.fileType(file, allowedTypes) && validationFunctions.fileSize(file, maxSize)
  }
}

// Export validation utilities
export {
  validationPatterns as patterns,
  validationFunctions as validators,
  VALIDATION_MESSAGES
}
