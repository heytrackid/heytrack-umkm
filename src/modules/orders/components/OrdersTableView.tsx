'use client'

import OrdersTable from '@/components/orders/orders-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { OrderDetailView } from './OrderDetailView'
import { OrderForm } from './OrderForm'

import { uiLogger } from '@/lib/logger'
import { getErrorMessage, isArrayOf, isOrder } from '@/lib/type-guards'
import type { Database } from '@/types/supabase-generated'
import type { OrderWithItems } from '@/app/orders/types/orders-db.types'

type Order = Database['public']['Tables']['orders']['Row']

export const OrdersTableView = () => {
  const queryClient = useQueryClient()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [editingOrder, setEditingOrder] = useState<OrderWithItems | undefined>(undefined)
  const [showOrderForm, setShowOrderForm] = useState(false)

  // ✅ Use TanStack Query for orders
  const { data: orders = [], isLoading: loading } = useQuery({
    queryKey: ['orders', 'table'],
    queryFn: async () => {
      const response = await fetch('/api/orders')
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch orders: ${errorText}`)
      }
      const data = await response.json()
      
      // Validate the response with type guards
      if (isArrayOf(data, isOrder)) {
        return data
      }
      
      uiLogger.warn({ data }, 'API returned unexpected format for orders')
      return []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  const handleViewOrder = (order: Order) => {
    void setSelectedOrder(order)
    void setShowOrderDetail(true)
  }

  const handleEditOrder = (order: Order) => {
    // Convert Order to OrderWithItems
    const orderWithItems: OrderWithItems = {
      ...order,
      items: [] // Will be loaded by the form if needed
    }
    void setEditingOrder(orderWithItems)
    void setShowOrderForm(true)
  }

  // ✅ Delete mutation
  const deleteMutation = useMutation({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      uiLogger.info('Order deleted successfully')
    },
    onError: (err) => {
      const message = getErrorMessage(err)
      uiLogger.error({ error: message }, 'Error deleting order')
    }
  })

  const handleDeleteOrder = async (order: Order) => {
    await deleteMutation.mutateAsync(order.id)
  }

  // ✅ Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update status: ${errorText}`)
      }
      const data = await response.json()
      
      // Validate the response with type guards
      if (isOrder(data)) {
        return data
      }
      
      uiLogger.warn({ data }, 'API returned unexpected format for updated order')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      uiLogger.info('Order status updated')
    },
    onError: (err) => {
      const message = getErrorMessage(err)
      uiLogger.error({ error: message }, 'Error updating status')
    }
  })

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    await updateStatusMutation.mutateAsync({ orderId, newStatus })
  }

  const handleBulkAction = async (action: string, orderIds: string[]) => {
    uiLogger.info({ action, orderCount: orderIds.length }, 'Bulk action triggered')

    switch (action) {
      case 'confirm':
        // Bulk confirm orders
        for (const orderId of orderIds) {
          await handleUpdateStatus(orderId, 'CONFIRMED')
        }
        break
      case 'export':
        // Export selected orders
        uiLogger.debug({ orderIds }, 'Exporting orders')
        break
      case 'print':
        // Print selected orders
        uiLogger.debug({ orderIds }, 'Printing orders')
        break
      case 'archive':
        // Archive selected orders
        uiLogger.debug({ orderIds }, 'Archiving orders')
        break
      case 'cancel':
        // Cancel selected orders
        for (const orderId of orderIds) {
          await handleUpdateStatus(orderId, 'CANCELLED')
        }
        break
      case 'delete':
        // Delete selected orders
        for (const orderId of orderIds) {
          const order = orders.find(o => o.id === orderId)
          if (order) {
            await handleDeleteOrder(order)
          }
        }
        break
      default:
        uiLogger.warn({ action }, 'Unknown bulk action')
    }
  }

  return (
    <>
      <OrdersTable
        orders={orders}
        loading={loading}
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
            <DialogTitle className="text-lg sm:text-xl">Detail Pesanan {selectedOrder?.order_no || selectedOrder?.id}</DialogTitle>
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
            order={editingOrder}
            onSubmit={async (data) => {
              // Handle form submission
              uiLogger.info({ orderNo: data.order_no }, 'Order submitted')
              await queryClient.invalidateQueries({ queryKey: ['orders'] })
              void setShowOrderForm(false)
              void setEditingOrder(undefined)
            }}
            onCancel={() => {
              void setShowOrderForm(false)
              void setEditingOrder(undefined)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
