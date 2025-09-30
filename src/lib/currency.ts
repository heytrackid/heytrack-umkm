/**
 * Currency utilities that work with the settings context
 * Replaces all hardcoded currency formatting
 */

// Currency interface matching the settings context
export interface Currency {
  code: string
  symbol: string
  name: string
  decimals: number
}

// Default currencies for fallback
export const currencies: Currency[] = [
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0 },
  { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimals: 2 },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2 },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', decimals: 2 },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', decimals: 0 },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', decimals: 2 }
]

/**
 * Format currency based on provided currency settings
 */
export function formatCurrency(amount: number, currency: Currency): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return `${currency.symbol} 0`
  }
  
  const { symbol, decimals } = currency
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
  return `${symbol} ${formattedAmount}`
}

/**
 * Get currency from localStorage or default to IDR
 */
export function getCurrentCurrency(): Currency {
  try {
    const savedSettings = localStorage.getItem('heytrack-settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      return parsed.currency || currencies[0]
    }
  } catch (error) {
    console.error('Error loading currency settings:', error)
  }
  return currencies[0] // Default to IDR
}

/**
 * Format currency using current settings (for non-React contexts)
 */
export function formatCurrentCurrency(amount: number): string {
  const currency = getCurrentCurrency()
  return formatCurrency(amount, currency)
}

/**
 * Get locale string for currency formatting based on currency code
 */
export function getCurrencyLocale(currencyCode: string): string {
  const localeMap: { [key: string]: string } = {
    'IDR': 'id-ID',
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB',
    'JPY': 'ja-JP',
    'SGD': 'en-SG',
    'MYR': 'ms-MY',
    'THB': 'th-TH',
    'VND': 'vi-VN',
    'PHP': 'en-PH'
  }
  return localeMap[currencyCode] || 'en-US'
}

/**
 * Format currency with native Intl.NumberFormat (alternative approach)
 */
export function formatCurrencyIntl(amount: number, currency: Currency): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return `${currency.symbol} 0`
  }
  
  const locale = getCurrencyLocale(currency.code)
  
  try {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals
    }).format(amount)
    
    return `${currency.symbol} ${formatted}`
  } catch (error) {
    // Fallback to basic formatting
    return formatCurrency(amount, currency)
  }
}

/**
 * Remove currency symbol and convert to number
 */
export function parseCurrencyString(currencyString: string, currency: Currency): number {
  if (!currencyString) return 0
  
  // Remove currency symbol and any non-numeric characters except decimal point
  const cleaned = currencyString
    .replace(currency.symbol, '')
    .replace(/[^\d.,]/g, '')
    .trim()
  
  // Handle different decimal separators
  const normalized = cleaned.replace(',', '.')
  const parsed = parseFloat(normalized)
  
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Validate currency amount
 */
export function isValidCurrencyAmount(amount: number): boolean {
  return typeof amount === 'number' && !isNaN(amount) && isFinite(amount)
}

/**
 * React hook-like function to get currency formatter
 * Note: This should be used in React components with useSettings hook
 */
export function createCurrencyFormatter(currency: Currency) {
  return (amount: number) => formatCurrency(amount, currency)
}