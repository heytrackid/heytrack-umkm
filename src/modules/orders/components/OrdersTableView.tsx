'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import OrdersTable from '@/components/orders/orders-table'
import { OrderForm } from './OrderForm'
import { OrderDetailView } from './OrderDetailView'

export function OrdersTableView() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [editingOrder, setEditingOrder] = useState<any>(null)
  const [showOrderForm, setShowOrderForm] = useState(false)

  useEffec"" => {
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
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order)
    setShowOrderDetail(true)
  }

  const handleEditOrder = (order: any) => {
    setEditingOrder(order)
    setShowOrderForm(true)
  }

  const handleDeleteOrder = async (order: any) => {
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setOrders(prev => prev.filter(o => o.id !== order.id))
      }
    } catch (err) {
      console.error('Error deleting order:', err)
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
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
      }
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const handleBulkAction = async (action: string, orderIds: string[]) => {
    console.log('Bulk action:', action, 'for orders:', orderIds)

    switch (action) {
      case 'confirm':
        // Bulk confirm orders
        for (const orderId of orderIds) {
          await handleUpdateStatus(orderId, 'CONFIRMED')
        }
        break
      case 'export':
        // Export selected orders
        console.log('Exporting orders:', orderIds)
        break
      case 'print':
        // Print selected orders
        console.log('Printing orders:', orderIds)
        break
      case 'archive':
        // Archive selected orders
        console.log('Archiving orders:', orderIds)
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
        console.log('Unknown bulk action:', action)
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
            <DialogTitle className="text-lg sm:text-xl">Detail Pesanan {selectedOrder?.order_no}</DialogTitle>
          </DialogHeader>
          {selectedOrder && <OrderDetailView order={selectedOrder} />}
        </DialogContent>
      </Dialog>

      {/* Order Form Dialog */}
      <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingOrder ? `Edit Pesanan ${editingOrder.order_no}` : 'Buat Pesanan Baru'}
            </DialogTitle>
          </DialogHeader>
          <OrderForm
            order={editingOrder}
            onSubmit={async (data) => {
              // Handle form submission
              console.log('Order submitted:', data)
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
