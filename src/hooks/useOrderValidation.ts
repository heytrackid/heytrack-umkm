import { createClientLogger } from '@/lib/client-logger'
import { useMutation } from '@tanstack/react-query'
import { postApi } from '@/lib/query/query-helpers'

const logger = createClientLogger('useOrderValidation')

interface OrderItem {
  recipe_id: string
  quantity: number
}

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  stock_issues?: Array<{
    ingredient_id: string
    ingredient_name: string
    required: number
    available: number
    shortage: number
  }>
}

/**
 * Validate order items against inventory
 */
export function useValidateOrderStock() {
  return useMutation<ValidationResult, Error, { items: OrderItem[] }>({
    mutationFn: (data) => postApi('/api/orders/validate-stock', data),
    onError: (error) => {
      logger.error({ error }, 'Failed to validate order stock')
    },
  })
}

/**
 * Validate order before creation
 */
export function useValidateOrder() {
  return useMutation<ValidationResult, Error, {
    customer_id?: string
    items: OrderItem[]
    delivery_date?: string
  }>({
    mutationFn: (data) => postApi('/api/orders/validate', data),
    onError: (error) => {
      logger.error({ error }, 'Failed to validate order')
    },
  })
}

/**
 * Check if recipes are available for order
 */
export function useCheckRecipeAvailability() {
  return useMutation<Record<string, boolean>, Error, { recipe_ids: string[] }>({
    mutationFn: (data) => postApi('/api/orders/check-availability', data),
    onError: (error) => {
      logger.error({ error }, 'Failed to check recipe availability')
    },
  })
}
