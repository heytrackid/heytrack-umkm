import { createClientLogger } from '@/lib/client-logger'
import { useMutation, useQuery } from '@tanstack/react-query'
import { fetchApi, postApi } from '@/lib/query/query-helpers'
import { toast } from 'sonner'

const logger = createClientLogger('useOrderPricing')

interface OrderItem {
  recipe_id: string
  quantity: number
  custom_price?: number
}

interface PricingResult {
  subtotal: number
  discount_amount: number
  discount_percentage: number
  tax_amount: number
  tax_percentage: number
  delivery_fee: number
  total: number
  items: Array<{
    recipe_id: string
    quantity: number
    unit_price: number
    subtotal: number
  }>
}

interface PricingRecommendation {
  recommended_price: number
  min_price: number
  max_price: number
  profit_margin: number
  competitor_avg: number
  market_position: 'low' | 'medium' | 'high'
}

/**
 * Calculate order price
 */
export function useCalculateOrderPrice() {
  return useMutation<PricingResult, Error, {
    items: OrderItem[]
    customer_id?: string
    discount_percentage?: number
    discount_amount?: number
    tax_percentage?: number
    delivery_fee?: number
  }>({
    mutationFn: (data) => postApi('/api/orders/calculate-price', data),
    onError: (error) => {
      logger.error({ error }, 'Failed to calculate order price')
      toast.error('Gagal menghitung harga pesanan')
    },
  })
}

/**
 * Get pricing recommendation for recipe
 */
export function useRecipePricingRecommendation(recipeId: string | null) {
  return useQuery<PricingRecommendation>({
    queryKey: ['recipe-pricing-recommendation', recipeId],
    queryFn: () => {
      if (!recipeId) throw new Error('Recipe ID is required')
      return fetchApi<PricingRecommendation>(`/api/recipes/${recipeId}/pricing`)
    },
    enabled: !!recipeId,
  })
}

/**
 * Apply customer discount
 */
export function useApplyCustomerDiscount() {
  return useMutation<{ discount_percentage: number; discount_amount: number }, Error, {
    customer_id: string
    subtotal: number
  }>({
    mutationFn: (data) => postApi('/api/orders/apply-discount', data),
    onError: (error) => {
      logger.error({ error }, 'Failed to apply customer discount')
    },
  })
}

/**
 * Validate order pricing
 */
export function useValidateOrderPricing() {
  return useMutation<{ valid: boolean; errors: string[] }, Error, {
    items: OrderItem[]
    total: number
  }>({
    mutationFn: (data) => postApi('/api/orders/validate-pricing', data),
    onError: (error) => {
      logger.error({ error }, 'Failed to validate order pricing')
    },
  })
}

/**
 * Get bulk pricing for recipes
 */
export function useBulkRecipePricing(recipeIds: string[]) {
  return useQuery<Record<string, { price: number; hpp: number; margin: number }>>({
    queryKey: ['bulk-recipe-pricing', recipeIds],
    queryFn: () => postApi('/api/recipes/bulk-pricing', { recipeIds }),
    enabled: recipeIds.length > 0,
  })
}
