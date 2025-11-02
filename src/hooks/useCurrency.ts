import { useSettings } from '@/contexts/settings-context'
import type { Currency } from '@/shared'

/**
 * Custom hook for currency formatting using settings context
 */


interface UseCurrencyReturn {
  formatPrice: (amount: number) => string
  formatAmount: (amount: number) => string
  formatCurrency: (amount: number) => string
  getCurrencySymbol: () => string
  getCurrencyCode: () => string
  getCurrencyDecimals: () => number
  currency: Currency
}

export function useCurrency(): UseCurrencyReturn {
  const { settings, formatCurrency: contextFormatCurrency } = useSettings()
  
  const formatPrice = (amount: number) => contextFormatCurrency(amount)
  
  const formatAmount = (amount: number) => contextFormatCurrency(amount)
  
  const getCurrencySymbol = () => settings.currency.symbol
  
  const getCurrencyCode = () => settings.currency.code
  
  const getCurrencyDecimals = () => settings.currency.decimals
  
  return {
    formatPrice,
    formatAmount,
    formatCurrency: contextFormatCurrency,
    getCurrencySymbol,
    getCurrencyCode,
    getCurrencyDecimals,
    currency: settings.currency
  }
}