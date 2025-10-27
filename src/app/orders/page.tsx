'use client'

import { useState } from 'react'
import { PageBreadcrumb, BreadcrumbPatterns } from '@/components/ui/page-breadcrumb';
import AppLayout from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useResponsive } from '@/hooks/responsive';
import { PullToRefresh } from '@/components/ui/mobile-gestures'
import { Clock, ShoppingCart, CheckCircle, TrendingUp, ArrowLeft } from 'lucide-react'

// Shared components
import {
  PageHeader,
  SharedStatsCards,
  ErrorCard,
  ActionButtons
} from '@/components/shared'

// Import modular components
import type {
  Order,
  OrderFormData
} from '@/components/orders';
import {
  OrdersList,
  OrderForm,
  OrderFilters,
  useOrders
} from '@/components/orders'

type ViewMode = 'list' | 'add' | 'edit' | 'detail'

export default function OrdersPage() {
  const { isMobile } = useResponsive()
  const [currentView, setCurrentView] = useState<ViewMode>('list')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  // Use the orders hook for all data management
  const {
    orders,
    stats,
    loading,
    error,
    filters,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    setFilters,
    resetFilters,
    refreshData
  } = useOrders()

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    await refreshData()
  }

  // Handle order actions
  const handleViewOrder = (order: Order) => {
    void setSelectedOrder(order)
    void setCurrentView('detail')
  }

  const handleEditOrder = (order: Order) => {
    void setSelectedOrder(order)
    void setCurrentView('edit')
  }

  const handleAddOrder = () => {
    void setSelectedOrder(null)
    void setCurrentView('add')
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
      await deleteOrder(orderId)
    }
  }

  const handleSaveOrder = async (orderData: OrderFormData) => {
    const success = selectedOrder 
      ? await updateOrder(selectedOrder.id, orderData)
      : await createOrder(orderData)
    
    if (success) {
      void setCurrentView('list')
      void setSelectedOrder(null)
    }
  }

  const handleCancel = () => {
    void setCurrentView('list')
    void setSelectedOrder(null)
  }

  // Breadcrumb items
  const getBreadcrumbItems = () => {
    const items = [
      { label: 'Dashboard', href: '/' },
      { label: 'Pesanan', href: '/orders' }
    ]

    if (currentView !== 'list') {
      items.push({
        label: currentView === 'add' ? 'Tambah Pesanan' :
               currentView === 'edit' ? 'Edit Pesanan' : 'Detail Pesanan',
        href: currentView === 'add' ? '/orders/new' : ''
      })
    }

    return items
  }

  // List view using shared components
  const ListView = () => (
    <div className="space-y-6">
      <PageBreadcrumb items={getBreadcrumbItems()} />

      <PageHeader
        title="Kelola Pesanan"
        description="Terima dan proses pesanan dari pelanggan"
        actions={
          <ActionButtons
            onRefresh={handleRefresh}
            onAdd={handleAddOrder}
            addLabel="Tambah Pesanan"
            refreshLabel="Refresh"
            size={isMobile ? "lg" : "md"}
            variant="horizontal"
          />
        }
      />

      {/* Stats */}
      <SharedStatsCards
        stats={[
          {
            title: 'Total Pesanan',
            value: stats.totalOrders,
            icon: <ShoppingCart className="h-8 w-8 text-primary" />
          },
          {
            title: 'Menunggu Proses',
            value: stats.pendingOrders,
            icon: <Clock className="h-8 w-8 text-yellow-600" />
          },
          {
            title: 'Selesai',
            value: stats.completedOrders,
            icon: <CheckCircle className="h-8 w-8 text-green-600" />
          },
          {
            title: 'Rata-rata Nilai',
            value: `Rp ${Math.round(stats.averageOrderValue).toLocaleString()}`,
            icon: <TrendingUp className="h-8 w-8 text-blue-600" />
          }
        ]}
      />

      {/* Filters */}
      <OrderFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />

      {/* Error Display */}
      {error && <ErrorCard error={error} onRetry={handleRefresh} />}

      {/* Orders List */}
      <OrdersList
        orders={orders}
        onViewOrder={handleViewOrder}
        onEditOrder={handleEditOrder}
        onDeleteOrder={handleDeleteOrder}
        onUpdateStatus={updateOrderStatus}
        loading={loading}
      />
    </div>
  )

  // Form view (add/edit)
  const FormView = () => (
    <OrderForm
      order={selectedOrder || undefined}
      onSave={handleSaveOrder}
      onCancel={handleCancel}
      loading={loading}
    />
  )

  // Detail view using Card component
  const DetailView = () => {
    if (!selectedOrder) {return null}

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleCancel} className="p-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                Detail Pesanan {selectedOrder.order_no}
              </h2>
              <p className="text-muted-foreground">
                Informasi lengkap pesanan
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleEditOrder(selectedOrder)} className="flex-1">
              Edit Pesanan
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Tutup
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Pelanggan</p>
                <p>{selectedOrder.customer_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Telepon</p>
                <p>{selectedOrder.customer_phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <p>{selectedOrder.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="font-bold">Rp {selectedOrder.total_amount?.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const content = (
    <>
      {/* Content based on current view */}
      {currentView === 'list' && <ListView />}
      {(currentView === 'add' || currentView === 'edit') && <FormView />}
      {currentView === 'detail' && <DetailView />}
    </>
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        {isMobile ? (
          <PullToRefresh onRefresh={handleRefresh}>
            {content}
          </PullToRefresh>
        ) : (
          content
        )}
      </div>
    </AppLayout>
  )
}
