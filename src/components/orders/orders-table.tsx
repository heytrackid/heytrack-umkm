'use client'

import {
    CheckCircle,
    Package,
    RefreshCw,
    Truck
} from '@/components/icons'
import { useMemo, useState } from 'react'

import { SharedDataTable, type Column, type CustomAction } from '@/components/shared/SharedDataTable'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/hooks/useCurrency'

import type { Order, OrderItem } from '@/components/orders/types'

// Extended type for table display
interface OrderWithItems extends Order {
  order_items?: Array<Pick<OrderItem, 'product_name' | 'quantity'>>
}

interface OrderProps {
  orders: OrderWithItems[]
  loading?: boolean
  onViewOrder: (order: OrderWithItems) => void
  onEditOrder: (order: OrderWithItems) => void
  onDeleteOrder?: (order: OrderWithItems) => void
  onUpdateStatus?: (orderId: string, status: string) => void
  onBulkAction?: (action: string, orderIds: string[]) => void
  onRefresh?: () => void
}

// Status configurations
const STATUS_CONFIG = {
  'PENDING': { label: 'Pending', color: 'bg-muted text-muted-foreground' },
  'CONFIRMED': { label: 'Dikonfirmasi', color: 'bg-blue-50 text-blue-700' },
  'IN_PROGRESS': { label: 'Sedang Diproses', color: 'bg-yellow-50 text-yellow-700' },
  'READY': { label: 'Siap Diantar', color: 'bg-green-50 text-green-700' },
  'DELIVERED': { label: 'Dikirim', color: 'bg-green-50 text-green-700' },
  'CANCELLED': { label: 'Dibatalkan', color: 'bg-destructive/10 text-destructive' }
} as const

const PAYMENT_STATUS_CONFIG = {
  'UNPAID': { label: 'Belum Dibayar', color: 'bg-red-50 text-red-700' },
  'PARTIAL': { label: 'Dibayar Sebagian', color: 'bg-yellow-50 text-yellow-700' },
  'PAID': { label: 'Lunas', color: 'bg-green-50 text-green-700' }
} as const

const PRIORITY_CONFIG = {
  'low': { label: 'Rendah', color: 'bg-secondary text-secondary-foreground' },
  'normal': { label: 'Normal', color: 'bg-muted text-muted-foreground' },
  'high': { label: 'Tinggi', color: 'bg-muted text-foreground' }
} as const

export const OrderComponent = ({
  orders,
  loading = false,
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onUpdateStatus,
  onBulkAction,
  onRefresh
}: OrderProps) => {
  const { formatCurrency } = useCurrency()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<OrderWithItems | null>(null)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleDeleteOrder = (order: OrderWithItems) => {
    setOrderToDelete(order)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (orderToDelete && onDeleteOrder) {
      onDeleteOrder(orderToDelete)
    }
    setShowDeleteDialog(false)
    setOrderToDelete(null)
  }

  const handleBulkDelete = (items: OrderWithItems[]) => {
    if (onBulkAction) {
      onBulkAction('delete', items.map(item => item.id))
    }
  }

  // Column definitions
  const columns = useMemo((): Column<OrderWithItems & Record<string, unknown>>[] => [
    {
      key: 'order_no',
      header: 'No. Pesanan',
      sortable: true,
      render: (_, item) => (
        <div className="space-y-1">
          <div className="font-medium">{item.order_no}</div>
          <div className="text-sm text-muted-foreground">
            {item.order_items?.length ?? 0} item • {item.order_items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0} produk
          </div>
        </div>
      )
    },
    {
      key: 'customer_name',
      header: 'Pelanggan',
      sortable: true,
      render: (_, item) => (
        <div className="space-y-1">
          <div className="font-medium">{item.customer_name}</div>
          {item.customer_phone && (
            <div className="text-sm text-muted-foreground">{item.customer_phone}</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      filterable: true,
      filterType: 'select',
      filterOptions: Object.entries(STATUS_CONFIG).map(([value, config]) => ({
        value,
        label: config.label
      })),
      render: (value, item) => {
        const status = (value as string) ?? 'PENDING'
        const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={config.color}>{config.label}</Badge>
              {onUpdateStatus && (
                <div className="flex gap-1">
                  {status === 'PENDING' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={(e) => { e.stopPropagation(); onUpdateStatus(item.id, 'CONFIRMED') }}
                      title="Konfirmasi pesanan"
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                  )}
                  {status === 'CONFIRMED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={(e) => { e.stopPropagation(); onUpdateStatus(item.id, 'READY') }}
                      title="Tandai siap kirim"
                    >
                      <Package className="h-3 w-3" />
                    </Button>
                  )}
                  {status === 'READY' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      onClick={(e) => { e.stopPropagation(); onUpdateStatus(item.id, 'DELIVERED') }}
                      title="Tandai dikirim"
                    >
                      <Truck className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            {item.priority !== 'normal' && item.priority && (
              <Badge variant="secondary" className={PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG]?.color}>
                {PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG]?.label}
              </Badge>
            )}
          </div>
        )
      }
    },
    {
      key: 'order_date',
      header: 'Tanggal',
      sortable: true,
      hideOnMobile: true,
      render: (_, item) => (
        <div className="space-y-1 text-sm">
          <div>Pesan: {formatDate(item.order_date)}</div>
          {item.delivery_date && (
            <div className="text-muted-foreground">
              Kirim: {formatDate(item.delivery_date)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'total_amount',
      header: 'Pembayaran',
      sortable: true,
      render: (_, item) => {
        const paymentStatus = (item.payment_status ?? 'UNPAID') as keyof typeof PAYMENT_STATUS_CONFIG
        const paymentConfig = PAYMENT_STATUS_CONFIG[paymentStatus] ?? PAYMENT_STATUS_CONFIG.UNPAID
        return (
          <div className="space-y-2">
            <div className="font-medium">{formatCurrency(item.total_amount ?? 0)}</div>
            <Badge variant="outline" className={paymentConfig.color}>
              {paymentConfig.label}
            </Badge>
            {(item.paid_amount ?? 0) > 0 && item.payment_status !== 'PAID' && (
              <div className="text-xs text-muted-foreground">
                Dibayar: {formatCurrency(item.paid_amount ?? 0)}
              </div>
            )}
          </div>
        )
      }
    }
  ], [formatCurrency, onUpdateStatus])

  // Custom actions for status updates
  const customActions = useMemo((): CustomAction<OrderWithItems & Record<string, unknown>>[] => {
    if (!onUpdateStatus) return []
    return [
      {
        label: 'Konfirmasi Pesanan',
        icon: CheckCircle,
        onClick: (item) => onUpdateStatus(item.id, 'CONFIRMED'),
        show: (item) => item.status === 'PENDING'
      },
      {
        label: 'Mulai Proses',
        icon: RefreshCw,
        onClick: (item) => onUpdateStatus(item.id, 'IN_PROGRESS'),
        show: (item) => item.status === 'CONFIRMED'
      },
      {
        label: 'Siap Antar',
        icon: Package,
        onClick: (item) => onUpdateStatus(item.id, 'READY'),
        show: (item) => item.status === 'IN_PROGRESS'
      },
      {
        label: 'Kirim Pesanan',
        icon: Truck,
        onClick: (item) => onUpdateStatus(item.id, 'DELIVERED'),
        show: (item) => item.status === 'READY'
      }
    ]
  }, [onUpdateStatus])

  return (
    <>
      <SharedDataTable<OrderWithItems & Record<string, unknown>>
        data={orders as (OrderWithItems & Record<string, unknown>)[]}
        columns={columns}
        loading={loading}
        onView={onViewOrder}
        onEdit={onEditOrder}
        {...(onDeleteOrder && { onDelete: handleDeleteOrder })}
        {...(onBulkAction && { onBulkDelete: handleBulkDelete })}
        customActions={customActions}
        searchPlaceholder="Cari pesanan, pelanggan..."
        emptyMessage="Tidak ada pesanan"
        emptyDescription="Belum ada pesanan yang dibuat"
        exportable
        refreshable={!!onRefresh}
        {...(onRefresh && { onRefresh })}
        enableBulkActions={!!onBulkAction}
        enablePagination
        pageSizeOptions={[10, 25, 50, 100]}
        initialPageSize={10}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pesanan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pesanan &quot;{orderToDelete?.order_no}&quot;? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
