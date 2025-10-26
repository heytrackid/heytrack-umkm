/**
 * Regional currency and business settings
 * Defines country-specific defaults for currency, tax rates, and business culture
 */

import { DEFAULT_CURRENCY } from '@/lib/currency'

// Regional defaults for different countries
export interface RegionalDefaults {
  country_code: string
  currency: string
  tax_rate: number
  business_culture: {
    typical_margins: { min: number, max: number }
    payment_terms_days: number
    common_payment_methods: string[]
  }
}

export const REGIONAL_DEFAULTS: Record<string, RegionalDefaults> = {
  ID: { // Indonesia
    country_code: 'ID',
    currency: 'IDR',
    tax_rate: 0.11, // PPN 11%
    business_culture: {
      typical_margins: { min: 20, max: 50 }, // 20-50% margins
      payment_terms_days: 7, // 7 days payment terms
      common_payment_methods: ['cash', 'bank_transfer', 'qris', 'ewallet']
    }
  },
  SG: { // Singapore
    country_code: 'SG',
    currency: 'SGD',
    tax_rate: 0.08, // GST 8%
    business_culture: {
      typical_margins: { min: 15, max: 40 },
      payment_terms_days: 30, // 30 days payment terms
      common_payment_methods: ['bank_transfer', 'card', 'qris']
    }
  },
  MY: { // Malaysia
    country_code: 'MY',
    currency: 'MYR',
    tax_rate: 0.10, // SST 10%
    business_culture: {
      typical_margins: { min: 18, max: 45 },
      payment_terms_days: 14, // 14 days payment terms
      common_payment_methods: ['cash', 'bank_transfer', 'ewallet']
    }
  },
  US: { // United States
    country_code: 'US',
    currency: 'USD',
    tax_rate: 0.0, // No federal tax, varies by state
    business_culture: {
      typical_margins: { min: 25, max: 60 },
      payment_terms_days: 30, // 30 days payment terms
      common_payment_methods: ['card', 'bank_transfer', 'check']
    }
  },
  EU: { // European Union (generic)
    country_code: 'EU',
    currency: 'EUR',
    tax_rate: 0.20, // VAT varies, average ~20%
    business_culture: {
      typical_margins: { min: 20, max: 50 },
      payment_terms_days: 30, // 30 days payment terms
      common_payment_methods: ['bank_transfer', 'card', 'sepa']
    }
  }
}

// Re-export DEFAULT_CURRENCY for convenience
export { DEFAULT_CURRENCY }
