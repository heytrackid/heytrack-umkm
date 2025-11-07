import { cn } from '@/lib/utils'


/**
 * Consolidated Shared Module
 * Single source for all shared utilities, components, hooks, and common functionality
 */


// ==========================================================
// SHARED UTILITIES
// ==========================================================

export { cn }

// Currency utilities
export {
  formatCurrency,
  formatCurrencyInput,
  formatCurrentCurrency,
  getCurrencyName,
  getCurrencySymbol,
  getCurrentCurrency,
  getSupportedCurrencies,
  isValidCurrencyAmount,
  parseCurrencyString
} from '@/lib/currency'

export type { Currency } from '@/lib/currency'

// Date utilities
export const formatDate = (date: Date | string): string => new Intl.DateTimeFormat('id-ID').format(new Date(date))

export const formatDateTime = (date: Date | string): string => new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))

export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {return 'Hari ini'}
  if (diffDays === 1) {return 'Kemarin'}
  if (diffDays < 7) {return `${diffDays} hari yang lalu`}
  if (diffDays < 30) {return `${Math.floor(diffDays / 7)} minggu yang lalu`}
  if (diffDays < 365) {return `${Math.floor(diffDays / 30)} bulan yang lalu`}
  return `${Math.floor(diffDays / 365)} tahun yang lalu`
}

// Debounce utilities
export { debounce } from '@/lib/debounce'

// ==========================================================
// TYPE GUARD UTILITIES
// ==========================================================

// Primitive type guards
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function isNull(value: unknown): value is null {
  return value === null
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined
}

export function isNullish(value: unknown): value is null | undefined {
  return value === null
}

export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value)
}

export function isObject<T extends Record<string, unknown>>(value: unknown): value is T {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isFunction<T extends (...args: unknown[]) => unknown>(value: unknown): value is T {
  return typeof value === 'function'
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime())
}

// Business type guards
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[8-9][0-9]{7,11}$/
  return phoneRegex.test(phone.replace(/\s|-/g, ''))
}

export function isValidCurrency(amount: number): boolean {
  return typeof amount === 'number' && amount >= 0 && isFinite(amount)
}

export function isValidPercentage(value: number): boolean {
  return typeof value === 'number' && value >= 0 && value <= 100
}

// Error type guards
export function isError(value: unknown): value is Error {
  return value instanceof Error
}

export function isApiError(value: unknown): boolean {
  return isObject(value) && 'success' in value && value['success'] === false
}

export function isValidationError(value: unknown): boolean {
  return isObject(value) && 'errors' in value && Array.isArray(value['errors'])
}

// Get error message safely
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message
  }
  if (isString(error)) {
    return error
  }
  if (isObject(error) && 'message' in error && isString(error['message'])) {
    return error['message']
  }
  return 'An unexpected error occurred'
}

// Array/Object utilities
export const groupBy = <T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> => array.reduce((groups, item) => {
    const groupKey = String(item[key])
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, T[]>)

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (aVal < bVal) {return direction === 'asc' ? -1 : 1}
    if (aVal > bVal) {return direction === 'asc' ? 1 : -1}
    return 0
  })

export const unique = <T>(array: T[]): T[] => [...new Set(array)]

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) {return false}
    seen.add(value)
    return true
  })
}

// String utilities
export const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

export const slugify = (str: string): string => str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const truncate = (str: string, length: number, suffix = '...'): string => str.length <= length ? str : str.slice(0, length - suffix.length) + suffix

export const formatNumber = (num: number, locale = 'id-ID'): string => new Intl.NumberFormat(locale).format(num)

// Validation utilities
export const isEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+62|62|0)[8-9][0-9]{7,11}$/
  return phoneRegex.test(phone.replace(/\s|-/g, ''))
}

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('62')) {
    return `+${cleaned}`
  }
  if (cleaned.startsWith('0')) {
    return `+62${cleaned.slice(1)}`
  }
  return cleaned
}

// ==========================================================
// BUSINESS UTILITIES
// ==========================================================

export const formatProductName = (name: string, category?: string): string => {
  const formatted = capitalize(name)
  return category ? `${formatted} (${category})` : formatted
}

export const formatOrderStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Menunggu',
    confirmed: 'Dikonfirmasi',
    in_progress: 'Sedang Diproses',
    ready: 'Siap Diambil',
    delivered: 'Sudah Dikirim',
    cancelled: 'Dibatalkan'
  }
  return statusMap[status] || capitalize(status)
}

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-orange-100 text-orange-800',
    ready: 'bg-green-100 text-green-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800'
}

export const calculatePercentage = (value: number, total: number): number => total === 0 ? 0 : Math.round((value / total) * 100)

export const calculateTrend = (current: number, previous: number): { value: number; isPositive: boolean } => {
  if (previous === 0) {return { value: 0, isPositive: true }}
  const change = ((current - previous) / previous) * 100
  return { value: Math.abs(change), isPositive: change >= 0 }
}

// ==========================================================
// CONSTANTS
// ==========================================================

export const BUSINESS_TYPES = {
  FOOD: 'food',
  RETAIL: 'retail',
  SERVICE: 'service'
} as const

export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const

export const PAYMENT_METHODS = {
  CASH: 'cash',
  TRANSFER: 'transfer',
  DIGITAL_WALLET: 'digital_wallet',
  CARD: 'card'
} as const

export const CATEGORIES = {
  FOOD: 'Makanan',
  BEVERAGE: 'Minuman',
  SNACK: 'Cemilan',
  DESSERT: 'Dessert',
  OTHER: 'Lainnya'
} as const

export const UNITS = {
  PCS: 'pcs',
  KG: 'kg',
  LITER: 'liter',
  PACK: 'pack',
  BOX: 'box',
  BOTTLE: 'botol'
} as const

// ==========================================================
// TYPE DEFINITIONS
// ==========================================================

export type BusinessType = typeof BUSINESS_TYPES[keyof typeof BUSINESS_TYPES]
export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES]
export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS]
export type Category = typeof CATEGORIES[keyof typeof CATEGORIES]
export type Unit = typeof UNITS[keyof typeof UNITS]

export interface BusinessEntity {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface Address {
  street: string
  city: string
  province: string
  postal_code: string
  country: string
}
export interface Contact {
  phone: string
  email?: string
  whatsapp?: string
}
