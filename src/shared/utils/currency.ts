/**
 * Multi-currency support utilities
 * Re-exported from @/lib/currency for consistency
 */

export {
    currencies as SUPPORTED_CURRENCIES, 
    currencyConfigs as REGIONAL_DEFAULTS,
    createCurrencyFormatter, 
    formatCurrency,
    formatCurrentCurrency, 
    getCurrencyLocale, 
    getCurrentCurrency, 
    isValidCurrencyAmount, 
    parseCurrencyString,
    parseCurrencyString as parseCurrency
} from '@/lib/currency'

export type { Currency as CurrencyConfig, Currency as DEFAULT_CURRENCY } from '@/lib/currency'

// All currency utilities are now re-exported from @/lib/currency
// This file maintains backward compatibility