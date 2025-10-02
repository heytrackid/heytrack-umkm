import { useState, useEffect, useCallback } from 'react'
import { Order, OrderFormData, OrderFilters, OrderStats, OrderStatus } from './types'
import { generateOrderNumber } from './utils'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [filters, setFilters] = useState<OrderFilters>({
    status: 'all',
    paymentStatus: 'all',
    priority: 'all',
    searchTerm: ''
  })

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/orders?limit=50')
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      
      const data = await response.json()
      setOrders(data)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Search filter
    const searchMatch = !filters.searchTerm || 
      (order.order_no && order.order_no.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (order.customer_phone && order.customer_phone.toLowerCase().includes(filters.searchTerm.toLowerCase()))

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
  })

  // Calculate stats
  const stats: OrderStats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'PENDING').length,
    completedOrders: orders.filter(o => o.status === 'DELIVERED').length,
    totalRevenue: orders
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0),
    averageOrderValue: orders.length > 0 
      ? orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / orders.length 
      : 0
  }

  // Create new order
  const createOrder = async (orderData: OrderFormData): Promise<boolean> => {
    try {
      const newOrder = {
        order_no: generateOrderNumber(),
        ...orderData,
        status: 'PENDING' as OrderStatus,
        payment_status: 'UNPAID' as const,
        total_amount: orderData.order_items.reduce((sum, item) => 
          sum + (item.quantity * item.price), 0
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

      const createdOrder = await response.json()
      setOrders(prev => [createdOrder, ...prev])
      
      return true
    } catch (err) {
      console.error('Error creating order:', err)
      setError(err instanceof Error ? err.message : 'Failed to create order')
      return false
    }
  }

  // Update existing order
  const updateOrder = async (orderId: string, orderData: OrderFormData): Promise<boolean> => {
    try {
      const updatedData = {
        ...orderData,
        total_amount: orderData.order_items.reduce((sum, item) => 
          sum + (item.quantity * item.price), 0
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

      const updatedOrder = await response.json()
      setOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ))
      
      return true
    } catch (err) {
      console.error('Error updating order:', err)
      setError(err instanceof Error ? err.message : 'Failed to update order')
      return false
    }
  }

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus): Promise<boolean> => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      const updatedOrder = await response.json()
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))

      // Auto-update inventory for status changes that affect stock
      if (newStatus === 'DELIVERED' || newStatus === 'CANCELLED') {
        try {
          const inventoryAction = newStatus === 'DELIVERED' ? 'order_completed' : 'order_cancelled'
          const order = orders.find(o => o.id === orderId)
          const orderItems = order?.order_items || []

          if (orderItems.length > 0) {
            await fetch('/api/inventory/auto-update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: orderId,
                action: inventoryAction,
                order_items: orderItems.map(item => ({
                  recipe_id: item.recipe_id,
                  quantity: item.quantity,
                  product_name: item.product_name
                }))
              })
            })
            console.log(`✅ Inventory auto-updated for ${inventoryAction}`)
          }
        } catch (err) {
          console.error('⚠️ Failed to auto-update inventory for status change:', err)
        }
      }
      
      return true
    } catch (err) {
      console.error('Error updating order status:', err)
      setError(err instanceof Error ? err.message : 'Failed to update order status')
      return false
    }
  }

  // Delete order
  const deleteOrder = async (orderId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete order')
      }

      setOrders(prev => prev.filter(order => order.id !== orderId))
      return true
    } catch (err) {
      console.error('Error deleting order:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete order')
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