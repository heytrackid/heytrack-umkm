/**
 * Shared Utilities Module
 * Common utility functions digunakan across domains
 */

// Core utilities
export { cn } from './cn'

// Format Utilities - implemented inline for now
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount)
}

export const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat('id-ID').format(new Date(date))
}

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(num)
}

// Utility functions
export const debounce = <T extends (...args: any[]) => any>(
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

// Additional utility functions will be implemented as needed
// export { validateEmail, validatePhone } from './validation'
// export { slugify, capitalize } from './string'
// export { pick, omit } from './object'
// export { addDays, subDays } from './date'
