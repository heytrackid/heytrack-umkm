// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { z } from 'zod'

import { apiLogger } from '@/lib/logger'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { createSuccessResponse } from '@/lib/api-core'
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'

const OrderItemSchema = z.object({
  unit_price: z.number().finite().min(0, { message: 'unit_price must be >= 0' }),
  quantity: z.number().int().positive({ message: 'quantity must be > 0' })
})

const CalculatePriceSchema = z.object({
  customer_id: z.string().uuid().optional(),
  items: z.array(OrderItemSchema).min(1, { message: 'At least one item is required' }),
  delivery_fee: z.number().finite().min(0).optional(),
  tax_rate: z.number().finite().min(0).max(1).optional(),
  use_loyalty_points: z.number().int().min(0).optional()
}).strict()

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/orders/calculate-price',
    bodySchema: CalculatePriceSchema,
    securityPreset: SecurityPresets.enhanced(),
  },
  async (context: RouteContext, _query, body) => {
    const { user } = context
    const {
      customer_id,
      items,
      delivery_fee,
      tax_rate,
      use_loyalty_points,
    } = body!

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)

    // Apply tax
    const tax_amount = subtotal * (tax_rate ?? 0)

    // For now, simple calculation - can be enhanced later
    const discount_amount = 0
    const discount_percentage = 0
    const delivery_fee_amount = delivery_fee ?? 0
    const total_amount = subtotal + tax_amount + delivery_fee_amount - discount_amount

    const pricing = {
      subtotal,
      discount_amount,
      discount_percentage,
      tax_amount,
      delivery_fee: delivery_fee_amount,
      total_amount,
      loyalty_points_earned: Math.floor(total_amount / 10), // Simple calculation
      loyalty_points_used: use_loyalty_points ?? 0,
      customer_info: customer_id
        ? { id: customer_id, name: '', discount_percentage: 0, loyalty_points: 0 }
        : undefined
    }

    apiLogger.info({
      userId: user.id,
      customerId: customer_id,
      subtotal: pricing.subtotal,
      total: pricing.total_amount
    }, 'Order price calculated')

    return createSuccessResponse(pricing, SUCCESS_MESSAGES.FETCHED)
  }
)
