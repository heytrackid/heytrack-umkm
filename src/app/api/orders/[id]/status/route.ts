import { triggerWorkflow } from '@/lib/automation-engine'
import { createServerSupabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/orders/[id]/status - Update order status dengan automatic workflow triggers
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const orderId = resolvedParams.id

    const body = await request.json()
    const { status, notes } = body

    // Validate required fields
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Valid order statuses
    const validStatuses = [
      'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseAdmin()

    // Get current order to check previous status
    const { data: currentOrder, error: fetchError } = await (supabase as any)
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const previousStatus = currentOrder.status
    let incomeRecordId = null

    // If transitioning to DELIVERED, create income record
    if (status === 'DELIVERED' && previousStatus !== 'DELIVERED' && currentOrder.total_amount > 0) {
      const { data: incomeRecord, error: incomeError } = await (supabase as any)
        .from('financial_transactions')
        .insert({
          jenis: 'pemasukan',
          kategori: 'Revenue',
          nominal: currentOrder.total_amount,
          tanggal: currentOrder.delivery_date || currentOrder.order_date || new Date().toISOString().split('T')[0],
          referensi: `Order #${currentOrder.order_no}${currentOrder.customer_name ? ' - ' + currentOrder.customer_name : ''}`
        })
        .select()
        .single()

      if (incomeError) {
        console.error('Error creating income record:', incomeError)
        return NextResponse.json(
          { error: 'Failed to create income record for delivered order' },
          { status: 500 }
        )
      }

      incomeRecordId = incomeRecord.id
      console.log(`💰 Income record created for order ${currentOrder.order_no}: ${currentOrder.total_amount}`)
    }

    // Update order status with financial_record_id if income was created
    const { data: updatedOrder, error: updateError } = await (supabase as any)
      .from('orders')
      .update({
        status: status,
        updated_at: new Date().toISOString(),
        ...(notes && { notes: notes }),
        ...(incomeRecordId && { financial_record_id: incomeRecordId })
      })
      .eq('id', orderId)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating order status:', updateError)
      // Rollback income record if order update fails
      if (incomeRecordId) {
        await (supabase as any)
          .from('financial_transactions')
          .delete()
          .eq('id', incomeRecordId)
      }
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      )
    }

    console.log(`🔄 Order ${currentOrder.order_no}: ${previousStatus} → ${status}`)

    // TRIGGER AUTOMATION WORKFLOWS based on status change
    try {
      // Order completed workflow
      if (status === 'DELIVERED' && previousStatus !== 'DELIVERED') {
        console.log('🚀 Triggering order completion automation...')
        await triggerWorkflow('order.completed', orderId, {
          order: updatedOrder,
          previousStatus,
          newStatus: status
        })
      }

      // Order cancelled workflow
      if (status === 'CANCELLED' && previousStatus !== 'CANCELLED') {
        console.log('🚀 Triggering order cancellation automation...')
        await triggerWorkflow('order.cancelled', orderId, {
          order: updatedOrder,
          previousStatus,
          newStatus: status,
          reason: notes || 'Order cancelled'
        })
      }

      // General status change trigger
      await triggerWorkflow('order.status_changed', orderId, {
        order: updatedOrder,
        previousStatus,
        newStatus: status,
        notes
      })

    } catch (automationError) {
      console.error('⚠️ Automation trigger error (non-blocking):', automationError)
      // Don't fail the status update if automation fails
    }

    // Return success response with automation and income tracking info
    return NextResponse.json({
      success: true,
      order: updatedOrder,
      status_change: {
        from: previousStatus,
        to: status,
        timestamp: new Date().toISOString()
      },
      automation: {
        triggered: status === 'DELIVERED' || status === 'CANCELLED',
        workflows: getTriggeredWorkflows(status, previousStatus)
      },
      financial: {
        income_recorded: !!incomeRecordId,
        income_record_id: incomeRecordId,
        amount: incomeRecordId ? currentOrder.total_amount : null
      },
      message: `Order status updated to ${status}${status === 'DELIVERED' ? ' with automatic workflow processing and income tracking' : ''}`
    })

  } catch (error: any) {
    console.error('Error in order status update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/orders/[id]/status - Get order status history (optional)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const orderId = resolvedParams.id

    const supabase = createServerSupabaseAdmin()

    // Get order with basic info
    const { data: order, error: orderError } = await (supabase as any)
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Note: Status history would require a separate audit table in production
    // For now, return current status info
    const statusInfo = {
      current_status: order.status,
      status_display: getStatusDisplay(order.status),
      can_transition_to: getValidTransitions(order.status),
      automation_enabled: isAutomationEnabled(order.status),
      updated_at: order.updated_at
    }

    return NextResponse.json({
      order_id: order.id,
      order_no: order.order_no,
      status_info: statusInfo
    })

  } catch (error: any) {
    console.error('Error getting order status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function getTriggeredWorkflows(newStatus: string, previousStatus: string): string[] {
  const workflows = []

  if (newStatus === 'DELIVERED' && previousStatus !== 'DELIVERED') {
    workflows.push('order.completed', 'inventory.update', 'financial.record', 'customer.stats')
  }

  if (newStatus === 'CANCELLED' && previousStatus !== 'CANCELLED') {
    workflows.push('order.cancelled', 'inventory.restore')
  }

  return workflows
}

function getStatusDisplay(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'Menunggu Konfirmasi',
    'CONFIRMED': 'Dikonfirmasi',
    'IN_PROGRESS': 'Sedang Diproses',
    'READY': 'Siap Dikirim',
    'DELIVERED': 'Selesai',
    'CANCELLED': 'Dibatalkan'
  }

  return statusMap[status] || status
}

function getValidTransitions(currentStatus: string): string[] {
  const transitions: Record<string, string[]> = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['IN_PROGRESS', 'CANCELLED'],
    'IN_PROGRESS': ['READY', 'CANCELLED'],
    'READY': ['DELIVERED', 'CANCELLED'],
    'DELIVERED': [], // Final status
    'CANCELLED': []  // Final status
  }

  return transitions[currentStatus] || []
}

function isAutomationEnabled(status: string): boolean {
  // Automation triggers pada status tertentu
  return ['DELIVERED', 'CANCELLED'].includes(status)
}