import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Order, OrderFilters, OrderFormData, OrderStats, OrderStatus } from './types'
import type { OrderWithRelations } from '@/app/orders/types/orders.types'
import { generateOrderNo } from './utils'
import { apiLogger } from '@/lib/logger'

// Query keys for cache management
const orderKeys = {
  all: ['orders'] as const,
  list: (limit?: number) => [...orderKeys.all, 'list', limit] as const,
}

export function useOrders() {
  const queryClient = useQueryClient()
  
  const [filters, setFilters] = useState<OrderFilters>({
    status: 'all',
    paymentStatus: 'all',
    priority: 'all',
    searchTerm: ''
  })

  // ✅ Use TanStack Query for automatic caching and refetching
  const { data: orders = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: orderKeys.list(50),
    queryFn: async () => {
      const response = await fetch('/api/orders?limit=50')
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      return response.json() as Promise<Order[]>
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    refetchOnMount: false, // Don't refetch on component mount if data is fresh
    refetchOnReconnect: true, // Refetch when internet reconnects
  })

  const error = queryError ? (queryError as Error).message : null

  // Manual refetch function
  const fetchOrders = () => {
    queryClient.invalidateQueries({ queryKey: orderKeys.all })
  }

  // Filter orders (memoized for performance)
  const filteredOrders = useMemo(() => orders.filter(order => {
    // Search filter
    const searchMatch = !filters.searchTerm || 
      (order.order_no && order.order_no.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (order.customer_phone?.toLowerCase().includes(filters.searchTerm.toLowerCase()))

    // Status filter
    const statusMatch = filters.status === 'all' || order.status === filters.status

    // Payment status filter
    const paymentMatch = filters.paymentStatus === 'all' || order.payment_status === filters.paymentStatus

    // Priority filter
    const priorityMatch = filters.priority === 'all' || order.priority === filters.priority

    // Date range filter
    const orderDate = new Date(order.delivery_date)
    const dateFromMatch = !filters.dateFrom || orderDate >= new Date(filters.dateFrom)
    const dateToMatch = !filters.dateTo || orderDate <= new Date(filters.dateTo)

    return searchMatch && statusMatch && paymentMatch && priorityMatch && dateFromMatch && dateToMatch
  }), [orders, filters])

  // Calculate stats (memoized for performance)
  const stats: OrderStats = useMemo(() => ({
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'PENDING').length,
    completedOrders: orders.filter(o => o.status === 'DELIVERED').length,
    totalRevenue: orders
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0),
    averageOrderValue: orders.length > 0 
      ? orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / orders.length 
      : 0
  }), [orders])

  // ✅ Create new order with TanStack Query mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: OrderFormData) => {
      const newOrder = {
        order_no: generateOrderNo(),
        ...orderData,
        status: 'PENDING' as OrderStatus,
        payment_status: 'UNPAID' as const,
        total_amount: orderData.order_items.reduce((sum, item) => 
          sum + (item.quantity * item.unit_price), 0
        )
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      apiLogger.info('Order created successfully')
    },
    onError: (err) => {
      apiLogger.error({ error: err }, 'Error creating order:')
    }
  })

  const createOrder = async (orderData: OrderFormData): Promise<boolean> => {
    try {
      await createOrderMutation.mutateAsync(orderData)
      return true
    } catch {
      return false
    }
  }

  // ✅ Update existing order with TanStack Query mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, orderData }: { orderId: string; orderData: OrderFormData }) => {
      const updatedData = {
        ...orderData,
        total_amount: orderData.order_items.reduce((sum, item) => 
          sum + (item.quantity * item.unit_price), 0
        )
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })

      if (!response.ok) {
        throw new Error('Failed to update order')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      apiLogger.info('Order updated successfully')
    },
    onError: (err) => {
      apiLogger.error({ error: err }, 'Error updating order:')
    }
  })

  const updateOrder = async (orderId: string, orderData: OrderFormData): Promise<boolean> => {
    try {
      await updateOrderMutation.mutateAsync({ orderId, orderData })
      return true
    } catch {
      return false
    }
  }

  // ✅ Update order status with TanStack Query mutation (optimistic update)
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: OrderStatus }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      return response.json()
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      
      // Auto-update inventory for status changes that affect stock
      if (variables.newStatus === 'DELIVERED' || variables.newStatus === 'CANCELLED') {
        try {
          const inventoryAction = variables.newStatus === 'DELIVERED' ? 'order_completed' : 'order_cancelled'
          const order = orders.find(o => o.id === variables.orderId)
          const orderItems = (order as OrderWithRelations | undefined)?.items || []

          if (orderItems.length > 0) {
            await fetch('/api/inventory/auto-update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: variables.orderId,
                action: inventoryAction,
                order_items: orderItems.map(item => ({
                  recipe_id: item.recipe_id,
                  quantity: item.quantity,
                  product_name: item.product_name
                }))
              })
            })
            apiLogger.info({ action: inventoryAction }, 'Inventory auto-updated')
          }
        } catch (err) {
          apiLogger.error({ error: err }, '⚠️ Failed to auto-update inventory for status change:')
        }
      }
      
      apiLogger.info({ orderId: variables.orderId, status: variables.newStatus }, 'Order status updated')
    },
    onError: (err) => {
      apiLogger.error({ error: err }, 'Error updating order status:')
    }
  })

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus): Promise<boolean> => {
    try {
      await updateOrderStatusMutation.mutateAsync({ orderId, newStatus })
      return true
    } catch {
      return false
    }
  }

  // ✅ Delete order with TanStack Query mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete order')
      }

      return orderId
    },
    onSuccess: (orderId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      apiLogger.info({ orderId }, 'Order deleted successfully')
    },
    onError: (err) => {
      apiLogger.error({ error: err }, 'Error deleting order:')
    }
  })

  const deleteOrder = async (orderId: string): Promise<boolean> => {
    try {
      await deleteOrderMutation.mutateAsync(orderId)
      return true
    } catch {
      return false
    }
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      paymentStatus: 'all',
      priority: 'all',
      searchTerm: ''
    })
  }

  return {
    // Data
    orders: filteredOrders,
    allOrders: orders,
    stats,
    loading,
    error,
    filters,

    // Actions
    fetchOrders,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    setFilters,
    resetFilters,

    // Utilities
    refreshData: fetchOrders
  }
}