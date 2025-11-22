// lib/sanitization/index.ts
// Field-level input sanitization utilities

import DOMPurify from 'dompurify'

/**
 * Sanitize string inputs - remove potentially harmful characters
 */
export function sanitizeString(input: unknown): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input
    .trim()
    // Remove null bytes and other control characters
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    // Remove potentially dangerous Unicode characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Limit length to prevent abuse
    .substring(0, 10000)
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(input: unknown): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input
    .trim()
    .toLowerCase()
    // Remove any whitespace within the email
    .replace(/\s+/g, '')
    // Basic email validation and sanitization
    .replace(/[<>'"&]/g, '')
    .substring(0, 254) // RFC 5321 limit
}

/**
 * Sanitize HTML content for rich text fields
 */
export function sanitizeHtml(input: unknown): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Use DOMPurify for HTML sanitization
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr',
      'a', 'img'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class'
    ],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover']
  })
}

/**
 * Sanitize numeric inputs
 */
export function sanitizeNumber(input: unknown): number | null {
  if (input === null || input === undefined || input === '') {
    return null
  }

  if (typeof input !== 'string' && typeof input !== 'number') {
    return null
  }

  const num = typeof input === 'string' ? parseFloat(input) : input

  if (isNaN(num as number) || !isFinite(num as number)) {
    return null
  }

  // Prevent extreme values that could cause issues
  return Math.max(-999999999, Math.min(999999999, num as number))
}

/**
 * Sanitize phone numbers
 */
export function sanitizePhone(input: unknown): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input
    .trim()
    // Remove all non-digit characters except + and spaces
    .replace(/[^\d+\s-()]/g, '')
    // Remove excessive spaces
    .replace(/\s+/g, ' ')
    .substring(0, 20)
}

/**
 * Sanitize URLs
 */
export function sanitizeUrl(input: unknown): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  try {
    const url = new URL(input)

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return ''
    }

    // Remove potentially dangerous characters
    return url.href.replace(/[<>'"&]/g, '')
  } catch {
    // Invalid URL
    return ''
  }
}

/**
 * Sanitize file names
 */
export function sanitizeFileName(input: unknown): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input
    .trim()
    // Remove path traversal attempts
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    // Remove potentially dangerous characters
    .replace(/[<>'"&|?*]/g, '')
    // Remove control characters
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    .substring(0, 255)
}

/**
 * Sanitize SQL-like inputs (additional protection)
 */
export function sanitizeSQLInput(input: unknown): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input
    .trim()
    // Remove SQL comment markers
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    // Remove semicolons that could end statements
    .replace(/;/g, '')
    .substring(0, 1000)
}

/**
 * Apply sanitization to an object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  sanitizers: Partial<Record<keyof T, (value: unknown) => unknown>>
): T {
  const sanitized = { ...obj }

  for (const [key, sanitizer] of Object.entries(sanitizers)) {
    if (key in sanitized && sanitizer) {
      sanitized[key as keyof T] = sanitizer(sanitized[key]) as T[keyof T]
    }
  }

  return sanitized
}

/**
 * Common sanitization presets for different data types
 */
export const SanitizationPresets = {
  // For user profile data
  userProfile: {
    name: sanitizeString,
    email: sanitizeEmail,
    phone: sanitizePhone,
    address: sanitizeString,
    notes: sanitizeString,
  },

  // For product/recipe data
  product: {
    name: sanitizeString,
    description: sanitizeHtml,
    notes: sanitizeString,
  },

  // For order data
  order: {
    customer_name: sanitizeString,
    customer_email: sanitizeEmail,
    customer_phone: sanitizePhone,
    notes: sanitizeString,
    delivery_address: sanitizeString,
  },

  // For ingredient data
  ingredient: {
    name: sanitizeString,
    description: sanitizeString,
    unit: sanitizeString,
    notes: sanitizeString,
  },

  // For supplier data
  supplier: {
    name: sanitizeString,
    email: sanitizeEmail,
    phone: sanitizePhone,
    address: sanitizeString,
    contact_person: sanitizeString,
    notes: sanitizeString,
  },

  // For financial data
  financial: {
    description: sanitizeString,
    notes: sanitizeString,
    category: sanitizeString,
  },
} as const