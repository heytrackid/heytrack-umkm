'use client'

import {
  Clock,
  DollarSign,
  Edit,
  Eye,
  Phone,
  Plus,
  Trash2
} from '@/components/icons'
import { memo, useCallback, useMemo, useState } from 'react'

import type { OrderWithRelations } from '@/app/orders/types/orders.types'
import { OrderProgress, OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState, EmptyStatePresets } from '@/components/ui/empty-state'
import { SwipeActions } from '@/components/ui/mobile-gestures'
import { SkeletonText } from '@/components/ui/skeleton'
import { TablePaginationControls } from '@/components/ui/table-pagination-controls'
import { useUpdateOrderStatus } from '@/hooks/api/useOrders'
import { useCurrency } from '@/hooks/useCurrency'

import { getPaymentInfo, getPriorityInfo } from '@/components/orders/utils'

import type { Order, OrderStatus, PaymentStatus, Priority } from '@/components/orders/types'

interface OrdersListProps {
  orders: Order[]
  onViewOrder: (order: Order) => void
  onEditOrder: (order: Order) => void
  onDeleteOrder: (orderId: string) => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
  loading?: boolean
}

/**
 * OrdersList Component - Optimized with React.memo
 * 
 * Performance optimizations:
 * - Wrapped with React.memo to prevent unnecessary re-renders
 * - useCallback for event handlers
 * - useMemo for expensive calculations
 */
export const OrdersList = memo(({
  orders,
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onUpdateStatus,
  loading = false
}: OrdersListProps) => {
  const { formatCurrency } = useCurrency()
  const updateStatusMutation = useUpdateOrderStatus()
  
  const pageSizeOptions = useMemo(() => [10, 25, 50], [])
  const [rowsPerPage, setRowsPerPage] = useState<number>(pageSizeOptions[0] ?? 10)
  const [currentPage, setCurrentPage] = useState(1)

  const totalOrders = orders.length
  const totalPages = Math.max(1, Math.ceil(totalOrders / rowsPerPage))
  const effectivePage = Math.min(currentPage, totalPages)
  const pageStart = totalOrders === 0 ? 0 : (effectivePage - 1) * rowsPerPage + 1
  const pageEnd = totalOrders === 0 ? 0 : Math.min(pageStart + rowsPerPage - 1, totalOrders)
  const paginatedOrders = useMemo(
    () => totalOrders === 0 ? [] : orders.slice(pageStart - 1, pageEnd),
    [orders, pageStart, pageEnd, totalOrders]
  )

  const handleStatusChange = useCallback((orderId: string, newStatus: OrderStatus) => {
    // Use React Query mutation for optimistic updates
    updateStatusMutation.mutate({ orderId, newStatus })
    // Also call parent callback for backward compatibility
    onUpdateStatus(orderId, newStatus)
  }, [onUpdateStatus, updateStatusMutation])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }, (_, i) => (
          <Card key={`skeleton-${i}`} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <SkeletonText className="h-4 w-3/4" />
                <SkeletonText className="h-3 w-1/2" />
                <SkeletonText className="h-3 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!loading && orders.length === 0) {
    return (
      <EmptyState
        {...EmptyStatePresets.orders}
        actions={[
          {
            label: 'Buat Order Pertama',
            onClick: () => onEditOrder({} as Order), // Trigger form dialog with empty order
            icon: Plus
          }
        ]}
      />
    )
  }

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {paginatedOrders.map((order) => (
          <SwipeActions
            key={order['id']}
            actions={[
              {
                id: 'view',
                label: 'Lihat',
                color: 'blue',
                icon: <Eye className="h-4 w-4" />,
                onClick: () => onViewOrder(order)
              },
              {
                id: 'edit',
                label: 'Edit',
                color: 'green',
                icon: <Edit className="h-4 w-4" />,
                onClick: () => onEditOrder(order)
              },
              {
                id: 'delete',
                label: 'Hapus',
                color: 'red',
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => onDeleteOrder(order['id'])
              }
            ]}
          >
            <Card className="transition-all">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium">{order['order_no']}</h4>
                    <p className="text-sm text-muted-foreground">{order['customer_name']}</p>
                  </div>
                  <OrderStatusBadge
                    status={order['status'] ?? 'PENDING'}
                    compact
                  />
                </div>

                {/* Progress indicator */}
                <div className="mb-3">
                  <OrderProgress currentStatus={order['status'] ?? 'PENDING'} />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('id-ID') : 'No date set'}</span>
                  </div>

                  {order.customer_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.customer_phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {formatCurrency(order.total_amount ?? 0)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => onViewOrder(order)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Detail
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onEditOrder(order)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </SwipeActions>
        ))}

        <TablePaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={rowsPerPage}
          onPageSizeChange={(size) => {
            setRowsPerPage(size)
            setCurrentPage(1)
          }}
          totalItems={totalOrders}
          pageStart={pageStart}
          pageEnd={pageEnd}
          pageSizeOptions={pageSizeOptions}
          className="border-t"
        />
      </div>

      {/* Desktop View */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Daftar Pesanan ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">No. Order</th>
                    <th className="text-left py-2">Pelanggan</th>
                    <th className="text-left py-2">Tanggal</th>
                    <th className="text-left py-2">Total</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Prioritas</th>
                    <th className="text-left py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order['id']} className="border-b hover:bg-muted/50">
                      <td className="py-3">
                        <div>
                          <div className="font-medium">{order['order_no']}</div>
                          <div className="text-sm text-muted-foreground">
                            {(order as OrderWithRelations).items?.length ?? 0} item
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div>
                          <div className="font-medium">{order['customer_name']}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.customer_phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div>
                          <div>{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('id-ID') : 'No date set'}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.delivery_date ? new Date(order.delivery_date).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'No time set'}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="font-medium">
                          {formatCurrency(order.total_amount ?? 0)}
                        </div>
                        <Badge className={getPaymentInfo((order.payment_status ?? 'UNPAID') as PaymentStatus).color} variant="outline">
                          {getPaymentInfo((order.payment_status ?? 'UNPAID') as PaymentStatus).label}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <select
                          value={order['status'] ?? 'PENDING'}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStatusChange(order['id'], e.target.value as OrderStatus)}
                          className="bg-transparent border border-input rounded px-2 py-1 text-sm"
                        >
                          <option value="PENDING">Menunggu</option>
                          <option value="CONFIRMED">Dikonfirmasi</option>
                          <option value="IN_PROGRESS">Dalam Proses</option>
                          <option value="READY">Siap</option>
                          <option value="DELIVERED">Terkirim</option>
                          <option value="CANCELLED">Dibatalkan</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <Badge className={getPriorityInfo((order.priority ?? 'normal') as Priority).color}>
                          {getPriorityInfo((order.priority ?? 'normal') as Priority).label}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => onViewOrder(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => onEditOrder(order)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteOrder(order['id'])}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <TablePaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={rowsPerPage}
              onPageSizeChange={(size) => {
                setRowsPerPage(size)
                setCurrentPage(1)
              }}
              totalItems={totalOrders}
              pageStart={pageStart}
              pageEnd={pageEnd}
              pageSizeOptions={pageSizeOptions}
              className="border-t"
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}, (prevProps, nextProps) =>
// Custom comparison to prevent unnecessary re-renders
(
  prevProps.orders === nextProps.orders &&
  prevProps.loading === nextProps.loading
)
)

OrdersList.displayName = 'OrdersList'

