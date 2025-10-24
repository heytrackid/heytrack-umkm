/**
 * Shared Utilities Module
 * Re-exports from @/lib/utils for consistency
 */

// Core utilities - re-export from lib/utils
export { cn } from '@/lib/utils'

// Currency utilities - re-export from lib/currency
export {
    formatCurrency, formatCurrencyInput, formatCurrentCurrency, getCurrencyName, getCurrencySymbol, getCurrentCurrency, getSupportedCurrencies, isValidCurrencyAmount, parseCurrencyString
} from '@/lib/currency'

export type { Currency } from '@/lib/currency'

// Format Utilities
export const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat('id-ID').format(new Date(date))
}

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(num)
}

// Utility functions
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }
}

export const groupBy = <T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key])
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

// String utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Array utilities
export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array))
}

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}
