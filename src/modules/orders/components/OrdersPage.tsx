'use client'

// Using Pino logger for all logging
import { BarChart3, Calendar, CheckCircle, Clock, DollarSign, MessageCircle, Plus, ShoppingCart, XCircle } from '@/components/icons'
import { SharedDataTable, type Column } from '@/components/shared/SharedDataTable'
import { useCreateOrder, useOrdersList, useUpdateOrder } from '@/hooks/api/useOrders'
import { useQueryClient } from '@tanstack/react-query'
import { format, subDays } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { memo, useCallback, useMemo, useState, type ChangeEvent } from 'react'

import type { OrderItemWithRecipe, OrderWithItems } from '@/app/orders/types/orders-db.types'
import { PageHeader } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChartComponent, BarChartComponent, PieChartComponent } from '@/components/ui/charts'
import type { OrderListItem, OrderStatus } from '@/types/database'

import { WhatsAppFollowUp } from '@/components/orders/WhatsAppFollowUp'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { useCurrency } from '@/hooks/useCurrency'
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from '@/lib/shared/constants'
import { getErrorMessage } from '@/lib/type-guards'
import { cn } from '@/lib/utils'
import { ORDER_STATUS_CONFIG } from '@/modules/orders/constants'
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/modules/orders/types'
import { OrderDetailView } from './OrderDetailView'
import { SimpleOrderForm } from './OrderForm/SimpleOrderForm'
import { StatusUpdateDialog } from './StatusUpdateDialog'

const arrayCalculations = {
  sum: (arr: Record<string, unknown>[], key: string): number => arr.reduce((sum: number, item) => sum + Number(item[key] ?? 0), 0),
  average: (arr: Record<string, unknown>[], key: string): number => {
    if (arr.length === 0) return 0
    const sum = arr.reduce((s: number, item) => s + Number(item[key] ?? 0), 0)
    return sum / arr.length
  }
} as const

// Local types
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

// Column definitions for SharedDataTable
const createOrderColumns = (
  formatCurrency: (amount: number) => string,
  formatDate: (date: string) => string,
  getStatusColor: (status: OrderStatus | null) => string,
  getPaymentStatusColor: (status: string | null) => string
): Column<OrderListItem & Record<string, unknown>>[] => [
  {
    key: 'order_no',
    header: 'No. Pesanan',
    sortable: true,
    render: (value: unknown) => <span className="font-medium">{String(value)}</span>
  },
  {
    key: 'customer_name',
    header: 'Pelanggan',
    sortable: true,
    render: (value: unknown) => String(value ?? 'N/A')
  },
  {
    key: 'order_date',
    header: 'Tanggal',
    sortable: true,
    hideOnMobile: true,
    render: (value: unknown) => value ? formatDate(String(value)) : '-'
  },
  {
    key: 'total_amount',
    header: 'Total',
    sortable: true,
    render: (value: unknown) => <span className="font-medium">{formatCurrency(Number(value ?? 0))}</span>
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: Object.entries(ORDER_STATUS_CONFIG).map(([value, config]) => ({
      value,
      label: config.label
    })),
    render: (value: unknown) => (
      <Badge className={getStatusColor(value as OrderStatus)}>
        {value && String(value) in ORDER_STATUS_LABELS 
          ? ORDER_STATUS_LABELS[value as OrderStatus] 
          : 'N/A'}
      </Badge>
    )
  },
  {
    key: 'payment_status',
    header: 'Pembayaran',
    hideOnMobile: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { value: 'UNPAID', label: 'Belum Bayar' },
      { value: 'PARTIAL', label: 'Sebagian' },
      { value: 'PAID', label: 'Lunas' }
    ],
    render: (value: unknown) => (
      <Badge className={getPaymentStatusColor(value as string)}>
        {value ? PAYMENT_STATUS_LABELS[String(value).toUpperCase() as keyof typeof PAYMENT_STATUS_LABELS] || 'N/A' : 'N/A'}
      </Badge>
    )
  },
  {
    key: 'delivery_date',
    header: 'Tgl Kirim',
    hideOnMobile: true,
    render: (value: unknown) => value ? formatDate(String(value)) : '-'
  }
]

const OrdersPageComponent = (_props: OrdersPageProps) => {
  const { formatCurrency } = useCurrency()
  const queryClient = useQueryClient()

  const createOrderMutation = useCreateOrder()
  const updateOrderMutation = useUpdateOrder()
  const [orderSubmitError, setOrderSubmitError] = useState<string | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentOrder, setPaymentOrder] = useState<OrderListItem | null>(null)
  const [paymentAmount, setPaymentAmount] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH')
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false)
  const [followUpOrderId, setFollowUpOrderId] = useState<string>('')

  type ActiveView = 'analytics' | 'calendar' | 'dashboard' | 'list'
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')

  // ✅ Use standardized hook for automatic caching
  const { data: ordersData, isLoading: loading, error: queryError, refetch } = useOrdersList()

  const orders = useMemo((): OrderListItem[] => {
    if (!ordersData) return []
    // Handle both array and object response formats
    if (Array.isArray(ordersData)) return ordersData as OrderListItem[]
    if (typeof ordersData === 'object' && 'data' in ordersData) {
      return ((ordersData as { data: OrderListItem[] }).data ?? [])
    }
    return []
  }, [ordersData])

  const selectedFollowUpOrder = useMemo(() => {
    if (!followUpOrderId) return null
    return orders.find((o) => o.id === followUpOrderId) ?? null
  }, [followUpOrderId, orders])

  const error = queryError ? getErrorMessage(queryError) : null

  // ✅ Calculate stats with useMemo for performance (use all orders, not filtered)
  const stats = useMemo<OrderStats>(() => {
    const PENDING = ORDER_STATUSES.find(s => s.value === 'PENDING')?.value
    const CONFIRMED = ORDER_STATUSES.find(s => s.value === 'CONFIRMED')?.value
    const IN_PROGRESS = ORDER_STATUSES.find(s => s.value === 'IN_PROGRESS')?.value
    const DELIVERED = ORDER_STATUSES.find(s => s.value === 'DELIVERED')?.value
    const CANCELLED = ORDER_STATUSES.find(s => s.value === 'CANCELLED')?.value
    const UNPAID = PAYMENT_STATUSES.find(s => s.value === 'PENDING')?.value
    
    return {
      total_orders: orders.length,
      pending_orders: orders.filter((o) => o.status === PENDING).length,
      confirmed_orders: orders.filter((o) => o.status === CONFIRMED).length,
      in_production_orders: orders.filter((o) => o.status === IN_PROGRESS).length,
      completed_orders: orders.filter((o) => o.status === DELIVERED).length,
      cancelled_orders: orders.filter((o) => o.status === CANCELLED).length,
      total_revenue: orders.reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0),
      pending_revenue: arrayCalculations.sum(
        orders.filter((o) => o.payment_status === UNPAID) as unknown as Record<string, unknown>[],
        'total_amount'
      ),
      paid_revenue: arrayCalculations.sum(
        orders.filter((o) => o.payment_status !== UNPAID) as unknown as Record<string, unknown>[],
        'total_amount'
      ),
      average_order_value: arrayCalculations.average(orders as unknown as Record<string, unknown>[], 'total_amount'),
      total_customers: new Set(orders.filter((o) => o.customer_name).map((o) => o.customer_name)).size,
      repeat_customers: 0,
      period_growth: 0,
      revenue_growth: 0,
      order_growth: 0
    }
  }, [orders])

  const getStatusColor = (status: OrderStatus | null) => {
    if (!status) { return 'bg-gray-100 text-gray-800' }
    const config = ORDER_STATUS_CONFIG[status]
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

  // Memoized columns for SharedDataTable
  const orderColumns = useMemo(
    () => createOrderColumns(formatCurrency, formatDate, getStatusColor, getPaymentStatusColor),
    [formatCurrency]
  )

  // Dialog states
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [statusUpdateOrder, setStatusUpdateOrder] = useState<{ id: string; status: OrderStatus; orderNo: string } | null>(null)

  const handleCreateOrder = useCallback(() => {
    setSelectedOrder(null)
    setShowOrderForm(true)
  }, [])

  const handleEditOrder = useCallback((order: OrderWithItems) => {
    setSelectedOrder(order)
    setShowOrderForm(true)
  }, [])

  const handleViewOrder = useCallback((order: OrderWithItems) => {
    setSelectedOrder(order)
    setShowOrderDetail(true)
  }, [])

  const handleClosePaymentModal = useCallback(() => {
    setPaymentDialogOpen(false)
    setPaymentOrder(null)
    setPaymentAmount('')
    setPaymentMethod('CASH')
    setPaymentError(null)
  }, [])

  // ✅ Open status update dialog
  const handleOpenStatusDialog = useCallback((order: OrderListItem) => {
    if (!order.status) return
    setStatusUpdateOrder({
      id: order.id,
      status: order.status,
      orderNo: order.order_no
    })
    setShowStatusDialog(true)
  }, [])

  // Payment helpers
  const handleMarkPaid = useCallback(async (order: OrderListItem) => {
    const totalAmount = Number(order.total_amount ?? 0)
    const paymentMethod = (order as Record<string, unknown>)['payment_method'] as string | undefined
    await updateOrderMutation.mutateAsync({
      id: order.id,
      order: {
        paid_amount: totalAmount,
        payment_status: 'PAID',
        payment_method: paymentMethod ?? 'CASH'
      } as never
    })
    void queryClient.invalidateQueries({ queryKey: ['orders'] })
    void queryClient.invalidateQueries({ queryKey: ['orders-list'] })
  }, [queryClient, updateOrderMutation])

  const handleOpenPaymentModal = useCallback((order: OrderListItem) => {
    const outstanding = Math.max(Number(order.total_amount ?? 0) - Number((order as Record<string, unknown>)['paid_amount'] ?? 0), 0)
    setPaymentOrder(order)
    setPaymentAmount(outstanding > 0 ? String(outstanding) : '')
    const paymentMethodValue = (order as Record<string, unknown>)['payment_method'] as string | undefined
    setPaymentMethod(paymentMethodValue ?? 'CASH')
    setPaymentError(null)
    setPaymentDialogOpen(true)
  }, [])

  const handleSubmitPayment = useCallback(async () => {
    if (!paymentOrder) return
    const amount = Number(paymentAmount)
    if (Number.isNaN(amount) || amount <= 0) {
      setPaymentError('Nominal harus lebih dari 0')
      return
    }

    const currentPaid = Number((paymentOrder as Record<string, unknown>)['paid_amount'] ?? 0)
    const totalAmount = Number(paymentOrder.total_amount ?? 0)
    const newPaid = currentPaid + amount
    const derivedStatus = newPaid >= totalAmount ? 'PAID' : 'PARTIAL'

    try {
      await updateOrderMutation.mutateAsync({
        id: paymentOrder.id,
        order: {
          paid_amount: newPaid,
          payment_status: derivedStatus,
          payment_method: paymentMethod
        } as never
      })
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      void queryClient.invalidateQueries({ queryKey: ['orders-list'] })
      handleClosePaymentModal()
    } catch (err: unknown) {
      setPaymentError(getErrorMessage(err) || 'Gagal mencatat pembayaran')
    }
  }, [handleClosePaymentModal, paymentAmount, paymentMethod, paymentOrder, queryClient, updateOrderMutation])

  const handleMarkPaidFromModal = useCallback(async () => {
    if (!paymentOrder) return
    const totalAmount = Number(paymentOrder.total_amount ?? 0)
    if (totalAmount <= 0) return

    try {
      await updateOrderMutation.mutateAsync({
        id: paymentOrder.id,
        order: {
          paid_amount: totalAmount,
          payment_status: 'PAID',
          payment_method: paymentMethod
        } as never
      })
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      void queryClient.invalidateQueries({ queryKey: ['orders-list'] })
      handleClosePaymentModal()
    } catch (err: unknown) {
      setPaymentError(getErrorMessage(err) || 'Gagal menandai lunas')
    }
  }, [handleClosePaymentModal, paymentMethod, paymentOrder, queryClient, updateOrderMutation])

  // ✅ Handle status update
  const handleUpdateStatus = useCallback(async (newStatus: OrderStatus) => {
    if (!statusUpdateOrder) return

    try {
      const response = await fetch(`/api/orders/${statusUpdateOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        const errorData = await response.json() as { message?: string }
        throw new Error(errorData.message || 'Gagal mengubah status')
      }

      // Refresh orders list
      await queryClient.invalidateQueries({ queryKey: ['orders'] })
      await queryClient.invalidateQueries({ queryKey: ['orders-list'] })
    } catch (err) {
      // Re-throw to let StatusUpdateDialog handle the error
      throw err
    }
  }, [queryClient, statusUpdateOrder])

  // Only show loading skeleton on initial load (when no data yet)
  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Kelola Pesanan"
          description="Kelola pesanan dan penjualan dengan sistem terintegrasi"
          icon={<ShoppingCart className="h-8 w-8" />}
        />

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
            <Button onClick={() => refetch()}>Coba Lagi</Button>
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
        icon={<ShoppingCart className="h-8 w-8 text-muted-foreground" />}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const firstWithPhone = orders.find((o) => Boolean(o.customer_phone))
                setFollowUpOrderId(firstWithPhone?.id ?? '')
                setFollowUpDialogOpen(true)
              }}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Follow Up
            </Button>
            <Button onClick={handleCreateOrder}>
              <Plus className="h-4 w-4 mr-2" />
              Pesanan Baru
            </Button>
          </div>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Rata-rata nilai per pesanan
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
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.revenue_growth}% dari periode sebelumnya
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
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
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
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
          <div className="flex flex-wrap gap-2" />
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
              <div className="text-2xl font-bold text-foreground">{stats.pending_orders}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.confirmed_orders}</div>
              <div className="text-xs text-muted-foreground">Confirmed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.in_production_orders}</div>
              <div className="text-xs text-muted-foreground">Produksi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.completed_orders}</div>
              <div className="text-xs text-muted-foreground">Selesai</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.cancelled_orders}</div>
              <div className="text-xs text-muted-foreground">Batal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.total_customers}</div>
              <div className="text-xs text-muted-foreground">Pelanggan</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <SwipeableTabs value={activeView} onValueChange={(value) => setActiveView(value as ActiveView)}>
        <SwipeableTabsList>
          <SwipeableTabsTrigger value="dashboard" className="text-xs sm:text-sm">Ringkasan</SwipeableTabsTrigger>
          <SwipeableTabsTrigger value="list" className="text-xs sm:text-sm">Daftar Pesanan</SwipeableTabsTrigger>
          <SwipeableTabsTrigger value="calendar" className="text-xs sm:text-sm">Kalender</SwipeableTabsTrigger>
          <SwipeableTabsTrigger value="analytics" className="text-xs sm:text-sm">Analitik</SwipeableTabsTrigger>
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
                      {(orders as unknown as OrderListItem[]).slice(0, 5).map((order: OrderListItem) => (
                       <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                         <div className="flex-1">
                           <div className="font-medium">{order.order_no}</div>
                           <div className="text-sm text-muted-foreground">{order.customer_name ?? 'N/A'}</div>
                           <div className="text-xs text-muted-foreground">{order.order_date ? formatDate(order.order_date) : 'N/A'}</div>
                         </div>
                         <div className="text-right">
                           <div className="font-medium">{formatCurrency(order.total_amount ?? 0)}</div>
                           <Badge className={cn("text-xs", getStatusColor(order.status))}>
                             {order.status && order.status in ORDER_STATUS_LABELS ? ORDER_STATUS_LABELS[order.status as OrderStatus] : 'N/A'}
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
                    const count = (orders as unknown as OrderListItem[]).filter((o: OrderListItem) => o.status === status).length
                    const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0

                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{config.label}</span>
                          <span>{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={cn("h-2 rounded-full", config.color.replace('text-', 'bg-'))}
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
          <SharedDataTable<OrderListItem & Record<string, unknown>>
            data={orders as (OrderListItem & Record<string, unknown>)[]}
            columns={orderColumns}
            title="Daftar Pesanan"
            description="Kelola semua pesanan pelanggan"
            onAdd={handleCreateOrder}
            addButtonText="Pesanan Baru"
            onView={(item: OrderListItem & Record<string, unknown>) => handleViewOrder(item as unknown as OrderWithItems)}
            onEdit={(item: OrderListItem & Record<string, unknown>) => handleEditOrder(item as unknown as OrderWithItems)}
            customActions={[
              {
                label: 'Ubah Status',
                icon: Clock,
                onClick: (item: OrderListItem & Record<string, unknown>) => {
                  handleOpenStatusDialog(item as unknown as OrderListItem)
                },
                show: (item: OrderListItem & Record<string, unknown>) => {
                  const order = item as unknown as OrderListItem
                  const currentStatus = order.status
                  if (!currentStatus) return false
                  const config = ORDER_STATUS_CONFIG[currentStatus]
                  return (config?.nextStatuses || []).length > 0
                }
              },
              {
                label: 'Catat Pembayaran',
                icon: DollarSign,
                onClick: (item: OrderListItem & Record<string, unknown>) => {
                  handleOpenPaymentModal(item as unknown as OrderListItem)
                },
                show: (item: OrderListItem & Record<string, unknown>) => {
                  const order = item as unknown as OrderListItem
                  const paid = Number((order as Record<string, unknown>)['paid_amount'] ?? 0)
                  const total = Number(order.total_amount ?? 0)
                  return total > paid
                }
              },
              {
                label: 'Tandai Lunas',
                icon: CheckCircle,
                onClick: (item: OrderListItem & Record<string, unknown>) => {
                  handleMarkPaid(item as unknown as OrderListItem)
                },
                show: (item: OrderListItem & Record<string, unknown>) => {
                  const order = item as unknown as OrderListItem
                  const paid = Number((order as Record<string, unknown>)['paid_amount'] ?? 0)
                  const total = Number(order.total_amount ?? 0)
                  return total > 0 && paid < total
                }
              }
            ]}
            searchPlaceholder="Cari nomor pesanan atau nama pelanggan..."
            emptyMessage="Belum Ada Pesanan"
            emptyDescription="Klik tombol 'Pesanan Baru' untuk membuat pesanan pertama"
            loading={loading}
            refreshable
            onRefresh={() => void refetch()}
            enablePagination
            initialPageSize={10}
            pageSizeOptions={[10, 25, 50, 100]}
          />
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
          <div className="space-y-6">
            {/* Analytics Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground">Rata-rata Nilai Pesanan</div>
                  <div className="text-2xl font-bold">{formatCurrency(stats.average_order_value)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground">Total Pelanggan</div>
                  <div className="text-2xl font-bold">{stats.total_customers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground">Tingkat Penyelesaian</div>
                  <div className="text-2xl font-bold">
                    {stats.total_orders > 0 
                      ? ((stats.completed_orders / stats.total_orders) * 100).toFixed(1) 
                      : 0}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Order Status Pie Chart */}
              <PieChartComponent
                data={[
                  { name: 'Pending', value: stats.pending_orders },
                  { name: 'Confirmed', value: stats.confirmed_orders },
                  { name: 'Produksi', value: stats.in_production_orders },
                  { name: 'Selesai', value: stats.completed_orders },
                  { name: 'Batal', value: stats.cancelled_orders },
                ].filter(d => d.value > 0)}
                title="Distribusi Status Pesanan"
                description="Breakdown status pesanan saat ini"
                dataKey="value"
                nameKey="name"
                height={250}
                donut
                showLegend
                config={{
                  'Pending': { label: 'Pending', color: '#f59e0b' },
                  'Confirmed': { label: 'Confirmed', color: '#3b82f6' },
                  'Produksi': { label: 'Produksi', color: '#8b5cf6' },
                  'Selesai': { label: 'Selesai', color: '#22c55e' },
                  'Batal': { label: 'Batal', color: '#ef4444' },
                }}
              />

              {/* Revenue by Payment Status */}
              <BarChartComponent
                data={[
                  { name: 'Dibayar', value: stats.paid_revenue },
                  { name: 'Tertunda', value: stats.pending_revenue },
                ]}
                title="Pendapatan per Status Pembayaran"
                description="Perbandingan pendapatan dibayar vs tertunda"
                dataKey="value"
                xAxisKey="name"
                height={250}
                config={{
                  value: { label: 'Jumlah', color: '#3b82f6' },
                }}
              />
            </div>

            {/* Daily Orders Trend */}
            {orders.length > 0 && (
              <AreaChartComponent
                data={(() => {
                  const last14Days = Array.from({ length: 14 }, (_, i) => {
                    const date = subDays(new Date(), 13 - i)
                    const dateStr = format(date, 'yyyy-MM-dd')
                    const dayOrders = (orders as unknown as OrderListItem[]).filter(o => 
                      o.order_date?.startsWith(dateStr)
                    )
                    return {
                      date: format(date, 'dd MMM', { locale: idLocale }),
                      pesanan: dayOrders.length,
                      pendapatan: dayOrders.reduce((sum, o) => sum + (o.total_amount ?? 0), 0),
                    }
                  })
                  return last14Days
                })()}
                title="Tren Pesanan 14 Hari Terakhir"
                description="Jumlah pesanan dan pendapatan harian"
                dataKey={['pesanan', 'pendapatan']}
                xAxisKey="date"
                height={300}
                showLegend
                config={{
                  pesanan: { label: 'Pesanan', color: '#3b82f6' },
                  pendapatan: { label: 'Pendapatan', color: '#22c55e' },
                }}
              />
            )}
          </div>
        </SwipeableTabsContent>
      </SwipeableTabs>

      {/* Order Form Dialog */}
      <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {selectedOrder ? `Edit Pesanan ${selectedOrder['order_no']}` : 'Buat Pesanan Baru'}
            </DialogTitle>
          </DialogHeader>
          <SimpleOrderForm
            {...(selectedOrder && { order: { ...selectedOrder, items: [] as OrderItemWithRecipe[] } as OrderWithItems })}
            loading={createOrderMutation.isPending || updateOrderMutation.isPending}
            {...(orderSubmitError ? { error: orderSubmitError } : {})}
            onSubmit={async (data) => {
              setOrderSubmitError(null)

              const paymentStatus = data.paid_amount >= data.total_amount
                ? 'PAID'
                : data.paid_amount > 0
                  ? 'PARTIAL'
                  : 'UNPAID'

              const payload = {
                ...data,
                payment_status: paymentStatus,
              }

              const normalizeOptionalString = (value: string | undefined): string | null => {
                const trimmed = value?.trim()
                return trimmed && trimmed.length > 0 ? trimmed : null
              }

              const normalizedPayload = {
                ...payload,
                customer_phone: normalizeOptionalString(payload.customer_phone),
                customer_address: normalizeOptionalString(payload.customer_address),
                delivery_date: normalizeOptionalString(payload.delivery_date),
                delivery_time: normalizeOptionalString(payload.delivery_time),
                payment_method: payload.payment_method ?? null,
                items: payload.items,
              }

              try {
                if (selectedOrder?.id) {
                  await updateOrderMutation.mutateAsync({ id: selectedOrder.id, order: normalizedPayload as never })
                } else {
                  await createOrderMutation.mutateAsync(normalizedPayload as never)
                }

                await queryClient.invalidateQueries({ queryKey: ['orders'] })
                setShowOrderForm(false)
                setSelectedOrder(null)
              } catch (err: unknown) {
                setOrderSubmitError(getErrorMessage(err) || 'Gagal menyimpan pesanan')
              }
            }}
            onCancel={() => {
              setShowOrderForm(false)
              setSelectedOrder(null)
              setOrderSubmitError(null)
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

      {/* Status Update Dialog */}
      {statusUpdateOrder && (
        <StatusUpdateDialog
          open={showStatusDialog}
          onOpenChange={setShowStatusDialog}
          currentStatus={statusUpdateOrder.status}
          orderNo={statusUpdateOrder.orderNo}
          onConfirm={handleUpdateStatus}
        />
      )}

      <Dialog
        open={paymentDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setPaymentDialogOpen(true)
          } else {
            handleClosePaymentModal()
          }
        }}
      >
        <DialogContent className="w-full max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Catat Pembayaran{paymentOrder?.order_no ? ` - ${paymentOrder.order_no}` : ''}
            </DialogTitle>
          </DialogHeader>

          {paymentOrder && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">{formatCurrency(Number(paymentOrder.total_amount ?? 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sudah dibayar</span>
                  <span className="font-medium">{formatCurrency(Number((paymentOrder as Record<string, unknown>)['paid_amount'] ?? 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sisa</span>
                  <span className="font-medium">
                    {formatCurrency(
                      Math.max(
                        Number(paymentOrder.total_amount ?? 0) - Number((paymentOrder as Record<string, unknown>)['paid_amount'] ?? 0),
                        0
                      )
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_amount">Nominal diterima</Label>
                <Input
                  id="payment_amount"
                  type="number"
                  min={0}
                  value={paymentAmount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPaymentAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Metode pembayaran</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metode" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m: (typeof PAYMENT_METHODS)[number]) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {paymentError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {paymentError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={handleClosePaymentModal}>
                  Batal
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleMarkPaidFromModal}
                  disabled={updateOrderMutation.isPending}
                >
                  Tandai Lunas
                </Button>

                <Button onClick={handleSubmitPayment} disabled={updateOrderMutation.isPending}>
                  Simpan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={followUpDialogOpen} onOpenChange={setFollowUpDialogOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-3xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Follow Up WhatsApp</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Pilih Pesanan</Label>
              <Select value={followUpOrderId} onValueChange={setFollowUpOrderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pesanan..." />
                </SelectTrigger>
                <SelectContent>
                  {orders
                    .filter((o) => Boolean(o.customer_phone))
                    .slice(0, 100)
                    .map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.order_no} - {o.customer_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedFollowUpOrder?.customer_phone ? (
              <WhatsAppFollowUp
                order={{
                  id: selectedFollowUpOrder.id,
                  customer_name: selectedFollowUpOrder.customer_name ?? 'Pelanggan',
                  customer_phone: String(selectedFollowUpOrder.customer_phone),
                  total_amount: Number(selectedFollowUpOrder.total_amount ?? 0),
                  status: String(selectedFollowUpOrder.status ?? 'PENDING'),
                  ...(((selectedFollowUpOrder as Record<string, unknown>)['notes'] as string | undefined)
                    ? { notes: (selectedFollowUpOrder as Record<string, unknown>)['notes'] as string }
                    : {}),
                  ...(selectedFollowUpOrder.delivery_date
                    ? { delivery_date: selectedFollowUpOrder.delivery_date }
                    : {}),
                }}
              />
            ) : (
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                Pilih pesanan yang punya nomor WhatsApp pelanggan.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div >
  )
}

// Memoized export for performance
export const OrdersPage = memo(OrdersPageComponent)
