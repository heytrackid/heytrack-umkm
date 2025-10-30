'use client'

import { useState, useMemo } from 'react'
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import AppLayout from '@/components/layout/app-layout'
import { useResponsive } from '@/hooks/responsive';
import { PullToRefresh } from '@/components/ui/mobile-gestures'
import { Clock, ShoppingCart, CheckCircle, TrendingUp, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImportDialog } from '@/components/import'
import {
  parseOrdersCSV,
  generateOrdersTemplate
} from '@/components/import/csv-helpers'

// Shared components
import {
  PageHeader,
  SharedStatsCards,
  ActionButtons
} from '@/components/shared'

// UX components
import { ErrorMessage } from '@/components/ui/error-message'

// Import modular components
import {
  OrdersList,
  OrderFilters,
  EnhancedOrderForm,
  OrderDetailView,
  useOrders,
  type Order,
  type OrderFormData
} from '@/components/orders'

type ViewMode = 'list' | 'add' | 'edit' | 'detail'

export default function OrdersPage() {
  const { isMobile } = useResponsive()
  const [currentView, setCurrentView] = useState<ViewMode>('list')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  // Generate template URL
  const templateUrl = useMemo(() => {
    const template = generateOrdersTemplate()
    const blob = new Blob([template], { type: 'text/csv' })
    return URL.createObjectURL(blob)
  }, [])

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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(true)}
              size={isMobile ? "lg" : "sm"}
              disabled={loading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <ActionButtons
              onRefresh={handleRefresh}
              onAdd={handleAddOrder}
              addLabel="Tambah"
              refreshLabel="Refresh"
              size={isMobile ? "lg" : "md"}
              variant="horizontal"
              disabled={loading}
            />
          </div>
        }
      />

      {/* Error Display - Show at top if there's an error */}
      {error && (
        <ErrorMessage
          variant="card"
          error={error}
          onRetry={handleRefresh}
        />
      )}

      {/* Stats - Only show when not loading or has data */}
      {(!loading || orders.length > 0) && (
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
      )}

      {/* Filters - Only show when not loading or has data */}
      {(!loading || orders.length > 0) && (
        <OrderFilters
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
        />
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
    <EnhancedOrderForm
      order={selectedOrder || undefined}
      onSave={handleSaveOrder}
      onCancel={handleCancel}
      loading={loading}
    />
  )

  // Detail view using enhanced component
  const DetailView = () => {
    if (!selectedOrder) { return null }

    return (
      <OrderDetailView
        order={selectedOrder}
        onEdit={() => handleEditOrder(selectedOrder)}
        onDelete={() => handleDeleteOrder(selectedOrder.id)}
        onBack={handleCancel}
        onUpdateStatus={async (status) => {
          await updateOrderStatus(selectedOrder.id, status)
        }}
      />
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

        {/* Import Dialog */}
        <ImportDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          title="Import Pesanan"
          description="Upload file CSV untuk import data pesanan secara massal. Customer akan otomatis dibuat jika belum ada."
          templateUrl={templateUrl}
          templateFilename="template-pesanan.csv"
          parseCSV={parseOrdersCSV}
          onImport={async (data) => {
            try {
              const response = await fetch('/api/orders/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orders: data })
              })

              const result = await response.json()

              if (!response.ok) {
                return {
                  success: false,
                  error: result.error || 'Import gagal',
                  details: result.details
                }
              }

              // Refresh data
              await refreshData()

              return {
                success: true,
                count: result.ordersCount
              }
            } catch (error) {
              return {
                success: false,
                error: 'Terjadi kesalahan saat import'
              }
            }
          }}
        />
      </div>
    </AppLayout>
  )
}
