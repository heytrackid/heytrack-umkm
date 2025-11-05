import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger, logError } from '@/lib/logger'
import { checkBotId } from 'botid/server'
import { OrderPricingService } from '@/services/orders/OrderPricingService'


export const runtime = 'nodejs'

// POST /api/orders/calculate-price - Calculate order price with discounts
export async function POST(request: NextRequest) {
  try {
    apiLogger.info({ url: request.url }, 'POST /api/orders/calculate-price')
    
    const client = await createClient()

    const { data: { user }, error: authError } = await client.auth.getUser()

    if (authError || !user) {
      logError(apiLogger, authError, 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if the request is from a bot
    const verification = await checkBotId({
      advancedOptions: {
        checkLevel: 'basic',
      },
    })
    if (verification.isBot) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { customer_id, items, delivery_fee, tax_rate, use_loyalty_points } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'items array is required' },
        { status: 400 }
      )
    }

    const pricing = await OrderPricingService.calculateOrderPrice(
      customer_id ?? null,
      items,
      {
        delivery_fee: delivery_fee ?? 0,
        tax_rate: tax_rate ?? 0,
        use_loyalty_points: use_loyalty_points ?? 0
      }
    )

    apiLogger.info({ 
      userId: user.id,
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
