// Multi-currency support utilities
export interface CurrencyConfig {
  code: string
  symbol: string
  name: string
  decimals: number
  thousandsSeparator: string
  decimalSeparator: string
  symbolPosition: 'before' | 'after'
  spaceAfterSymbol: boolean
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  IDR: {
    code: 'IDR',
    symbol: 'Rp',
    name: 'Indonesian Rupiah',
    decimals: 0, // Rupiah typically doesn't use decimals
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
    thousandsSeparator: ',',
    decimalSeparator: '.',
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
  }
}

// Default currency (can be overridden by user settings)
export const DEFAULT_CURRENCY = 'IDR'

/**
 * Get current currency from user settings
 */
function getCurrentCurrency(): string {
  try {
    const savedSettings = localStorage.getItem('heytrack-settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      return parsed.currency?.code || DEFAULT_CURRENCY
    }
  } catch (error) {
    console.error('Error loading currency settings:', error)
  }
  return DEFAULT_CURRENCY
}

/**
 * Format amount according to currency configuration
 */
export function formatCurrency(
  amount: number, 
  currencyCode?: string,
  options: {
    showSymbol?: boolean
    showCode?: boolean
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = {}
): string {
  const actualCurrencyCode = currencyCode || getCurrentCurrency()
  const currency = SUPPORTED_CURRENCIES[actualCurrencyCode] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY]
  const {
    showSymbol = true,
    showCode = false,
    minimumFractionDigits,
    maximumFractionDigits
  } = options

  // Handle decimals
  const decimals = minimumFractionDigits !== undefined 
    ? minimumFractionDigits 
    : currency.decimals
  const maxDecimals = maximumFractionDigits !== undefined
    ? maximumFractionDigits
    : currency.decimals

  // Format the number
  let formattedAmount = amount.toFixed(decimals)
  
  // Split into integer and decimal parts
  const [integerPart, decimalPart] = formattedAmount.split('.')
  
  // Add thousands separators
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator)
  
  // Combine parts
  const finalAmount = decimalPart && parseFloat(`0.${decimalPart}`) > 0
    ? `${formattedInteger}${currency.decimalSeparator}${decimalPart}`
    : formattedInteger

  // Add symbol and/or code
  let result = finalAmount
  
  if (showSymbol) {
    const space = currency.spaceAfterSymbol ? ' ' : ''
    if (currency.symbolPosition === 'before') {
      result = `${currency.symbol}${space}${result}`
    } else {
      result = `${result}${space}${currency.symbol}`
    }
  }
  
  if (showCode) {
    result += ` ${currency.code}`
  }

  return result
}

/**
 * Parse currency string back to number
 */
export function parseCurrency(
  currencyString: string,
  currencyCode: string = DEFAULT_CURRENCY
): number {
  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY]
  
  // Remove symbols and currency codes
  let cleanString = currencyString
    .replace(new RegExp(`\\${currency.symbol}`, 'g'), '')
    .replace(new RegExp(currency.code, 'g'), '')
    .trim()
  
  // Replace separators
  cleanString = cleanString
    .replace(new RegExp(`\\${currency.thousandsSeparator}`, 'g'), '')
    .replace(new RegExp(`\\${currency.decimalSeparator}`, 'g'), '.')
  
  return parseFloat(cleanStr) || 0
}

/**
 * Convert between currencies (requires exchange rates)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) return amount
  return amount * exchangeRate
}

/**
 * Get currency symbol only
 */
export function getCurrencySymbol(currencyCode: string): string {
  return SUPPORTED_CURRENCIES[currencyCode]?.symbol || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY].symbol
}

/**
 * Get currency name
 */
export function getCurrencyName(currencyCode: string): string {
  return SUPPORTED_CURRENCIES[currencyCode]?.name || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY].name
}

/**
 * Validate if currency is supported
 */
export function isSupportedCurrency(currencyCode: string): boolean {
  return currencyCode in SUPPORTED_CURRENCIES
}

/**
 * Get list of all supported currencies
 */
export function getSupportedCurrencies(): CurrencyConfig[] {
  return Object.values(SUPPORTED_CURRENCIES)
}

/**
 * Format currency for display in forms/inputs
 */
export function formatCurrencyInput(
  value: string,
  currencyCode: string = DEFAULT_CURRENCY
): string {
  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY]
  
  // Remove non-numeric characters except decimal separator
  let cleaned = value.replace(/[^\d]/g, '')
  
  if (cleaned === '') return ''
  
  const number = parseInt(cleaned) || 0
  
  // Format without decimals for currencies like IDR/JPY
  if (currency.decimals === 0) {
    return number.toLocaleString('en-US').replace(/,/g, currency.thousandsSeparator)
  }
  
  // Format with decimals for other currencies
  const formatted = (number / Math.pow(10, currency.decimals)).toFixed(currency.decimals)
  const [intPart, decPart] = formatted.split('.')
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator)
  
  return decPart ? `${formattedInt}${currency.decimalSeparator}${decPart}` : formattedInt
}

/**
 * Regional currency configurations for common countries/regions
 */
export const REGIONAL_DEFAULTS: Record<string, {
  country_code: string
  currency: string
  tax_rate: number
  business_culture: {
    typical_margins: { min: number, max: number }
    payment_terms_days: number
    common_payment_methods: string[]
  }
}> = {
  'ID': { // Indonesia
    country_code: 'ID',
    currency: 'IDR',
    tax_rate: 0.11, // PPN 11%
    business_culture: {
      typical_margins: { min: 40, max: 80 },
      payment_terms_days: 7,
      common_payment_methods: ['cash', 'transfer', 'qris', 'ewallet']
    }
  },
  'US': { // United States
    country_code: 'US',
    currency: 'USD',
    tax_rate: 0.08, // Average sales tax
    business_culture: {
      typical_margins: { min: 50, max: 70 },
      payment_terms_days: 30,
      common_payment_methods: ['cash', 'card', 'transfer']
    }
  },
  'SG': { // Singapore
    country_code: 'SG',
    currency: 'SGD',
    tax_rate: 0.07, // GST 7%
    business_culture: {
      typical_margins: { min: 45, max: 75 },
      payment_terms_days: 14,
      common_payment_methods: ['cash', 'card', 'transfer', 'ewallet']
    }
  },
  'MY': { // Malaysia
    country_code: 'MY',
    currency: 'MYR',
    tax_rate: 0.06, // SST 6%
    business_culture: {
      typical_margins: { min: 40, max: 70 },
      payment_terms_days: 14,
      common_payment_methods: ['cash', 'card', 'transfer', 'ewallet']
    }
  }
}