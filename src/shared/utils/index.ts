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

// Additional utility functions will be implemented as needed
// export { validateEmail, validatePhone } from './validation'
// export { slugify, capitalize } from './string'
// export { groupBy, sortBy } from './array'
// export { pick, omit } from './object'
// export { addDays, subDays } from './date'
