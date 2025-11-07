import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { OrderWorkflowHandlers } from '@/lib/automation/workflows/order-workflows'
import type { WorkflowContext } from '@/types/features/automation'

/**
 * Order Workflow Tests
 * Tests for automated order processing workflows
 */


// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: { id: 'mock-id' }, error: null }))
      })),
      then: vi.fn(() => Promise.resolve({ error: null }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null }))
    }))
  }))
}

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn()
}

describe('OrderWorkflowHandlers', () => {
  let context: WorkflowContext

  beforeEach(() => {
    context = {
      event: {
        event: 'order.completed',
        entityId: 'order-123',
        data: {},
        timestamp: new Date().toISOString()
      },
      supabase: mockSupabase as any,
      logger: mockLogger,
      config: {
        enabled: true,
        maxConcurrentJobs: 5,
        retryAttempts: 3,
        notificationEnabled: true,
        defaultProfitMargin: 0.3,
        minimumProfitMargin: 0.15,
        maximumProfitMargin: 0.6,
        autoReorderDays: 7,
        safetyStockMultiplier: 1.5,
        productionLeadTime: 2,
        batchOptimizationThreshold: 10,
        lowProfitabilityThreshold: 0.2,
        cashFlowWarningDays: 30
      }
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('handleOrderStatusChanged', () => {
    it('should process status change successfully', async () => {
      const result = await OrderWorkflowHandlers.handleOrderStatusChanged(context)

      expect(result.success).toBe(true)
      expect(result.message).toContain('Status change processed')
      expect(mockLogger.info).toHaveBeenCalledWith(
        { orderId: 'order-123', status: undefined },
        'Processing order status change workflow'
      )
    })
  })

  describe('handleOrderCompleted', () => {
    it('should return error when supabase client is not available', async () => {
      const contextWithoutSupabase: WorkflowContext = {
        ...context,
        supabase: null
      }

      const result = await OrderWorkflowHandlers.handleOrderCompleted(contextWithoutSupabase)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Supabase client is not available')
    })

    it('should return error when order is not found', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Order not found' } as unknown }))
          }))
        })),
        update: vi.fn(),
        insert: vi.fn(),
        delete: vi.fn()
      } as unknown as ReturnType<typeof mockSupabase.from>)

      const result = await OrderWorkflowHandlers.handleOrderCompleted(context)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Order not found')
    })

    it('should process order completion successfully', async () => {
      const mockOrder = {
        id: 'order-123',
        order_no: 'ORD-001',
        order_items: [],
        customer: null,
        user_id: 'user-123',
        financial_record_id: null
      }

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockOrder, error: null }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null }))
        })),
        insert: vi.fn(() => Promise.resolve({ error: null })),
        delete: vi.fn()
      } as unknown as ReturnType<typeof mockSupabase.from>)

      const result = await OrderWorkflowHandlers.handleOrderCompleted(context)

      expect(result.success).toBe(true)
      expect(result.message).toContain('Order ORD-001 completed processing')
      expect(mockLogger.info).toHaveBeenCalledWith(
        { orderId: 'order-123', orderNo: 'ORD-001' },
        'Order completed workflow finished'
      )
    })
  })

  describe('handleOrderCancelled', () => {
    it('should return error when supabase client is not available', async () => {
      const contextWithoutSupabase: WorkflowContext = {
        ...context,
        supabase: null
      }

      const result = await OrderWorkflowHandlers.handleOrderCancelled(contextWithoutSupabase)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Supabase client is not available')
    })

    it('should process order cancellation successfully', async () => {
      const mockOrder = {
        id: 'order-123',
        order_no: 'ORD-001',
        order_items: [],
        customer_id: 'customer-123',
        user_id: 'user-123',
        financial_record_id: 'financial-123'
      }

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockOrder, error: null }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null }))
        })),
        insert: vi.fn(() => Promise.resolve({ error: null })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null }))
        }))
      } as unknown as ReturnType<typeof mockSupabase.from>)

      const result = await OrderWorkflowHandlers.handleOrderCancelled(context)

      expect(result.success).toBe(true)
      expect(result.message).toContain('Order order-123 cancellation processed')
      expect(mockLogger.info).toHaveBeenCalledWith(
        { orderId: 'order-123' },
        'Order cancelled workflow finished'
      )
    })
  })
})
