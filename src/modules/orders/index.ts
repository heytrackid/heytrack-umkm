/**
 * Orders Domain Module
 * Centralized exports untuk semua functionality terkait order management & sales
 */

// Core order components
export { default as OrdersPage } from './components/OrdersPage'
export { OrderForm } from './components/OrderForm'
export { OrderDetailView } from './components/OrderDetailView'
export { OrdersTableView } from './components/OrdersTableView'

// Services
export { OrderRecipeService } from './services/OrderRecipeService'
export type { 
  RecipeOption, 
  OrderItemCalculation, 
  OrderPricing 
} from './services/OrderRecipeService'

// Types
export type {
  Order,
  OrderItem,
  Payment,
  Customer,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  DeliveryMethod,
  OrderFilters,
  OrderStats,
  OrderAnalytics,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderFormProps,
  OrderDetailProps,
  OrdersListProps,
  UseOrdersDataReturn,
  UseOrderFormReturn
} from './types'

// Constants
export {
  ORDER_CONFIG,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  DELIVERY_METHODS,
  ORDER_PRIORITIES,
  ORDER_VALIDATION,
  INDONESIAN_CONFIG,
  NOTIFICATION_TEMPLATES
} from './constants'

// Labels for easy access
export {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  DELIVERY_METHOD_LABELS
} from './types'

// Utils
export {
  getStatusInfo,
  getPriorityInfo,
  generateOrderNo,
  calculateOrderTotals,
  getPaymentStatus
} from './utils/helpers'
