/**
 * Multi-currency support utilities
 * Re-exported from @/lib/currency for consistency
 */

export {
    currencies as SUPPORTED_CURRENCIES, createCurrencyFormatter, formatCurrency,
    formatCurrentCurrency, getCurrencyLocale, getCurrentCurrency, isValidCurrencyAmount, parseCurrencyString
} from '@/lib/currency'

export type { Currency as CurrencyConfig } from '@/lib/currency'

// All currency utilities are now re-exported from @/lib/currency
// This file maintains backward compatibility