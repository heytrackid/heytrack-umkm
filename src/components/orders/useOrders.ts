import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Order, OrderFilters, OrderFormData, OrderStats, OrderStatus } from './types'
import { generateOrderNo } from './utils'
import { getErrorMessage, isOrder } from '@/lib/type-guards'
import { cachePresets } from '@/providers/QueryProvider'
import { queryLogger } from '@/lib/client-logger'

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
  const { data: ordersResponse, isLoading: loading, error: queryError } = useQuery({
    queryKey: orderKeys.list(50),
    queryFn: async () => {
      try {
        queryLogger.info('Fetching orders from API...')
        const response = await fetch('/api/orders?limit=50')
        
        queryLogger.info('API response received', { 
          status: response.status, 
          ok: response.ok,
          contentType: response.headers.get('content-type')
        })
        
        // Handle different HTTP status codes with specific errors
        if (!response.ok) {
          let errorMessage = 'Unknown error'
          let errorDetails = null
          
          try {
            const contentType = response.headers.get('content-type')
            if (contentType?.includes('application/json')) {
              const errorJson = await response.json()
              errorMessage = errorJson.error || errorJson.message || errorMessage
              errorDetails = errorJson.details || errorJson
            } else {
              errorMessage = await response.text()
            }
          } catch (parseError) {
            queryLogger.error('Failed to parse error response', parseError)
            errorMessage = `HTTP ${response.status}: ${response.statusText}`
          }
          
          // Log detailed error for debugging
          queryLogger.error('API request failed', undefined, { 
            status: response.status, 
            error: errorMessage,
            details: errorDetails,
            url: response.url
          })
          
          // Throw specific errors based on status code
          if (response.status === 401) {
            throw new Error('Unauthorized: Please login again')
          }
          if (response.status === 403) {
            throw new Error('Forbidden: You do not have permission')
          }
          if (response.status === 404) {
            throw new Error('Not found: Orders endpoint not available')
          }
          if (response.status >= 500) {
            throw new Error(`Server error: ${errorMessage}`)
          }
          
          // Generic error for other status codes
          throw new Error(`Request failed (${response.status}): ${errorMessage}`)
        }
        
        const json = await response.json()
        queryLogger.info('API response parsed', { 
          hasData: 'data' in json,
          isArray: Array.isArray(json),
          keys: Object.keys(json)
        })
        
        // ✅ FIX: API returns { data: [...], meta: {...} }
        if (json && typeof json === 'object' && 'data' in json && Array.isArray(json.data)) {
          queryLogger.info('Orders fetched successfully', { count: json.data.length })
          
          // Map order_items to items for compatibility
          const mappedOrders = json.data.map((order: any) => ({
            ...order,
            items: order.order_items || order.items || []
          }))
          
          return mappedOrders as Order[]
        }
        
        // Fallback: if API returns array directly (backward compatibility)
        if (Array.isArray(json)) {
          queryLogger.info('Orders fetched (legacy format)', { count: json.length })
          return json as Order[]
        }
        
        queryLogger.error('API returned unexpected format', undefined, { response: json })
        throw new Error('API returned unexpected format. Expected { data: [...] } or array.')
        
      } catch (_err) {
        // Handle network errors specifically
        if (err instanceof TypeError && err.message.includes('fetch')) {
          queryLogger.error('Network error', err)
          throw new Error('Network error: Please check your internet connection')
        }
        
        // Log and re-throw other errors
        queryLogger.error('Error in orders query', err)
        throw err
      }
    },
    ...cachePresets.frequentlyUpdated,
    retry: 2,
    retryDelay: 1000,
  })

  const orders = ordersResponse || []
  const error = queryError ? (queryError).message : null

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
    const orderDate = order.delivery_date ? new Date(order.delivery_date) : new Date(0) // Use epoch date if null
    const dateFromMatch = !filters.dateFrom || (order.delivery_date && orderDate >= new Date(filters.dateFrom))
    const dateToMatch = !filters.dateTo || (order.delivery_date && orderDate <= new Date(filters.dateTo))

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
      try {
        // Transform OrderFormData to match OrderInsertSchema
        const totalAmount = orderData.order_items.reduce((sum, item) => 
          sum + (item.quantity * item.unit_price), 0
        )
        
        const newOrder = {
          order_no: generateOrderNo(),
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone || null,
          customer_address: orderData.customer_address || null,
          order_date: new Date().toISOString().split('T')[0],
          delivery_date: orderData.delivery_date || null,
          delivery_time: orderData.delivery_time || null,
          status: 'PENDING' as OrderStatus,
          payment_status: 'UNPAID' as const,
          payment_method: null,
          subtotal: totalAmount,
          tax_amount: 0,
          discount_amount: 0,
          delivery_fee: 0,
          total_amount: totalAmount,
          notes: orderData.notes || null,
          special_instructions: null,
          items: orderData.order_items.map(item => ({
            recipe_id: item.recipe_id,
            product_name: item.product_name || null,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.quantity * item.unit_price,
            special_requests: null
          }))
        }

        queryLogger.info('Creating order...', { orderData: newOrder })

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        })

        queryLogger.info('Create order response received', { 
          status: response.status, 
          ok: response.ok 
        })

        if (!response.ok) {
          let errorMessage = 'Failed to create order'
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorData.message || errorMessage
            queryLogger.error('Create order failed', undefined, { 
              status: response.status,
              error: errorData 
            })
          } catch {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`
          }
          throw new Error(errorMessage)
        }

        const data = await response.json()
        queryLogger.info('Order created successfully', { orderId: data.id })
        
        // Validate the response with type guards
        if (isOrder(data)) {
          return data
        }
        
        queryLogger.warn('API returned unexpected format for created order', { data })
        return data
      } catch (_err) {
        queryLogger.error('Error in createOrder mutation', err)
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryLogger.info('Order created, cache invalidated')
    },
    onError: (err) => {
      const message = getErrorMessage(err)
      queryLogger.error('Create order mutation failed', undefined, { error: message })
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
      // Transform OrderFormData to match OrderUpdateSchema
      const totalAmount = orderData.order_items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0
      )
      
      const updatedData = {
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone || null,
        customer_address: orderData.customer_address || null,
        delivery_date: orderData.delivery_date || null,
        delivery_time: orderData.delivery_time || null,
        subtotal: totalAmount,
        total_amount: totalAmount,
        notes: orderData.notes || null
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update order')
      }

      const data = await response.json()
      
      // Validate the response with type guards
      if (isOrder(data)) {
        return data
      }
      
      queryLogger.warn('API returned unexpected format for updated order', { data })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryLogger.info('Order updated successfully')
    },
    onError: (err) => {
      const message = getErrorMessage(err)
      queryLogger.error('Error updating order', undefined, { error: message })
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
        const errorText = await response.text()
        throw new Error(`Failed to update order status: ${errorText}`)
      }

      const data = await response.json()
      
      // Validate the response with type guards
      if (isOrder(data)) {
        return data
      }
      
      queryLogger.warn('API returned unexpected format for order status update', { data })
      return data
    },
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      
      // ✅ FIX: Removed manual inventory update - now handled by API route
      // The API route will call InventoryUpdateService which creates stock_transactions
      // Database trigger will automatically update current_stock
      
      queryLogger.info('Order status updated', { orderId: variables.orderId, status: variables.newStatus })
    },
    onError: (err) => {
      const message = getErrorMessage(err)
      queryLogger.error('Error updating order status', undefined, { error: message })
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
        const errorText = await response.text()
        throw new Error(`Failed to delete order: ${errorText}`)
      }

      return orderId
    },
    onSuccess: (orderId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryLogger.info('Order deleted successfully', { orderId })
    },
    onError: (err) => {
      const message = getErrorMessage(err)
      queryLogger.error('Error deleting order', undefined, { error: message })
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