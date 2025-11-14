

/**
 * Orders Domain Module
 * Centralized exports untuk semua functionality terkait order management & sales
 */

// Core order components
export { OrderDetailView } from './components/OrderDetailView'
export { OrderForm } from './components/OrderForm'
export { OrdersPage as OrdersPage } from './components/OrdersPage'

// Services
export { OrderRecipeService } from '@/services/orders/OrderRecipeService'

// Types
export type {
  CreateOrderRequest, Customer, DeliveryMethod, Order, OrderAnalytics, OrderDetailProps, OrderFilters, OrderFormProps, OrderItem, OrdersListProps, OrderStats, OrderStatus, Payment, PaymentMethod, PaymentStatus, UpdateOrderRequest, UseOrderFormReturn, UseOrdersDataReturn
} from './types'

// Constants
export {
  DELIVERY_METHODS, INDONESIAN_CONFIG,
  NOTIFICATION_TEMPLATES, ORDER_CONFIG, ORDER_PRIORITIES, ORDER_STATUSES, ORDER_VALIDATION, PAYMENT_METHODS, PAYMENT_STATUSES
} from './constants'

// Labels for easy access
export {
  DELIVERY_METHOD_LABELS, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS
} from './types'

// Utils
export {
  calculateOrderTotals, generateOrderNo, getPaymentStatus, getPriorityInfo, getStatusInfo
} from './utils/helpers'

