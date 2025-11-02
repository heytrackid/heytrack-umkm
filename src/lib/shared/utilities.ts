

// Shared utilities for formatting, calculations, and common operations

/**
 * Currency formatting utilities
 */
export function formatCurrency(
  amount: number | string,
  currency = 'IDR',
  locale = 'id-ID'
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numAmount)) {return 'Rp 0'}

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount)
}

export function formatNumber(
  num: number,
  options: {
    decimals?: number
    locale?: string
    compact?: boolean
  } = {}
): string {
  const { decimals = 0, locale = 'id-ID', compact = false } = options

  if (compact) {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: decimals,
    }).format(num)
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Date and time utilities
 */
export function formatDate(
  date: string | Date | number,
  options: {
    locale?: string
    format?: 'short' | 'medium' | 'long' | 'full'
    includeTime?: boolean
  } = {}
): string {
  const { locale = 'id-ID', format = 'medium', includeTime = false } = options

  const dateObj = new Date(date)

  if (includeTime) {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: format,
      timeStyle: 'short',
    }).format(dateObj)
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: format,
  }).format(dateObj)
}

export function formatTime(
  date: string | Date | number,
  locale = 'id-ID'
): string {
  const dateObj = new Date(date)
  return new Intl.DateTimeFormat(locale, {
    timeStyle: 'short',
  }).format(dateObj)
}

export function formatRelativeTime(
  date: string | Date | number,
  locale = 'id-ID'
): string {
  const dateObj = new Date(date)
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (diffInMinutes < 1) {return 'Baru saja'}
  if (diffInMinutes < 60) {return rtf.format(-diffInMinutes, 'minute')}
  if (diffInHours < 24) {return rtf.format(-diffInHours, 'hour')}
  if (diffInDays < 7) {return rtf.format(-diffInDays, 'day')}
  if (diffInDays < 30) {return rtf.format(-Math.floor(diffInDays / 7), 'week')}

  return formatDate(dateObj, { locale, format: 'medium' })
}

/**
 * Status and badge utilities
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Order statuses
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-orange-100 text-orange-800',
    READY: 'bg-green-100 text-green-800',
    DELIVERED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',

    // Payment statuses
    UNPAID: 'bg-red-100 text-red-800',
    PAID: 'bg-green-100 text-green-800',
    PARTIAL: 'bg-yellow-100 text-yellow-800',
    REFUNDED: 'bg-gray-100 text-gray-800',

    // Inventory statuses
    IN_STOCK: 'bg-green-100 text-green-800',
    LOW_STOCK: 'bg-yellow-100 text-yellow-800',
    OUT_OF_STOCK: 'bg-red-100 text-red-800',
    OVER_STOCK: 'bg-blue-100 text-blue-800',

    // Generic statuses
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    DRAFT: 'bg-gray-100 text-gray-800',
    PUBLISHED: 'bg-green-100 text-green-800',
  }

  return statusColors[status] || 'bg-gray-100 text-gray-800'
}

export function getStatusText(status: string): string {
  const statusTexts: Record<string, string> = {
    PENDING: 'Menunggu',
    CONFIRMED: 'Dikonfirmasi',
    IN_PROGRESS: 'Sedang Diproses',
    READY: 'Siap Antar',
    DELIVERED: 'Sudah Diantar',
    CANCELLED: 'Dibatalkan',

    UNPAID: 'Belum Dibayar',
    PAID: 'Sudah Dibayar',
    PARTIAL: 'Dibayar Sebagian',
    REFUNDED: 'Dikembalikan',

    IN_STOCK: 'Tersedia',
    LOW_STOCK: 'Stok Rendah',
    OUT_OF_STOCK: 'Habis',
    OVER_STOCK: 'Stok Berlebih',

    ACTIVE: 'Aktif',
    INACTIVE: 'Tidak Aktif',
    DRAFT: 'Draft',
    PUBLISHED: 'Dipublikasikan',
  }

  return statusTexts[status] || status
}

/**
 * Calculation utilities
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) {return 0}
  return Math.round((part / total) * 100)
}

export function calculateMargin(sellingPrice: number, costPrice: number): number {
  if (sellingPrice === 0) {return 0}
  return ((sellingPrice - costPrice) / sellingPrice) * 100
}

export function calculateProfit(sellingPrice: number, costPrice: number): number {
  return sellingPrice - costPrice
}

/**
 * String utilities
 */
export function capitalizeFirst(str: string): string {
  if (!str) {return str}
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {return text}
  return `${text.slice(0, maxLength)  }...`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Validation utilities
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[8-9][0-9]{7,11}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Array and object utilities
 */
export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {} as Record<K, T[]>)
}

export function sortBy<T>(
  array: T[],
  keyFn: (item: T) => any,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a)
    const bVal = keyFn(b)

    if (aVal < bVal) {return direction === 'asc' ? -1 : 1}
    if (aVal > bVal) {return direction === 'asc' ? 1 : -1}
    return 0
  })
}

/**
 * Debounce utility for search inputs
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {clearTimeout(timeout)}
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Local storage utilities with error handling
 */
export function safeLocalStorage() {
  const isAvailable = typeof window !== 'undefined' && !!window.localStorage

  return {
    get: <T>(key: string, defaultValue: T | null = null): T | null => {
      if (!isAvailable) {return defaultValue}
      try {
        const item = window.localStorage.getItem(key)
        return item ? JSON.parse(item) as T : defaultValue
      } catch {
        return defaultValue
      }
    },

    set: <T>(key: string, value: T): boolean => {
      if (!isAvailable) {return false}
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
        return true
      } catch {
        return false
      }
    },

    remove: (key: string): boolean => {
      if (!isAvailable) {return false}
      try {
        window.localStorage.removeItem(key)
        return true
      } catch {
        return false
      }
    },

    clear: (): boolean => {
      if (!isAvailable) {return false}
      try {
        window.localStorage.clear()
        return true
      } catch {
        return false
      }
    }
  }
}

/**
 * File utilities
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {return '0 B'}

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))  } ${  sizes[i]}`
}

export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase()
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
  return imageExtensions.includes(getFileExtension(filename))
}