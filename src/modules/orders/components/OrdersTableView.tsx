'use client'

import OrdersTable from '@/components/orders/orders-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useEffect, useState } from 'react'
import { OrderDetailView } from './OrderDetailView'
import { OrderForm } from './OrderForm'

import { uiLogger } from '@/lib/logger'
import { Order } from '../types'

export function OrdersTableView() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [showOrderForm, setShowOrderForm] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (err) {
      uiLogger.error('Error fetching orders', { error: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetail(true)
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
    setShowOrderForm(true)
  }

  const handleDeleteOrder = async (order: Order) => {
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setOrders(prev => prev.filter(o => o.id !== order.id))
      }
    } catch (err) {
      uiLogger.error('Error deleting order', { error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setOrders(prev => prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus as any } : order
        ))
      }
    } catch (err) {
      uiLogger.error('Error updating status', { error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  const handleBulkAction = async (action: string, orderIds: string[]) => {
    uiLogger.info('Bulk action triggered', { action, orderCount: orderIds.length })

    switch (action) {
      case 'confirm':
        // Bulk confirm orders
        for (const orderId of orderIds) {
          await handleUpdateStatus(orderId, 'CONFIRMED')
        }
        break
      case 'export':
        // Export selected orders
        uiLogger.debug('Exporting orders', { orderIds })
        break
      case 'print':
        // Print selected orders
        uiLogger.debug('Printing orders', { orderIds })
        break
      case 'archive':
        // Archive selected orders
        uiLogger.debug('Archiving orders', { orderIds })
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
        uiLogger.warn('Unknown bulk action', { action })
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
            <DialogTitle className="text-lg sm:text-xl">Detail Pesanan {selectedOrder?.order_number || selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && <OrderDetailView order={selectedOrder} />}
        </DialogContent>
      </Dialog>

      {/* Order Form Dialog */}
      <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingOrder ? `Edit Pesanan ${editingOrder.order_number || editingOrder.id}` : 'Buat Pesanan Baru'}
            </DialogTitle>
          </DialogHeader>
          <OrderForm
            order={editingOrder}
            onSubmit={async (data) => {
              // Handle form submission
              uiLogger.info('Order submitted', { orderId: data.id })
              await fetchOrders()
              setShowOrderForm(false)
              setEditingOrder(null)
            }}
            onCancel={() => {
              setShowOrderForm(false)
              setEditingOrder(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
