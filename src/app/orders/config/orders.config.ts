// Orders module configuration with multi-currency and optional VAT support

// Regional defaults for different countries
interface RegionalDefaults {
  country_code: string
  currency: string
  tax_rate: number
  business_culture: {
    typical_margins: { min: number, max: number }
    payment_terms_days: number
    common_payment_methods: string[]
  }
}

const REGIONAL_DEFAULTS: Record<string, RegionalDefaults> = {
  ID: { // Indonesia
    country_code: 'ID',
    currency: 'IDR',
    tax_rate: 0.11,
    business_culture: {
      typical_margins: { min: 20, max: 50 },
      payment_terms_days: 7,
      common_payment_methods: ['cash', 'bank_transfer', 'qris', 'ewallet']
    }
  }
}

export interface OrdersModuleConfig {
  // Pricing and currency
  currency: {
    default: string
    supported: string[]
    allow_multi_currency: boolean
    exchange_rates_source?: 'manual' | 'api' | 'fixed'
  }
  
  // Tax configuration (PPN/VAT optional)
  tax: {
    enabled: boolean
    default_rate: number // as decimal (0.11 for 11%)
    is_inclusive: boolean // whether prices include tax
    rates: Record<string, number> // different rates per region/product type
    exemptions: string[] // product categories that are tax-exempt
  }
  
  // Order workflow
  workflow: {
    statuses: OrderStatus[]
    default_status: OrderStatus
    auto_transitions: Record<string, string[]> // status -> allowed next statuses
    requires_confirmation: OrderStatus[]
    final_statuses: OrderStatus[]
  }
  
  // Payment terms
  payment: {
    default_terms_days: number
    methods: PaymentMethod[]
    require_advance_payment: boolean
    advance_payment_percentage: number
  }
  
  // Order limits and validation
  limits: {
    min_order_amount: number
    max_items_per_order: number
    allow_negative_stock: boolean
    require_customer_info: boolean
  }
  
  // Invoice and numbering
  invoice: {
    number_format: string // e.g.,"INV-{YYYY}-{MM}-{###}"
    auto_generate: boolean
    include_company_info: boolean
    show_hpp_details: boolean // whether to show cost breakdown
  }
  
  // Notifications and automation
  notifications: {
    notify_low_stock: boolean
    notify_order_status_change: boolean
    notify_payment_due: boolean
    auto_reminder_days: number[]
  }
  
  // Regional business settings
  regional: {
    country_code: string
    business_culture: {
      typical_margins: { min: number, max: number }
      payment_terms_days: number
      common_payment_methods: string[]
    }
  }
}

export type OrderStatus = 
  | 'draft'          // Order being prepared
  | 'confirmed'      // Customer confirmed the order
  | 'payment_pending' // Waiting for payment
  | 'paid'           // Payment received
  | 'in_production'  // Items being prepared
  | 'ready'          // Ready for delivery/pickup
  | 'delivered'      // Order completed
  | 'cancelled'      // Order cancelled
  | 'refunded'       // Order refunded

export type PaymentMethod = 
  | 'cash'
  | 'bank_transfer'
  | 'card'
  | 'qris'
  | 'ewallet'
  | 'check'
  | 'credit'

export type OrderPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'

// Default configuration
export const DEFAULT_ORDERS_CONFIG: OrdersModuleConfig = {
  currency: {
    default: 'IDR',
    supported: ['IDR', 'USD', 'EUR', 'SGD', 'MYR'],
    allow_multi_currency: true,
    exchange_rates_source: 'manual'
  },
  
  tax: {
    enabled: true, // Can be disabled for tax-exempt businesses
    default_rate: 0.11, // PPN 11% for Indonesia
    is_inclusive: false, // Tax calculated on top of base price
    rates: {
      'food_beverage': 0.11,
      'service': 0.11,
      'raw_materials': 0.11,
      'export': 0.0 // Export typically tax-free
    },
    exemptions: ['raw_ingredients', 'basic_necessities'] // Categories exempt from tax
  },
  
  workflow: {
    statuses: [
      'draft',
      'confirmed', 
      'payment_pending',
      'paid',
      'in_production',
      'ready',
      'delivered',
      'cancelled',
      'refunded'
    ],
    default_status: 'draft',
    auto_transitions: {
      'draft': ['confirmed', 'cancelled'],
      'confirmed': ['payment_pending', 'paid', 'cancelled'],
      'payment_pending': ['paid', 'cancelled'],
      'paid': ['in_production', 'cancelled'],
      'in_production': ['ready', 'cancelled'],
      'ready': ['delivered', 'cancelled'],
      'delivered': ['refunded'], // Only allow refund after delivery
      'cancelled': [], // Final status
      'refunded': []   // Final status
    },
    requires_confirmation: ['paid', 'delivered', 'cancelled', 'refunded'],
    final_statuses: ['delivered', 'cancelled', 'refunded']
  },
  
  payment: {
    default_terms_days: 7, // Indonesian F&B standard
    methods: ['cash', 'bank_transfer', 'qris', 'ewallet'],
    require_advance_payment: false,
    advance_payment_percentage: 50
  },
  
  limits: {
    min_order_amount: 10000, // Minimum Rp 10,000
    max_items_per_order: 100,
    allow_negative_stock: false, // Prevent overselling
    require_customer_info: true
  },
  
  invoice: {
    number_format: 'INV-{YYYY}{MM}-{###}',
    auto_generate: true,
    include_company_info: true,
    show_hpp_details: false // Hide cost details by default
  },
  
  notifications: {
    notify_low_stock: true,
    notify_order_status_change: true,
    notify_payment_due: true,
    auto_reminder_days: [3, 1] // Remind 3 days and 1 day before due date
  },
  
  regional: REGIONAL_DEFAULTS['ID']! // Default to Indonesia
}

// Status color mappings for UI
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  draft: 'gray',
  confirmed: 'blue',
  payment_pending: 'yellow',
  paid: 'green',
  in_production: 'purple',
  ready: 'orange',
  delivered: 'emerald',
  cancelled: 'red',
  refunded: 'pink'
}

// Status icons for UI
export const ORDER_STATUS_ICONS: Record<OrderStatus, string> = {
  draft: 'Edit3',
  confirmed: 'CheckCircle2',
  payment_pending: 'Clock',
  paid: 'DollarSign',
  in_production: 'ChefHat',
  ready: 'Package',
  delivered: 'Truck',
  cancelled: 'X',
  refunded: 'RotateCcw'
}

// Priority colors
export const ORDER_PRIORITY_COLORS: Record<OrderPriority, string> = {
  low: 'gray',
  normal: 'blue',
  high: 'orange',
  urgent: 'red'
}

// Payment method icons
export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, string> = {
  cash: 'Banknote',
  bank_transfer: 'CreditCard',
  card: 'CreditCard',
  qris: 'QrCode',
  ewallet: 'Smartphone',
  check: 'FileText',
  credit: 'Clock'
}

// Order totals calculation helpers
export interface OrderTotals {
  subtotal: number
  tax_amount: number
  discount_amount: number
  shipping_amount: number
  total: number
  currency: string
  tax_rate: number
  tax_inclusive: boolean
}

/**
 * Calculate order totals with proper tax handling
 */
export function calculateOrderTotals(
  subtotal: number,
  config: OrdersModuleConfig,
  options: {
    currency?: string
    tax_rate?: number
    discount_amount?: number
    shipping_amount?: number
    tax_exemptions?: string[]
    product_categories?: string[]
  } = {}
): OrderTotals {
  const {
    currency = config.currency.default,
    tax_rate = config.tax.default_rate,
    discount_amount = 0,
    shipping_amount = 0,
    tax_exemptions = config.tax.exemptions,
    product_categories = []
  } = options

  // Check if tax applies
  const isTaxExempt = product_categories.some(cat => tax_exemptions.includes(cat))
  const finalTaxRate = !config.tax.enabled || isTaxExempt ? 0 : tax_rate

  // Calculate tax
  let tax_amount = 0
  if (finalTaxRate > 0) {
    if (config.tax.is_inclusive) {
      // Tax is already included in subtotal, extract it
      tax_amount = subtotal * finalTaxRate / (1 + finalTaxRate)
    } else {
      // Tax is added on top of subtotal
      tax_amount = subtotal * finalTaxRate
    }
  }

  // Calculate final total
  const total = config.tax.is_inclusive
    ? subtotal - discount_amount + shipping_amount // Tax already included
    : subtotal + tax_amount - discount_amount + shipping_amount

  return {
    subtotal,
    tax_amount,
    discount_amount,
    shipping_amount,
    total,
    currency,
    tax_rate: finalTaxRate,
    tax_inclusive: config.tax.is_inclusive
  }
}

/**
 * Validate order configuration
 */
export function validateOrdersConfig(config: Partial<OrdersModuleConfig>): string[] {
  const errors: string[] = []
  
  if (config.tax?.default_rate && (config.tax.default_rate < 0 || config.tax.default_rate > 1)) {
    errors.push('Tax rate must be between 0 and 1 (as decimal)')
  }
  
  if (config.payment?.advance_payment_percentage && 
      (config.payment.advance_payment_percentage < 0 || config.payment.advance_payment_percentage > 100)) {
    errors.push('Advance payment percentage must be between 0 and 100')
  }
  
  if (config.limits?.min_order_amount && config.limits.min_order_amount < 0) {
    errors.push('Minimum order amount cannot be negative')
  }
  
  return errors
}

/**
 * Create region-specific configuration
 */
export function createRegionalOrdersConfig(countryCode: string): OrdersModuleConfig {
  const regional = REGIONAL_DEFAULTS[countryCode] || REGIONAL_DEFAULTS['ID']!
  
  return {
    ...DEFAULT_ORDERS_CONFIG,
    currency: {
      ...DEFAULT_ORDERS_CONFIG.currency,
      default: regional.currency
    },
    tax: {
      ...DEFAULT_ORDERS_CONFIG.tax,
      default_rate: regional.tax_rate
    },
    payment: {
      ...DEFAULT_ORDERS_CONFIG.payment,
      default_terms_days: regional.business_culture.payment_terms_days,
      methods: regional.business_culture.common_payment_methods as PaymentMethod[]
    },
    regional
  }
}

export default DEFAULT_ORDERS_CONFIG