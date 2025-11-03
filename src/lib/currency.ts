import { apiLogger } from '@/lib/logger'


/**
 * Currency utilities - Single source of truth
 * Works with settings context for dynamic currency support
 */

// Currency interface matching the settings context
export interface Currency {
  code: string
  symbol: string
  name: string
  decimals: number
}

// Extended currency config for advanced features
export interface CurrencyConfig extends Currency {
  thousandsSeparator: string
  decimalSeparator: string
  symbolPosition: 'before' | 'after'
  spaceAfterSymbol: boolean
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

export const DEFAULT_CURRENCY: Currency =
  currencies.find((currency) => currency.code === 'IDR') ?? currencies[0]

// Extended currency configurations
export const currencyConfigs: Record<string, CurrencyConfig> = {
  IDR: {
    code: 'IDR',
    symbol: 'Rp',
    name: 'Indonesian Rupiah',
    decimals: 0,
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolPosition: 'before',
    spaceAfterSymbol: true
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    spaceAfterSymbol: false
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimals: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolPosition: 'after',
    spaceAfterSymbol: true
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    spaceAfterSymbol: false
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    decimals: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    spaceAfterSymbol: false
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    spaceAfterSymbol: false
  },
  MYR: {
    code: 'MYR',
    symbol: 'RM',
    name: 'Malaysian Ringgit',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    spaceAfterSymbol: false
  },
  THB: {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    spaceAfterSymbol: false
  },
  VND: {
    code: 'VND',
    symbol: '₫',
    name: 'Vietnamese Dong',
    decimals: 0,
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolPosition: 'after',
    spaceAfterSymbol: true
  },
  PHP: {
    code: 'PHP',
    symbol: '₱',
    name: 'Philippine Peso',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    spaceAfterSymbol: false
  }
}

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
  if (typeof window === 'undefined') {
    return DEFAULT_CURRENCY
  }

  try {
    const savedSettings = window.localStorage.getItem('heytrack-settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings) as { currency?: Partial<Currency> }
      const savedCurrency = parsed?.currency
      if (savedCurrency && typeof savedCurrency.code === 'string') {
        const config = currencyConfigs[savedCurrency.code]
        if (config) {
          return config
        }
      }
    }
  } catch (_err: unknown) {
    apiLogger.error({ _err }, 'Error loading currency settings')
  }

  return DEFAULT_CURRENCY
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
  } catch (_err: unknown) {
    // Fallback to basic formatting
    return formatCurrency(amount, currency)
  }
}

/**
 * Remove currency symbol and convert to number
 */
export function parseCurrencyString(currencyString: string, currency: Currency): number {
  if (!currencyString) {return 0}
  
  // Get config for advanced parsing
  const config = currencyConfigs[currency.code]
  if (!config) {
    // Fallback to simple parsing
    const cleaned = currencyString
      .replace(currency.symbol, '')
      .replace(/[^\d.,]/g, '')
      .trim()
    const normalized = cleaned.replace(',', '.')
    const parsed = parseFloat(normalized)
    return isNaN(parsed) ? 0 : parsed
  }
  
  // Advanced parsing with config
  let cleaned = currencyString
    .replace(config.symbol, '')
    .replace(/\s/g, '')
    .trim()
  
  // Replace separators
  cleaned = cleaned
    .replace(new RegExp(`\\${config.thousandsSeparator}`, 'g'), '')
    .replace(new RegExp(`\\${config.decimalSeparator}`, 'g'), '.')
  
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Validate currency amount
 */
export function isValidCurrencyAmount(amount: number): boolean {
  return typeof amount === 'number' && !isNaN(amount) && isFinite(amount)
}

/**
 * Create currency formatter function
 */
export function createCurrencyFormatter(currency: Currency) {
  return (amount: number) => formatCurrency(amount, currency)
}

/**
 * Format currency for display in forms/inputs
 */
export function formatCurrencyInput(
  value: string,
  currencyCode = 'IDR'
): string {
  const config = currencyConfigs[currencyCode]
  if (!config) {return value}
  
  // Remove non-numeric characters except decimal separator
  const cleaned = value.replace(/[^\d]/g, '')
  
  if (cleaned === '') {return ''}
  
  const number = parseInt(cleaned) || 0
  
  // Format without decimals for currencies like IDR/JPY
  if (config.decimals === 0) {
    return number.toLocaleString('en-US').replace(/,/g, config.thousandsSeparator)
  }
  
  // Format with decimals for other currencies
  const formatted = (number / Math.pow(10, config.decimals)).toFixed(config.decimals)
  const [intPart, decPart] = formatted.split('.')
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandsSeparator)
  
  return decPart ? `${formattedInt}${config.decimalSeparator}${decPart}` : formattedInt
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  return currencyConfigs[currencyCode]?.symbol || currencies[0].symbol
}

/**
 * Get currency name
 */
export function getCurrencyName(currencyCode: string): string {
  return currencyConfigs[currencyCode]?.name || currencies[0].name
}

/**
 * Check if currency is supported
 */
export function isSupportedCurrency(currencyCode: string): boolean {
  return currencyCode in currencyConfigs
}

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies(): Currency[] {
  return currencies
}

/**
 * Convert between currencies (requires exchange rate)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) {return amount}
  return amount * exchangeRate
}