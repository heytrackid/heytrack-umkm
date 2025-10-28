/**
 * Shared Date and Time Utilities
 * Consistent date formatting and manipulation across the application
 */

// Date formatting utilities
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID').format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function formatRelativeTime(date: Date | string): string {
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

// Additional date utilities
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start.toDateString() === end.toDateString()) {
    return formatDate(start)
  }

  return `${formatDate(start)} - ${formatDate(end)}`
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(date))
}

export function formatDateTimeShort(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Date calculation utilities
export function addDays(date: Date | string, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function addMonths(date: Date | string, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export function addYears(date: Date | string, years: number): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

export function startOfDay(date: Date | string): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

export function endOfDay(date: Date | string): Date {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

export function startOfMonth(date: Date | string): Date {
  const result = new Date(date)
  result.setDate(1)
  result.setHours(0, 0, 0, 0)
  return result
}

export function endOfMonth(date: Date | string): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + 1, 0)
  result.setHours(23, 59, 59, 999)
  return result
}

export function isToday(date: Date | string): boolean {
  const today = new Date()
  const checkDate = new Date(date)
  return today.toDateString() === checkDate.toDateString()
}

export function isYesterday(date: Date | string): boolean {
  const yesterday = addDays(new Date(), -1)
  const checkDate = new Date(date)
  return yesterday.toDateString() === checkDate.toDateString()
}

export function isThisWeek(date: Date | string): boolean {
  const now = new Date()
  const checkDate = new Date(date)
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  return checkDate >= startOfWeek && checkDate <= endOfWeek
}

export function isThisMonth(date: Date | string): boolean {
  const now = new Date()
  const checkDate = new Date(date)
  return now.getMonth() === checkDate.getMonth() && now.getFullYear() === checkDate.getFullYear()
}

// Business date utilities
export function getBusinessDays(startDate: Date, endDate: Date): number {
  let businessDays = 0
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Saturday or Sunday
      businessDays++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return businessDays
}

export function addBusinessDays(date: Date, businessDays: number): Date {
  const result = new Date(date)
  let added = 0

  while (added < businessDays) {
    result.setDate(result.getDate() + 1)
    const dayOfWeek = result.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Saturday or Sunday
      added++
    }
  }

  return result
}

// Date validation utilities
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime())
}

export function parseDate(dateString: string): Date | null {
  if (!dateString) {return null}
  const date = new Date(dateString)
  return isValidDate(date) ? date : null
}

export function formatDateForAPI(date: Date | string): string {
  return new Date(date).toISOString().split('T')[0] // YYYY-MM-DD format
}

export function formatDateTimeForAPI(date: Date | string): string {
  return new Date(date).toISOString() // ISO format
}

// Relative time utilities with Indonesian labels
export const RELATIVE_TIME_LABELS = {
  now: 'Baru saja',
  seconds: 'detik yang lalu',
  minutes: 'menit yang lalu',
  hours: 'jam yang lalu',
  days: 'hari yang lalu',
  weeks: 'minggu yang lalu',
  months: 'bulan yang lalu',
  years: 'tahun yang lalu'
} as const

export function formatRelativeTimeIndonesian(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSeconds < 10) {return RELATIVE_TIME_LABELS.now}
  if (diffSeconds < 60) {return `${diffSeconds} ${RELATIVE_TIME_LABELS.seconds}`}
  if (diffMinutes < 60) {return `${diffMinutes} ${RELATIVE_TIME_LABELS.minutes}`}
  if (diffHours < 24) {return `${diffHours} ${RELATIVE_TIME_LABELS.hours}`}
  if (diffDays < 7) {return `${diffDays} ${RELATIVE_TIME_LABELS.days}`}
  if (diffWeeks < 4) {return `${diffWeeks} ${RELATIVE_TIME_LABELS.weeks}`}
  if (diffMonths < 12) {return `${diffMonths} ${RELATIVE_TIME_LABELS.months}`}
  return `${diffYears} ${RELATIVE_TIME_LABELS.years}`
}

// Date range utilities
export interface DateRange {
  start: Date
  end: Date
}

export function createDateRange(
  start: Date | string,
  end: Date | string
): DateRange {
  return {
    start: new Date(start),
    end: new Date(end)
  }
}

export function getDateRangeForPeriod(
  period: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear'
): DateRange {
  const now = new Date()
  let start: Date
  let end: Date

  switch (period) {
    case 'today':
      start = startOfDay(now)
      end = endOfDay(now)
      break
    case 'yesterday':
      const yesterday = addDays(now, -1)
      start = startOfDay(yesterday)
      end = endOfDay(yesterday)
      break
    case 'thisWeek':
      start = new Date(now.setDate(now.getDate() - now.getDay()))
      start.setHours(0, 0, 0, 0)
      end = new Date(start)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break
    case 'lastWeek':
      const lastWeekStart = new Date(now.setDate(now.getDate() - now.getDay() - 7))
      start = new Date(lastWeekStart)
      start.setHours(0, 0, 0, 0)
      end = new Date(lastWeekStart)
      end.setDate(lastWeekStart.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break
    case 'thisMonth':
      start = startOfMonth(now)
      end = endOfMonth(now)
      break
    case 'lastMonth':
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
      start = startOfMonth(lastMonth)
      end = endOfMonth(lastMonth)
      break
    case 'thisYear':
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      break
    case 'lastYear':
      start = new Date(now.getFullYear() - 1, 0, 1)
      end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
      break
    default:
      throw new Error(`Unknown period: ${period}`)
  }

  return { start, end }
}
