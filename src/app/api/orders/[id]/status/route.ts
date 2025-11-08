// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import 'server-only'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { triggerWorkflow } from '@/lib/automation/workflows/index'
import { APIError, handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/database'
import { APISecurity, InputSanitizer, SecurityPresets, withSecurity } from '@/utils/security'
import { createServiceRoleClient } from '@/utils/supabase/service-role'

const VALID_STATUSES = [
  'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'
] as const

type OrderStatus = (typeof VALID_STATUSES)[number]
type OrderRow = Database['public']['Tables']['orders']['Row']
interface PartialOrderRow {
  id: string;
  order_no: string;
  status: string | null;
  total_amount: number | null;
  delivery_date: string | null;
  order_date: string | null;
  customer_name: string | null;
  user_id: string;
}
type TriggerWorkflow = typeof triggerWorkflow
type ApiLogger = typeof apiLogger

interface RouteContext {
  params: Promise<{ id: string }>
}

const UpdateStatusSchema = z.object({
  status: z.enum(VALID_STATUSES),
  notes: z.string().trim().max(500).optional()
}).strict()

async function fetchCurrentOrder(supabase: ReturnType<typeof createServiceRoleClient>, orderId: string): Promise<{
  id: string;
  order_no: string;
  status: string | null;
  total_amount: number | null;
  delivery_date: string | null;
  order_date: string | null;
  customer_name: string | null;
  user_id: string;
}> {
  const { data: currentOrder, error: fetchError } = await supabase
    .from('orders')
    .select('id, order_no, status, total_amount, delivery_date, order_date, customer_name, user_id')
    .eq('id', orderId)
    .single()

  if (fetchError || !currentOrder) {
    throw new Error('Order not found')
  }

  return currentOrder
}

async function createIncomeRecordIfNeeded(
  supabase: ReturnType<typeof createServiceRoleClient>,
  status: string,
  previousStatus: string | null,
  currentOrder: PartialOrderRow,
  apiLoggerInstance: ApiLogger
): Promise<string | null> {
  if (status === 'DELIVERED' && previousStatus !== 'DELIVERED' && currentOrder.total_amount !== null && currentOrder.total_amount > 0) {
    const { data: incomeRecord, error: incomeError } = await supabase
      .from('financial_records')
      .insert([{
        type: 'INCOME',
        category: 'Revenue',
        amount: currentOrder.total_amount ?? 0,
        date: (currentOrder.delivery_date ?? currentOrder.order_date ?? new Date().toISOString().split('T')[0]) as string,
        reference: `Order #${currentOrder['order_no'] || ''}${currentOrder['customer_name'] ? ` - ${currentOrder['customer_name']}` : ''}`,
        description: `Income from order ${currentOrder['order_no'] || ''}`,
        user_id: currentOrder.user_id
      }])
      .select()
      .single()

    if (incomeError) {
      apiLoggerInstance.error({ error: incomeError }, 'Error creating income record:')
      throw new Error('Failed to create income record for delivered order')
    }

    apiLoggerInstance.info(`💰 Income record created for order ${currentOrder['order_no']}: ${currentOrder.total_amount}`)
    return incomeRecord['id']
  }

  return null
}

async function updateOrderStatus(
  supabase: ReturnType<typeof createServiceRoleClient>,
  orderId: string,
  status: string,
  notes: string | undefined,
  incomeRecordId: string | null,
  apiLoggerInstance: ApiLogger
): Promise<OrderRow> {
  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update({
      status: status as OrderStatus,
      updated_at: new Date().toISOString(),
      ...(notes && { notes }),
      ...(incomeRecordId && { financial_record_id: incomeRecordId })
    })
    .eq('id', orderId)
    .select('id, order_no, status, total_amount, customer_name, delivery_date, order_date, updated_at, financial_record_id')
    .single()

  if (updateError) {
    apiLoggerInstance.error({ error: updateError }, 'Error updating order status:')
    // Rollback income record if order update fails
    if (incomeRecordId) {
      await supabase
        .from('financial_records')
        .delete()
        .eq('id', incomeRecordId)
    }
    throw new Error('Failed to update order status')
  }

  return updatedOrder as OrderRow
}

async function triggerWorkflows(
  workflowTrigger: TriggerWorkflow,
  orderId: string,
  status: string,
  previousStatus: string | null,
  updatedOrder: OrderRow,
  notes: string | undefined,
  apiLoggerInstance: ApiLogger
) {
  try {
    if (status === 'DELIVERED' && previousStatus !== 'DELIVERED') {
      apiLoggerInstance.info('🚀 Triggering order completion automation...')
      await workflowTrigger('order.completed', orderId, {
        order: updatedOrder,
        previousStatus: previousStatus ?? '',
        newStatus: status
      })
    }

    if (status === 'CANCELLED' && previousStatus !== 'CANCELLED') {
      apiLoggerInstance.info('🚀 Triggering order cancellation automation...')
      await workflowTrigger('order.cancelled', orderId, {
        order: updatedOrder,
        previousStatus: previousStatus ?? '',
        newStatus: status,
        reason: notes ?? 'Order cancelled'
      })
    }

    await workflowTrigger('order.status_changed', orderId, {
      order: updatedOrder,
      previousStatus: previousStatus ?? '',
      newStatus: status,
      notes
    })
  } catch (error) {
    apiLoggerInstance.error({ error }, '⚠️ Automation trigger error (non-blocking):')
  }
}

function buildResponse(
  status: string,
  updatedOrder: OrderRow,
  previousStatus: string | null,
  incomeRecordId: string | null,
  currentOrder: PartialOrderRow
) {
  return NextResponse.json({
    success: true,
    order: updatedOrder,
    status_change: {
      from: previousStatus ?? '',
      to: status as OrderStatus,
      timestamp: new Date().toISOString()
    },
    automation: {
      triggered: status === 'DELIVERED' || status === 'CANCELLED',
      workflows: getTriggeredWorkflows(status as OrderStatus, previousStatus ?? '')
    },
    financial: {
      income_recorded: Boolean(incomeRecordId),
      income_record_id: incomeRecordId,
      amount: incomeRecordId ? (currentOrder.total_amount ?? 0) : null
    },
    message: `Order status updated to ${status}${status === 'DELIVERED' ? ' with automatic workflow processing and income tracking' : ''}`
  })
}

// PUT /api/orders/[id]/status - Update order status dengan automatic workflow triggers
async function putHandler(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id: orderId } = await context['params']

    const sanitizedBody = APISecurity.sanitizeRequestBody(await request.json())
    const { status, notes } = UpdateStatusSchema.parse(sanitizedBody)
    const safeNotes = notes ? InputSanitizer.sanitizeHtml(notes).slice(0, 500) : undefined
    const normalizedNotes = safeNotes?.trim().length ? safeNotes.trim() : undefined

    const supabase = createServiceRoleClient()

    // Get current order to check previous status
    let currentOrder: Awaited<ReturnType<typeof fetchCurrentOrder>>
    try {
      currentOrder = await fetchCurrentOrder(supabase, orderId)
    } catch (_error) {
      throw new APIError('Order not found', { status: 404, code: 'NOT_FOUND' })
    }

    const previousStatus = currentOrder['status']

    // Create income record if needed
    const incomeRecordId = await createIncomeRecordIfNeeded(supabase, status, previousStatus, currentOrder, apiLogger)

    // Update order status
    const updatedOrder = await updateOrderStatus(supabase, orderId, status, normalizedNotes, incomeRecordId, apiLogger)

    apiLogger.info(`🔄 Order ${currentOrder['order_no']}: ${previousStatus} → ${status}`)

    // Trigger automation workflows
    await triggerWorkflows(triggerWorkflow, orderId, status, previousStatus, updatedOrder, normalizedNotes, apiLogger)

    // Return success response
    return buildResponse(status, updatedOrder, previousStatus, incomeRecordId, currentOrder)

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in order status update:')
    return handleAPIError(error, 'PUT /api/orders/[id]/status')
  }
}

// GET /api/orders/[id]/status - Get order status history (optional)
async function getHandler(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id: orderId } = await context['params']

    const supabase = createServiceRoleClient()

    // Get order with basic info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_no, status, updated_at')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw new APIError('Order not found', { status: 404, code: 'NOT_FOUND' })
    }

    // Note: Status history would require a separate audit table in production
    // For now, return current status info
    const statusInfo = {
      current_status: order['status'],
      status_display: order['status'] ? getStatusDisplay(order['status']) : 'Unknown',
      can_transition_to: order['status'] ? getValidTransitions(order['status']) : [],
      automation_enabled: order['status'] ? isAutomationEnabled(order['status']) : false,
      updated_at: order.updated_at
    }

    return NextResponse.json({
      order_id: order['id'],
      order_no: order['order_no'],
      status_info: statusInfo
    })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error getting order status:')
    return handleAPIError(error, 'GET /api/orders/[id]/status')
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

  return statusMap[status] ?? status
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

  return transitions[currentStatus] ?? []
}

function isAutomationEnabled(status: string): boolean {
  // Automation triggers pada status tertentu
  return ['DELIVERED', 'CANCELLED'].includes(status)
}

export const PUT = withSecurity(putHandler, SecurityPresets.enhanced())
export const GET = withSecurity(getHandler, SecurityPresets.enhanced())
