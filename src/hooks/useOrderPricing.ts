import { useMutation } from '@tanstack/react-query'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('Hook')




interface OrderPricingRequest {
  customer_id?: string
  items: Array<{
    unit_price: number
    quantity: number
  }>
  delivery_fee?: number
  tax_rate?: number
  use_loyalty_points?: number
}

interface OrderPricingResult {
  subtotal: number
  discount_amount: number
  discount_percentage: number
  tax_amount: number
  delivery_fee: number
  total_amount: number
  loyalty_points_earned: number
  loyalty_points_used: number
  customer_info?: {
    name: string
    discount_percentage: number
    loyalty_points: number
  }
}

export function useOrderPricing() {
  return useMutation({
    mutationFn: async (request: OrderPricingRequest) => {
      const response = await fetch('/api/orders/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error ?? 'Failed to calculate order price')
      }

      return response.json() as Promise<OrderPricingResult>
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to calculate order price:')
    }
  })
}
