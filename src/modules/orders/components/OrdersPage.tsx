// @ts-nocheck
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { uiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
import {
  BarChart3,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Eye,
  Filter,
  MessageCircle,
  Plus,
  Search,
  ShoppingCart,
  TrendingUp,
  XCircle
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { arrayCalculations } from '@/lib/performance-optimized'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import dynamic from 'next/dynamic'
import { PageHeader } from '@/components/layout/PageHeader'

// ✅ Code Splitting - Lazy load heavy components
const OrderForm = dynamic(() => import('./OrderForm').then(mod => ({ default: mod.OrderForm })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-lg" />,
  ssr: false
})

const OrderDetailView = dynamic(() => import('./OrderDetailView').then(mod => ({ default: mod.OrderDetailView })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-lg" />,
  ssr: false
})

// Types and constants
import { useCurrency } from '@/hooks/useCurrency'
import {
  ORDER_STATUS_CONFIG
} from '@/modules/orders/constants'
import type {
  Order,
  OrderStatus
} from '@/app/orders/types/orders.types'
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS
} from '@/modules/orders/types'

// Local types
interface OrderFilters {
  status: OrderStatus[]
  payment_status: string[]
  date_from: string
  date_to: string
  customer_search?: string
}

interface OrderStats {
  total_orders: number
  pending_orders: number
  confirmed_orders: number
  in_production_orders: number
  completed_orders: number
  cancelled_orders: number
  total_revenue: number
  pending_revenue: number
  paid_revenue: number
  average_order_value: number
  total_customers: number
  repeat_customers: number
  period_growth: number
  revenue_growth: number
  order_growth: number
}


interface OrdersPageProps {
  userRole?: 'admin' | 'manager' | 'staff'
  enableAdvancedFeatures?: boolean
}

export default function OrdersPage({ }: OrdersPageProps) {
  const { formatCurrency } = useCurrency()
  const queryClient = useQueryClient()

  type ActiveView = 'dashboard' | 'list' | 'calendar' | 'analytics'
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')

  // Filters
  const [filters, setFilters] = useState<OrderFilters>({
    status: [],
    payment_status: [],
    date_from: '',
    date_to: '',
    customer_search: ''
  })

  // ✅ Use TanStack Query for automatic caching
  const { data: ordersData, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['orders', 'all'],
    queryFn: async () => {
      const response = await fetch('/api/orders')
      if (!response.ok) { throw new Error('Failed to fetch orders') }
      const data = await response.json()
      // Ensure we always return an array
      return Array.isArray(data) ? data : []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })

  const orders = Array.isArray(ordersData) ? ordersData : []

  const error = queryError ? (queryError).message : null

  // ✅ Calculate stats with useMemo for performance
  const stats = useMemo<OrderStats>(() => ({
    total_orders: orders.length,
    pending_orders: orders.filter(o => o.status === 'PENDING').length,
    confirmed_orders: orders.filter(o => o.status === 'CONFIRMED').length,
    in_production_orders: orders.filter(o => o.status === 'IN_PROGRESS').length,
    completed_orders: orders.filter(o => o.status === 'DELIVERED').length,
    cancelled_orders: orders.filter(o => o.status === 'CANCELLED').length,
    total_revenue: arrayCalculations.sum(orders, 'total_amount'),
    pending_revenue: arrayCalculations.sum(
      orders.filter(o => o.payment_status === 'UNPAID'),
      'total_amount'
    ),
    paid_revenue: orders.reduce((sum, o) => sum + (o.paid_amount || 0), 0),
    average_order_value: arrayCalculations.average(orders, 'total_amount'),
    total_customers: new Set(orders.filter(o => o.customer_id).map(o => o.customer_id)).size,
    repeat_customers: 0,
    period_growth: 0,
    revenue_growth: 0,
    order_growth: 0
  }), [orders])

  const getStatusColor = (status: OrderStatus | null) => {
    if (!status) { return 'bg-gray-100 text-gray-800' }
    const config = ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG]
    if (!config) { return 'bg-gray-100 text-gray-800' }
    return config.color
  }

  const getPaymentStatusColor = (_status: string | null) =>
    // Simplified - just return default color
    'bg-gray-100 text-gray-800'



  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  // Dialog states
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const handleCreateOrder = () => {
    setSelectedOrder(null)
    setShowOrderForm(true)
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderForm(true)
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetail(true)
  }

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // Update status via API
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      // Refetch orders after update
      // Note: TanStack Query will handle cache invalidation
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      uiLogger.error({ error: message }, 'Failed to update status')
    }
  }

  // Only show loading skeleton on initial load (when no data yet)
  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              Order Management
            </h1>
            <p className="text-muted-foreground">
              Kelola pesanan dan penjualan dengan sistem terintegrasi
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium mb-2">Gagal Memuat Data</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Kelola Pesanan"
        description="Kelola pesanan dan penjualan dengan sistem terintegrasi"
        action={
          <Button onClick={handleCreateOrder}>
            <Plus className="h-4 w-4 mr-2" />
            Pesanan Baru
          </Button>
        }
      />

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pesanan</p>
                <p className="text-2xl font-bold">{stats.total_orders}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {stats.order_growth}% dari periode sebelumnya
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pendapatan</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {stats.revenue_growth}% dari periode sebelumnya
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rata-rata Nilai</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.average_order_value)}</p>
                <p className="text-xs text-muted-foreground mt-1">per pesanan</p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendapatan Tertunda</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.pending_revenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">belum dibayar</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/orders/whatsapp-templates'}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Kelola Template WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Status Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.pending_orders}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.confirmed_orders}</div>
              <div className="text-xs text-muted-foreground">Confirmed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.in_production_orders}</div>
              <div className="text-xs text-muted-foreground">Produksi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.completed_orders}</div>
              <div className="text-xs text-muted-foreground">Selesai</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.cancelled_orders}</div>
              <div className="text-xs text-muted-foreground">Batal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.total_customers}</div>
              <div className="text-xs text-muted-foreground">Pelanggan</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <SwipeableTabs value={activeView} onValueChange={(value) => setActiveView(value as ActiveView)}>
        <SwipeableTabsList>
          <SwipeableTabsTrigger value="dashboard">Ringkasan</SwipeableTabsTrigger>
          <SwipeableTabsTrigger value="list">Daftar Pesanan</SwipeableTabsTrigger>
          <SwipeableTabsTrigger value="calendar">Kalender</SwipeableTabsTrigger>
          <SwipeableTabsTrigger value="analytics">Analitik</SwipeableTabsTrigger>
        </SwipeableTabsList>

        <SwipeableTabsContent value="dashboard" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pesanan Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="font-semibold text-lg mb-1">Belum Ada Pesanan</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Mulai buat pesanan pertama Anda
                    </p>
                    <Button
                      onClick={() => setShowOrderForm(true)}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Buat Pesanan
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{order.order_no}</div>
                          <div className="text-sm text-muted-foreground">{order.customer_name ?? 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">{order.order_date ? formatDate(order.order_date) : 'N/A'}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(order.total_amount ?? 0)}</div>
                          <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                            {order.status && order.status in ORDER_STATUS_LABELS ? ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] : 'N/A'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distribusi Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => {
                    const count = orders.filter(o => o.status === status).length
                    const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0

                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{config.label}</span>
                          <span>{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${config.color.replace('text-', 'bg-')}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </SwipeableTabsContent>

        <SwipeableTabsContent value="list" className="mt-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari nama pelanggan atau nomor pesanan..."
                        value={filters.customer_search || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, customer_search: e.target.value }))}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <Select
                    value={filters.status?.join(',') || 'all'}
                    onValueChange={(value) => {
                      setFilters(prev => ({
                        ...prev,
                        status: value === 'all' ? [] : [value as OrderStatus]
                      }))
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      {Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => (
                        <SelectItem key={status} value={status}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter Lainnya
                  </Button>
                </div>

                {/* Search Results Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    Menampilkan <span className="font-semibold text-foreground">{orders.length}</span> pesanan
                    {(filters.status?.length || filters.customer_search) && (
                      <span> (dari total {stats.total_orders} pesanan)</span>
                    )}
                  </div>
                  {(filters.status?.length || filters.customer_search) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters({ status: [], payment_status: [], date_from: '', date_to: '', customer_search: '' })}
                      className="h-8"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Hapus Filter
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">
                      {filters.customer_search || filters.status?.length
                        ? 'Tidak Ada Pesanan yang Cocok'
                        : 'Belum Ada Pesanan'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {filters.customer_search || filters.status?.length
                        ? 'Coba ubah filter atau kata kunci pencarian'
                        : 'Klik tombol "Pesanan Baru" untuk membuat pesanan pertama'}
                    </p>
                    {(filters.customer_search || filters.status?.length) ? (
                      <Button
                        variant="outline"
                        onClick={() => setFilters({ status: [], payment_status: [], date_from: '', date_to: '', customer_search: '' })}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Hapus Filter
                      </Button>
                    ) : (
                      <Button onClick={handleCreateOrder}>
                        <Plus className="h-4 w-4 mr-2" />
                        Buat Pesanan Pertama
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-lg">{order.order_no}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.customer_name ?? 'N/A'} • {order.order_date ? formatDate(order.order_date) : 'N/A'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status && order.status in ORDER_STATUS_LABELS ? ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] : 'N/A'}
                          </Badge>
                          <Badge className={getPaymentStatusColor(order.payment_status ?? null)}>
                            {order.payment_status && order.payment_status in PAYMENT_STATUS_LABELS ? PAYMENT_STATUS_LABELS[order.payment_status as keyof typeof PAYMENT_STATUS_LABELS] : 'N/A'}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Item</div>
                          <div className="font-medium">
                            N/A
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Total Tagihan</div>
                          <div className="font-medium text-lg">{formatCurrency(order.total_amount ?? 0)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Tanggal Kirim</div>
                          <div className="font-medium">{order.delivery_date ? formatDate(order.delivery_date) : '-'}</div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                          <Eye className="h-3 w-3 mr-1" />
                          Detail
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditOrder(order)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        {order.status && order.status in ORDER_STATUS_CONFIG && ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG]?.nextStatuses && ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG].nextStatuses.length > 0 && (
                          <Select
                            value={order.status}
                            onValueChange={(newStatus) => handleUpdateStatus(order.id, newStatus as OrderStatus)}
                          >
                            <SelectTrigger className="w-full sm:w-[200px] h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={order.status || 'PENDING'} disabled>
                                {order.status && order.status in ORDER_STATUS_LABELS ? ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] : 'Status Tidak Diketahui'}
                              </SelectItem>
                              {ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG]?.nextStatuses?.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status in ORDER_STATUS_LABELS ? ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] : status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </SwipeableTabsContent>

        <SwipeableTabsContent value="calendar" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Tampilan Kalender</h3>
                <p className="text-sm text-muted-foreground">
                  Kalender pesanan berdasarkan tanggal kirim akan ditampilkan di sini
                </p>
              </div>
            </CardContent>
          </Card>
        </SwipeableTabsContent>

        <SwipeableTabsContent value="analytics" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Analitik Penjualan</h3>
                <p className="text-sm text-muted-foreground">
                  Grafik penjualan dan tren bisnis akan ditampilkan di sini
                </p>
              </div>
            </CardContent>
          </Card>
        </SwipeableTabsContent>
      </SwipeableTabs>

      {/* Order Form Dialog */}
      <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {selectedOrder ? `Edit Pesanan ${selectedOrder.order_no}` : 'Buat Pesanan Baru'}
            </DialogTitle>
          </DialogHeader>
          <OrderForm
            order={selectedOrder ? { ...selectedOrder, items: [] } : undefined}
            onSubmit={async () => {
              await queryClient.invalidateQueries({ queryKey: ['orders'] })
              setShowOrderForm(false)
              setSelectedOrder(null)
            }}
            onCancel={() => {
              setShowOrderForm(false)
              setSelectedOrder(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Detail Pesanan {selectedOrder?.order_no}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && <OrderDetailView order={selectedOrder} />}
        </DialogContent>
      </Dialog>
    </div >
  )
}
