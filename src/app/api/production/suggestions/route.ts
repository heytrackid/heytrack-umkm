import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger, logError } from '@/lib/logger'
import { ProductionBatchService } from '@/services/production/ProductionBatchService'


export const runtime = 'nodejs'

// GET /api/production/suggestions - Get suggested production batches
export async function GET(request: NextRequest) {
  try {
    apiLogger.info({ url: request.url }, 'GET /api/production/suggestions - Request received')
    
    const client = await createClient()

    const { data: { user }, error: authError } = await client.auth.getUser()

    if (authError || !user) {
      logError(apiLogger, authError, 'GET /api/production/suggestions - Unauthorized', {
        userId: user?.id,
        url: request.url,
      })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const suggestions = await ProductionBatchService.getSuggestedBatches(user.id)

    apiLogger.info({ 
      userId: user.id,
      suggestionsCount: suggestions.length
    }, 'GET /api/production/suggestions - Success')

    return NextResponse.json({
      data: suggestions,
      meta: {
        total: suggestions.length,
        high_priority: suggestions.filter(s => s.priority === 'HIGH').length,
        medium_priority: suggestions.filter(s => s.priority === 'MEDIUM').length,
        low_priority: suggestions.filter(s => s.priority === 'LOW').length
      }
    })
  } catch (error) {
    logError(apiLogger, error, 'GET /api/production/suggestions - Unexpected error', {
      url: request.url,
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/production/suggestions - Create batch from suggestion
export async function POST(request: NextRequest) {
  try {
    apiLogger.info({ url: request.url }, 'POST /api/production/suggestions - Request received')
    
    const client = await createClient()

    const { data: { user }, error: authError } = await client.auth.getUser()

    if (authError || !user) {
      logError(apiLogger, authError, 'POST /api/production/suggestions - Unauthorized', {
        userId: user?.id,
        url: request.url,
      })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { order_ids, planned_date } = body

    if (!order_ids || !Array.isArray(order_ids) || order_ids.length === 0) {
      return NextResponse.json(
        { error: 'order_ids array is required' },
        { status: 400 }
      )
    }

    const result = await ProductionBatchService.createBatchFromOrders(
      order_ids,
      user.id,
      planned_date
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    apiLogger.info({ 
      userId: user.id,
      batchId: result.batch_id,
      orderCount: order_ids.length
    }, 'POST /api/production/suggestions - Batch created')

    return NextResponse.json({
      success: true,
      batch_id: result.batch_id,
      message: result.message
    }, { status: 201 })
  } catch (error) {
    logError(apiLogger, error, 'POST /api/production/suggestions - Unexpected error', {
      url: request.url,
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
