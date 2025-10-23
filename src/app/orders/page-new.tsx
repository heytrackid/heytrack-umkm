'use client'

import * as React from 'react'
import { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useResponsive } from '@/hooks/useResponsive'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { 
  Plus, 
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { PullToRefresh } from '@/components/ui/mobile-gestures'

// Import modular components
import {
  OrdersList,
  OrderForm,
  OrderFilters,
  useOrders,
  Order,
  OrderFormData
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
    setSelectedOrder(order)
    setCurrentView('detail')
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    setCurrentView('edit')
  }

  const handleAddOrder = () => {
    setSelectedOrder(null)
    setCurrentView('add')
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
      setCurrentView('list')
      setSelectedOrder(null)
    }
  }

  const handleCancel = () => {
    setCurrentView('list')
    setSelectedOrder(null)
  }

  // Breadcrumb items
  const getBreadcrumbItems = () => {
    const items = [
      { label: 'Dashboard', href: '/' },
      { label: 'Pesanan', href: currentView === 'list' ? undefined : '/orders' }
    ]
    
    if (currentView !== 'list') {
      items.push({ 
        label: currentView === 'add' ? 'Tambah Pesanan' : 
               currentView === 'edit' ? 'Edit Pesanan' : 'Detail Pesanan'
      })
    }
    
    return items
  }

  // Stats cards
  const StatsCards = () => (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
      <Card>
        <CardContent className="p-4 text-center">
          <ShoppingCart className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {stats.totalOrders}
          </div>
          <p className="text-sm text-muted-foreground">Total Pesanan</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {stats.pendingOrders}
          </div>
          <p className="text-sm text-muted-foreground">Menunggu Proses</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {stats.completedOrders}
          </div>
          <p className="text-sm text-muted-foreground">Selesai</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            Rp {Math.round(stats.averageOrderValue).toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">Rata-rata Nilai</p>
        </CardContent>
      </Card>
    </div>
  )

  // List view
  const ListView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            Kelola Pesanan
          </h1>
          <p className="text-muted-foreground">
            Terima dan proses pesanan dari pelanggan
          </p>
        </div>
        <div className={`flex gap-2 ${isMobile ? 'w-full flex-col' : ''}`}>
          <Button variant="outline" onClick={handleRefresh} className={isMobile ? 'w-full' : ''}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAddOrder} className={isMobile ? 'w-full' : ''}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pesanan
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Filters */}
      <OrderFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800">Error: {error}</p>
          </CardContent>
        </Card>
      )}

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

  // Detail view
  const DetailView = () => {
    if (!selectedOrder) return null

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleCancel} className="p-2">
            ← Kembali
          </Button>
          <div>
            <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              Detail Pesanan {selectedOrder.order_no}
            </h2>
            <p className="text-muted-foreground">
              Informasi lengkap pesanan
            </p>
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

        <div className="flex gap-2">
          <Button onClick={() => handleEditOrder(selectedOrder)} className="flex-1">
            Edit Pesanan
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Tutup
          </Button>
        </div>
      </div>
    )
  }

  const content = (
    <>
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          {getBreadcrumbItems().map((item, index: number) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink asChild>
                      <PrefetchLink href={item.href}>
                    {item.label}
                  </PrefetchLink>
                    </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < getBreadcrumbItems().length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

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
