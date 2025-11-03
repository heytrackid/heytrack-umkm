import type { PaymentStatus, PaymentMethod, DeliveryMethod } from './types'
import type { OrderStatus } from '@/types/database'
import { formatCurrentCurrency } from '@/lib/currency'



// Order Configuration Constants
export const ORDER_CONFIG = {
  // Order numbering
  ORDER_NO_PREFIX: 'ORD',
  ORDER_NO_LENGTH: 8, // ORD00001234
  
  // Default values
  DEFAULT_TAX_RATE: 0.11, // PPN 11% Indonesia
  DEFAULT_PRIORITY: 'normal' as const,
  DEFAULT_DELIVERY_METHOD: 'pickup' as const,
  
  // Business rules
  MIN_ORDER_AMOUNT: 10000, // Minimum order amount
  MAX_ORDER_ITEMS: 50,
  DEFAULT_DUE_DATE_DAYS: 3, // 3 days from order date
  
  // Payment terms
  PARTIAL_PAYMENT_MIN_PERCENTAGE: 30, // Minimum 30% untuk DP
  FULL_PAYMENT_DAYS: 7, // Full payment due in 7 days
  
  // Delivery
  FREE_DELIVERY_THRESHOLD: 500000, // Free delivery threshold amount
  DEFAULT_DELIVERY_FEE: 15000, // Default delivery fee
  MAX_DELIVERY_RADIUS: 10, // 10km radius
  
  // HPP Calculation
  DEFAULT_HPP_PERCENTAGE: 0.7, // 70% of selling price as fallback when real HPP unavailable
} as const

// Order Status Configuration
export const ORDER_STATUS_CONFIG: Record<OrderStatus, {
  label: string
  color: string
  bgColor: string
  description: string
  nextStatuses: OrderStatus[]
  allowEdit: boolean
  allowCancel: boolean
}> = {
  PENDING: {
    label: 'Menunggu Konfirmasi',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    description: 'Menunggu konfirmasi dari customer atau admin',
    nextStatuses: ['CONFIRMED', 'CANCELLED'],
    allowEdit: true,
    allowCancel: true
  },
  CONFIRMED: {
    label: 'Dikonfirmasi',
    color: 'text-gray-600 dark:text-gray-400', 
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    description: 'Order sudah dikonfirmasi, siap untuk produksi',
    nextStatuses: ['IN_PROGRESS', 'CANCELLED'],
    allowEdit: false,
    allowCancel: true
  },
  IN_PROGRESS: {
    label: 'Sedang Diproduksi',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800', 
    description: 'Order sedang dalam proses produksi',
    nextStatuses: ['READY', 'CANCELLED'],
    allowEdit: false,
    allowCancel: false
  },
  READY: {
    label: 'Siap Diambil',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Order sudah selesai dan siap diambil/dikirim',
    nextStatuses: ['DELIVERED'],
    allowEdit: false,
    allowCancel: false
  },
  DELIVERED: {
    label: 'Selesai',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    description: 'Order sudah selesai dan diterima customer',
    nextStatuses: [],
    allowEdit: false,
    allowCancel: false
  },
  CANCELLED: {
    label: 'Dibatalkan',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    description: 'Order dibatalkan',
    nextStatuses: [],
    allowEdit: false,
    allowCancel: false
  }
}

// Payment Status Configuration
export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, {
  label: string
  color: string
  bgColor: string
  description: string
}> = {
  PENDING: {
    label: 'Belum Dibayar',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    description: 'Belum ada pembayaran yang diterima'
  },
  PARTIAL: {
    label: 'Dibayar Sebagian',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800', 
    description: 'Sudah dibayar sebagian (DP)'
  },
  PAID: {
    label: 'Lunas',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    description: 'Sudah dibayar lunas'
  },
  REFUNDED: {
    label: 'Dikembalikan',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    description: 'Pembayaran sudah dikembalikan'
  }
}

// Payment Method Configuration
export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, {
  label: string
  icon: string
  description: string
  isOnline: boolean
  processingFee?: number // Percentage
}> = {
  CASH: {
    label: 'Tunai',
    icon: '💵',
    description: 'Pembayaran cash di tempat',
    isOnline: false
  },
  BANK_TRANSFER: {
    label: 'Transfer Bank',
    icon: '🏦',
    description: 'Transfer via internet banking',
    isOnline: true
  },
  CREDIT_CARD: {
    label: 'Kartu Kredit',
    icon: '💳',
    description: 'Kartu kredit/debit',
    isOnline: true,
    processingFee: 2.9 // 2.9% fee
  },
  DIGITAL_WALLET: {
    label: 'E-Wallet',
    icon: '📲',
    description: 'GoPay, OVO, Dana, ShopeePay',
    isOnline: true,
    processingFee: 1.5 // 1.5% fee
  },
  OTHER: {
    label: 'Lainnya',
    icon: '💰',
    description: 'Metode pembayaran lainnya',
    isOnline: false
  }
}

// Delivery Method Configuration
export const DELIVERY_METHOD_CONFIG: Record<DeliveryMethod, {
  label: string
  icon: string
  description: string
  estimatedTime: string
  feeCalculation: 'fixed' | 'distance' | 'weight'
}> = {
  PICKUP: {
    label: 'Ambil Sendiri',
    icon: '🏪',
    description: 'Customer ambil sendiri di toko',
    estimatedTime: 'Sesuai waktu buka toko',
    feeCalculation: 'fixed' // No fee
  },
  DELIVERY: {
    label: 'Diantar',
    icon: '🏍️',
    description: 'Diantar ke alamat customer',
    estimatedTime: '1-2 jam dalam kota',
    feeCalculation: 'distance'
  },
  DINE_IN: {
    label: 'Dine In',
    icon: '🍽️',
    description: 'Makan di tempat',
    estimatedTime: 'Langsung',
    feeCalculation: 'fixed'
  }
}

// Order Priority Configuration
export const ORDER_PRIORITY_CONFIG = {
  low: {
    label: 'Rendah',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: '⬇️',
    description: 'Tidak urgent'
  },
  normal: {
    label: 'Normal',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    icon: '➡️',
    description: 'Prioritas normal'
  },
  high: {
    label: 'Tinggi',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: '⬆️',
    description: 'Prioritas tinggi'
  },
  urgent: {
    label: 'Urgent',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    icon: '🚨',
    description: 'Sangat urgent, butuh perhatian khusus'
  }
} as const

// Order Validation Rules
export const ORDER_VALIDATION = {
  customer_name: {
    minLength: 2,
    maxLength: 100,
    required: true
  },
  customer_phone: {
    minLength: 10,
    maxLength: 15,
    pattern: /^(\+62|62|0)8[1-9][0-9]{6,9}$/ // Indonesian phone format
  },
  customer_email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  items: {
    minItems: 1,
    maxItems: ORDER_CONFIG.MAX_ORDER_ITEMS
  },
  quantity: {
    min: 1,
    max: 1000
  },
  due_date: {
    minDaysFromNow: 0, // Can be today
    maxDaysFromNow: 90 // Max 3 months
  }
} as const

// Indonesian specific configurations
export const INDONESIAN_CONFIG = {
  // Indonesian phone number prefixes
  PHONE_PREFIXES: ['0811', '0812', '0813', '0821', '0822', '0823', '0851', '0852', '0853'],
  
  // Common Indonesian cities for delivery
  MAJOR_CITIES: [
    'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang',
    'Makassar', 'Palembang', 'Tangerang', 'Depok', 'Bekasi'
  ],
  
  // Indonesian currency formatting
  CURRENCY: {
    code: 'IDR',
    symbol: 'Rp',
    thousandsSeparator: '.',
    decimalSeparator: ','
  },
  
  // Business hour defaults (Indonesian context)
  BUSINESS_HOURS: {
    open: '08:00',
    close: '22:00',
    timezone: 'Asia/Jakarta'
  },
  
  // Common Indonesian UMKM categories
  PRODUCT_CATEGORIES: [
    'Roti', 'Kue', 'Pastry', 'Cookies', 'Donat', 'Cake'
  ]
} as const

// Notification templates (Indonesian)
export const NOTIFICATION_TEMPLATES = {
  ORDER_CREATED: {
    title: 'Pesanan Baru Dibuat',
    message: 'Pesanan #{order_no} telah dibuat untuk {customer_name}',
    type: 'info'
  },
  ORDER_CONFIRMED: {
    title: 'Pesanan Dikonfirmasi',
    message: 'Pesanan #{order_no} telah dikonfirmasi dan akan segera diproduksi',
    type: 'success'
  },
  ORDER_READY: {
    title: 'Pesanan Siap Diambil',
    message: 'Pesanan #{order_no} sudah siap. Silakan diambil atau akan dikirim sesuai jadwal',
    type: 'success'
  },
  PAYMENT_RECEIVED: {
    title: 'Pembayaran Diterima',
    message: 'Pembayaran sebesar {amount} untuk pesanan #{order_no} telah diterima',
    type: 'success'
  },
  ORDER_CANCELLED: {
    title: 'Pesanan Dibatalkan',
    message: 'Pesanan #{order_no} telah dibatalkan',
    type: 'warning'
  }
} as const

// Currency helper functions for order constants
export const getFormattedOrderAmounts = () => ({
  minOrderAmount: formatCurrentCurrency(ORDER_CONFIG.MIN_ORDER_AMOUNT),
  freeDeliveryThreshold: formatCurrentCurrency(ORDER_CONFIG.FREE_DELIVERY_THRESHOLD),
  defaultDeliveryFee: formatCurrentCurrency(ORDER_CONFIG.DEFAULT_DELIVERY_FEE)
})

// Helper to get labels only
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = Object.entries(ORDER_STATUS_CONFIG).reduce(
  (acc, [key, value]) => ({ ...acc, [key]: value.label }),
  {} as Record<OrderStatus, string>
)

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = Object.entries(PAYMENT_STATUS_CONFIG).reduce(
  (acc, [key, value]) => ({ ...acc, [key]: value.label }),
  {} as Record<PaymentStatus, string>
)

// Export all for easy access
export {
  ORDER_STATUS_CONFIG as ORDER_STATUSES,
  PAYMENT_STATUS_CONFIG as PAYMENT_STATUSES,
  PAYMENT_METHOD_CONFIG as PAYMENT_METHODS,
  DELIVERY_METHOD_CONFIG as DELIVERY_METHODS,
  ORDER_PRIORITY_CONFIG as ORDER_PRIORITIES
}
