
// Orders Module Barrel Exports
// Multi-currency and optional VAT support

// Types and interfaces
export type {
  Order,
  OrderItem,
  OrderPayment,
  OrderStatus,
  OrderPriority,
  PaymentMethod,
  CreateOrderData,
  CreateOrderItemData,
  UpdateOrderData,
  OrderFilters,
  OrderSummary,
  OrderAnalytics,
  OrderStatusTransition,
  OrderTotalsBreakdown,
  InvoiceData,
  OrderValidationError,
  OrderExportFormat,
  OrderExportOptions,
  CurrencyConversion
} from './types/orders.types'

// Configuration and utilities
export {
  DEFAULT_ORDERS_CONFIG,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_ICONS,
  ORDER_PRIORITY_COLORS,
  PAYMENT_METHOD_ICONS,
  calculateOrderTotals,
  validateOrdersConfig,
  createRegionalOrdersConfig
} from './config/orders.config'

export type {
  OrdersModuleConfig,
  OrderTotals
} from './config/orders.config'

// Service hooks
export {
  useOrders,
  useOrderItems,
  useOrderPayments,
  useOrderTotals,
  useOrderSummary,
  useOrderStatus,
  useOrderCurrency,
  useInvoiceGeneration,
  useOrderValidation
} from './hooks/use-orders'

// Module metadata
export const ORDERS_MODULE_INFO = {
  name: 'Orders Management',
  version: '1.0.0',
  description: 'Complete order management system with multi-currency support and optional VAT/tax handling',
  features: [
    'Multi-currency order processing',
    'Optional and configurable VAT/tax system',
    'Flexible order workflow management',
    'Payment tracking and methods',
    'Invoice generation',
    'Order analytics and reporting',
    'Regional business configuration',
    'Advanced filtering and search',
    'Real-time order updates'
  ],
  dependencies: [
    '@/hooks/useSupabaseCRUD',
    '@/hooks/useSupabaseData',
    '@/lib/shared/utils/currency'
  ]
} as const