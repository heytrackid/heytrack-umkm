import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Deprecated: Use formatCurrentCurrency from @/lib/currency or useCurrency hook instead
export function formatCurrency(amount: number): string {
  // Import dynamically to avoid circular dependencies
  const { formatCurrentCurrency } = require('@/lib/currency')
  return formatCurrentCurrency(amount)
}
