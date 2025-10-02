/**
 * Custom hook for currency formatting using settings context
 */

import { useSettings } from '@/contexts/settings-context'
import { formatCurrency } from '@/lib/currency'

export function useCurrency() {
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