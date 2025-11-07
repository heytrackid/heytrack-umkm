// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { type NextRequest, NextResponse } from 'next/server'

import { apiLogger, logError } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'




// POST /api/orders/calculate-price - Calculate order price with discounts
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    apiLogger.info({ url: request.url }, 'POST /api/orders/calculate-price')
    
    const client = await createClient()

    const { data: { user }, error: authError } = await client.auth.getUser()

    if (authError || !user) {
      logError(apiLogger, authError, 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }    const body = await request.json() as {
      customer_id?: string
      items?: Array<{ unit_price: number; quantity: number }>
      delivery_fee?: number
      tax_rate?: number
      use_loyalty_points?: number
    }
    const { customer_id, items, delivery_fee, tax_rate, use_loyalty_points } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'items array is required' },
        { status: 400 }
      )
    }

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
      customer_info: customer_id ? { name: '', discount_percentage: 0, loyalty_points: 0 } : undefined
    }

    apiLogger.info({ 
      userId: user['id'],
      customerId: customer_id,
      subtotal: pricing.subtotal,
      total: pricing.total_amount
    }, 'Order price calculated')

    return NextResponse.json(pricing)
  } catch (error) {
    logError(apiLogger, error, 'Failed to calculate order price')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
