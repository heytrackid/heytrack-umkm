'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import type { OrderWithItems } from '@/app/orders/types/orders-db.types'
import { OrderComponent } from '@/components/orders/orders-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClientLogger } from '@/lib/client-logger'
import { getErrorMessage, isArrayOf, isOrder } from '@/lib/type-guards'
import { OrderDetailView } from '@/modules/orders/components/OrderDetailView'
import { OrderForm } from '@/modules/orders/components/OrderForm'

import type { Order as OrderRow } from '@/types/database'

const logger = createClientLogger('OrderView')

type Order = OrderRow

export const OrderView = () => {
  const queryClient = useQueryClient()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [editingOrder, setEditingOrder] = useState<OrderWithItems | undefined>(undefined)
  const [showOrderForm, setShowOrderForm] = useState(false)

  // ✅ Use TanStack Query for orders
  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    isFetching,
  } = useQuery<Order[]>({
    queryKey: ['orders', 'table'],
    queryFn: async () => {
      const response = await fetch('/api/orders', {
        credentials: 'include', // Include cookies for authentication
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch orders: ${errorText}`)
      }
      const result = await response.json() as unknown

      // Handle both formats: direct array or { data: array }
      let data: Order[]
      if (Array.isArray(result)) {
        data = result as Order[]
      } else if (result && typeof result === 'object' && 'data' in result) {
        const extracted = (result as { data: unknown }).data
        data = Array.isArray(extracted) ? (extracted as Order[]) : []
      } else {
        logger.warn({ result }, 'API returned unexpected format for orders')
        return []
      }

      // Validate the response with type guards
      if (isArrayOf(data, isOrder)) {
        return data
      }

      logger.warn({ data }, 'API returned invalid order data')
      return []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
  const isOrdersRefreshing = isOrdersLoading || isFetching

  const handleViewOrder = useCallback((order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetail(true)
  }, [])

  const handleEditOrder = useCallback((order: Order) => {
    // Convert Order to OrderWithItems
    const orderWithItems: OrderWithItems = {
      ...order,
      items: [] // Will be loaded by the form if needed
    }
    setEditingOrder(orderWithItems)
    setShowOrderForm(true)
  }, [])

  // ✅ Delete mutation
  const {
    mutateAsync: deleteOrder,
    isPending: isDeleting
  } = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for authentication
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to delete order: ${errorText}`)
      }
      return orderId
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      logger.info('Order deleted successfully')
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Error deleting order')
    }
  })

  const handleDeleteOrder = useCallback(async (order: Order) => {
    await deleteOrder(order.id)
  }, [deleteOrder])

  // ✅ Update status mutation
  const {
    mutateAsync: updateOrderStatus,
    isPending: isUpdatingStatus
  } = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include', // Include cookies for authentication
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update status: ${errorText}`)
      }
      const data = await response.json() as Order

      // Validate the response with type guards
      if (isOrder(data)) {
        return data
      }

      logger.warn({ data }, 'API returned unexpected format for updated order')
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      logger.info('Order status updated')
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Error updating status')
    }
  })

  const handleUpdateStatus = useCallback(async (orderId: string, newStatus: string) => {
    await updateOrderStatus({ orderId, newStatus })
  }, [updateOrderStatus])

  const handleBulkAction = useCallback(async (action: string, orderIds: string[]) => {
    logger.info({ action, orderCount: orderIds.length }, 'Bulk action triggered')

    switch (action) {
      case 'confirm':
        // Bulk confirm orders
        await Promise.all(orderIds.map(orderId => handleUpdateStatus(orderId, 'CONFIRMED')))
        break
      case 'ready':
        // Bulk mark as ready for shipping
        await Promise.all(orderIds.map(orderId => handleUpdateStatus(orderId, 'READY')))
        break
      case 'shipped':
        // Bulk mark as shipped
        await Promise.all(orderIds.map(orderId => handleUpdateStatus(orderId, 'SHIPPED')))
        break
      case 'export':
        // Export selected orders
        logger.debug({ orderIds }, 'Exporting orders')
        break
      case 'print':
        // Print selected orders
        logger.debug({ orderIds }, 'Printing orders')
        break
      case 'archive':
        // Archive selected orders
        logger.debug({ orderIds }, 'Archiving orders')
        break
      case 'cancel':
        // Cancel selected orders
        await Promise.all(orderIds.map(orderId => handleUpdateStatus(orderId, 'CANCELLED')))
        break
      case 'delete':
        // Delete selected orders
        await Promise.all(orderIds.map(orderId => {
          const order = orders.find(o => o.id === orderId)
          return order ? handleDeleteOrder(order) : Promise.resolve()
        }))
        break
      default:
        logger.warn({ action }, 'Unknown bulk action')
    }
  }, [handleUpdateStatus, handleDeleteOrder, orders])

  const tableLoading = isOrdersRefreshing || isDeleting || isUpdatingStatus

  return (
    <>
      <OrderComponent
        orders={orders}
        loading={tableLoading}
        onViewOrder={handleViewOrder}
        onEditOrder={handleEditOrder}
        onDeleteOrder={handleDeleteOrder}
        onUpdateStatus={handleUpdateStatus}
        onBulkAction={handleBulkAction}
      />

      {/* Order Detail Dialog */}
      <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Detail Pesanan {selectedOrder?.order_no ?? selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && <OrderDetailView order={selectedOrder} />}
        </DialogContent>
      </Dialog>

      {/* Order Form Dialog */}
      <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingOrder ? `Edit Pesanan ${editingOrder.order_no || editingOrder.id}` : 'Buat Pesanan Baru'}
            </DialogTitle>
          </DialogHeader>
          <OrderForm
            {...(editingOrder && { order: editingOrder })}
            onSubmit={async (data) => {
              // Handle form submission
              logger.info({ orderNo: data.order_no }, 'Order submitted')
              await queryClient.invalidateQueries({ queryKey: ['orders'] })
              setShowOrderForm(false)
              setEditingOrder(undefined)
            }}
            onCancel={() => {
              setShowOrderForm(false)
              setEditingOrder(undefined)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
