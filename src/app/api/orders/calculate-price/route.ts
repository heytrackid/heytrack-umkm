// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger, logError } from '@/lib/logger'
import { requireAuth, isErrorResponse } from '@/lib/api-auth'
import { APISecurity, InputSanitizer, createSecureHandler, SecurityPresets } from '@/utils/security/index'


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

// POST /api/orders/calculate-price - Calculate order price with discounts
async function calculatePricePOST(request: NextRequest): Promise<NextResponse> {
  try {
    apiLogger.info({ url: request.url }, 'POST /api/orders/calculate-price')

    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const sanitizedBody = APISecurity.sanitizeRequestBody(await request.json())
    const parsedBody = CalculatePriceSchema.parse(sanitizedBody)
    const {
      customer_id,
      items,
      delivery_fee,
      tax_rate,
      use_loyalty_points,
    } = parsedBody

    const safeCustomerId = customer_id ? InputSanitizer.sanitizeSQLInput(customer_id) : undefined

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
      customer_info: safeCustomerId
        ? { id: safeCustomerId, name: '', discount_percentage: 0, loyalty_points: 0 }
        : undefined
    }

    apiLogger.info({
      userId: user['id'],
      customerId: safeCustomerId,
      subtotal: pricing.subtotal,
      total: pricing.total_amount
    }, 'Order price calculated')

    return NextResponse.json(pricing)
  } catch (error) {
    logError(apiLogger, error, 'Failed to calculate order price')
    return handleAPIError(error, 'POST /api/orders/calculate-price')
  }
}

export const POST = createSecureHandler(calculatePricePOST, 'POST /api/orders/calculate-price', SecurityPresets.enhanced())
