import { NextRequest, NextResponse } from 'next/server'
import { autoReorderService } from '@/services/inventory/AutoReorderService'

/**
 * GET /api/inventory/reorder - Check reorder needs
 * POST /api/inventory/reorder - Trigger manual reorder check
 */

export async function GET() {
  try {
    const summary = await autoReorderService.checkReorderNeeds()
    
    return NextResponse.json({
      success: true,
      data: summary
    })
  } catch (error) {
    console.error('Error checking reorder needs:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check reorder needs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body
    
    switch (action) {
      case 'check_reorder_needs': {
        const summary = await autoReorderService.checkReorderNeeds()
        return NextResponse.json({
          success: true,
          data: summary
        })
      }
      
      case 'create_reorder_rule': {
        const rule = await autoReorderService.createReorderRule(data)
        return NextResponse.json({
          success: true,
          data: rule
        })
      }
      
      case 'generate_purchase_order': {
        const { alert, rule, supplier } = data
        const purchaseOrder = await autoReorderService.generateAutoPurchaseOrder(alert, rule, supplier)
        return NextResponse.json({
          success: true,
          data: purchaseOrder
        })
      }
      
      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid action' 
          },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in reorder API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process reorder request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}