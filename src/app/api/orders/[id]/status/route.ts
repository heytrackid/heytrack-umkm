import { triggerWorkflow } from '@/lib/automation-engine'
import { createServiceRoleClient } from '@/utils/supabase/service-role'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/supabase-generated'
import { apiLogger } from '@/lib/logger'

type Order = Database['public']['Tables']['orders']['Row']
type OrderStatus = Database['public']['Enums']['order_status']
// PATCH /api/orders/[id]/status - Update order status dengan automatic workflow triggers
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id: orderId } = resolvedParams

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
        { error: `Invalid status. Must be one of: ${  validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Get current order to check previous status
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_no, status, total_amount, delivery_date, order_date, customer_name, user_id')
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
    if (status === 'DELIVERED' && previousStatus !== 'DELIVERED' && currentOrder.total_amount !== null && currentOrder.total_amount > 0) {
      const { data: incomeRecord, error: incomeError } = await supabase
        .from('financial_records')
        .insert([{
          type: 'INCOME',
          category: 'Revenue',
          amount: currentOrder.total_amount ?? 0,
          date: (currentOrder.delivery_date || currentOrder.order_date || new Date().toISOString().split('T')[0]) as string,
          reference: `Order #${currentOrder.order_no || ''}${currentOrder.customer_name ? ` - ${  currentOrder.customer_name}` : ''}`,
          description: `Income from order ${currentOrder.order_no || ''}`,
          user_id: currentOrder.user_id
        }])
        .select()
        .single()

      if (incomeError) {
        apiLogger.error({ error: incomeError }, 'Error creating income record:')
        return NextResponse.json(
          { error: 'Failed to create income record for delivered order' },
          { status: 500 }
        )
      }

      incomeRecordId = incomeRecord.id
      apiLogger.info(`💰 Income record created for order ${currentOrder.order_no}: ${currentOrder.total_amount}`)
    }

    // Update order status with financial_record_id if income was created
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...(notes && { notes }),
        ...(incomeRecordId && { financial_record_id: incomeRecordId })
      })
      .eq('id', orderId)
      .select('id, order_no, status, total_amount, customer_name, delivery_date, order_date, updated_at, financial_record_id')
      .single()

    if (updateError) {
      apiLogger.error({ error: updateError }, 'Error updating order status:')
      // Rollback income record if order update fails
      if (incomeRecordId) {
        await supabase
          .from('financial_records')
          .delete()
          .eq('id', incomeRecordId)
      }
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      )
    }

    apiLogger.info(`🔄 Order ${currentOrder.order_no}: ${previousStatus} → ${status}`)

    // TRIGGER AUTOMATION WORKFLOWS based on status change
    try {
      // Order completed workflow
      if (status === 'DELIVERED' && previousStatus !== 'DELIVERED') {
        apiLogger.info('🚀 Triggering order completion automation...')
        await triggerWorkflow('order.completed', orderId, {
          order: updatedOrder,
          previousStatus: previousStatus || '',
          newStatus: status
        })
      }

      // Order cancelled workflow
      if (status === 'CANCELLED' && previousStatus !== 'CANCELLED') {
        apiLogger.info('🚀 Triggering order cancellation automation...')
        await triggerWorkflow('order.cancelled', orderId, {
          order: updatedOrder,
          previousStatus: previousStatus || '',
          newStatus: status,
          reason: notes || 'Order cancelled'
        })
      }

      // General status change trigger
      await triggerWorkflow('order.status_changed', orderId, {
        order: updatedOrder,
        previousStatus: previousStatus || '',
        newStatus: status,
        notes
      })

    } catch (automationError) {
      apiLogger.error({ error: automationError }, '⚠️ Automation trigger error (non-blocking):')
      // Don't fail the status update if automation fails
    }

    // Return success response with automation and income tracking info
    return NextResponse.json({
      success: true,
      order: updatedOrder,
      status_change: {
        from: previousStatus || '',
        to: status,
        timestamp: new Date().toISOString()
      },
      automation: {
        triggered: status === 'DELIVERED' || status === 'CANCELLED',
        workflows: getTriggeredWorkflows(status, previousStatus || '')
      },
      financial: {
        income_recorded: !!incomeRecordId,
        income_record_id: incomeRecordId,
        amount: incomeRecordId ? (currentOrder.total_amount ?? 0) : null
      },
      message: `Order status updated to ${status}${status === 'DELIVERED' ? ' with automatic workflow processing and income tracking' : ''}`
    })

  } catch (err: unknown) {
    apiLogger.error({ err }, 'Error in order status update:')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/orders/[id]/status - Get order status history (optional)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id: orderId } = resolvedParams

    const supabase = createServiceRoleClient()

    // Get order with basic info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_no, status, updated_at')
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
      status_display: order.status ? getStatusDisplay(order.status) : 'Unknown',
      can_transition_to: order.status ? getValidTransitions(order.status) : [],
      automation_enabled: order.status ? isAutomationEnabled(order.status) : false,
      updated_at: order.updated_at
    }

    return NextResponse.json({
      order_id: order.id!,
      order_no: order.order_no!,
      status_info: statusInfo
    })

  } catch (err: unknown) {
    apiLogger.error({ err }, 'Error getting order status:')
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