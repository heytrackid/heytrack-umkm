/**
 * Custom hook for currency formatting using settings context
 */

import { useSettings } from '@/contexts/settings-context'
import type { Currency } from '@/shared'

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
  
  const formatPrice = (amount: number) => {
    return contextFormatCurrency(amount)
  }
  
  const formatAmount = (amount: number) => {
    return contextFormatCurrency(amount)
  }
  
  const getCurrencySymbol = () => {
    return settings.currency.symbol
  }
  
  const getCurrencyCode = () => {
    return settings.currency.code
  }
  
  const getCurrencyDecimals = () => {
    return settings.currency.decimals
  }
  
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