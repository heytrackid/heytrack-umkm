'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SwipeActions } from '@/components/ui/mobile-gestures'
import { TablePaginationControls } from '@/components/ui/table-pagination-controls'
import { useResponsive } from '@/hooks/use-mobile'
import { useCurrency } from '@/hooks/useCurrency'
import {
    Clock,
    DollarSign,
    Edit,
    Eye,
    Package,
    Phone,
    Trash2
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Order, OrderStatus } from './types'
import { getPaymentInfo, getPriorityInfo, getStatusInfo } from './utils'

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
const OrdersList = memo(function OrdersList({
  orders,
  onViewOrder,
  onEditOrder, 
  onDeleteOrder,
  onUpdateStatus,
  loading = false
}: OrdersListProps) {
  const { isMobile } = useResponsive()
  const { formatCurrency } = useCurrency()
  const pageSizeOptions = useMemo(() => [10, 25, 50], [])
  const [rowsPerPage, setRowsPerPage] = useState<number>(pageSizeOptions[0])
  const [currentPage, setCurrentPage] = useState(1)

  const totalOrders = orders.length
  const totalPages = Math.max(1, Math.ceil(totalOrders / rowsPerPage))
  const pageStart = totalOrders === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
  const pageEnd = totalOrders === 0 ? 0 : Math.min(pageStart + rowsPerPage - 1, totalOrders)
  const paginatedOrders = useMemo(
    () => totalOrders === 0 ? [] : orders.slice(pageStart - 1, pageEnd),
    [orders, pageStart, pageEnd, totalOrders]
  )

  const handleStatusChange = useCallback((orderId: string, newStatus: OrderStatus) => {
    onUpdateStatus(orderId, newStatus)
  }, [onUpdateStatus])

  useEffect(() => {
    setCurrentPage(1)
  }, [orders, rowsPerPage])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">Belum ada pesanan</h3>
          <p className="text-muted-foreground">
            Pesanan akan muncul di sini setelah pelanggan membuat order
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {paginatedOrders.map((order) => (
          <SwipeActions
            key={order.id}
            leftActions={[
              {
                label: 'Lihat',
                color: 'blue',
                icon: <Eye className="h-4 w-4" />,
                onAction: () => onViewOrder(order)
              }
            ]}
            rightActions={[
              {
                label: 'Edit',
                color: 'green',
                icon: <Edit className="h-4 w-4" />,
                onAction: () => onEditOrder(order)
              },
              {
                label: 'Hapus',
                color: 'red',
                icon: <Trash2 className="h-4 w-4" />,
                onAction: () => onDeleteOrder(order.id)
              }
            ]}
          >
            <Card className="hover: transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{order.order_no}</h4>
                    <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                  </div>
                  <Badge className={getStatusInfo(order.status).color}>
                    {getStatusInfo(order.status).label}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(order.delivery_date).toLocaleDateString('id-ID')}</span>
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
                      {formatCurrency(order.total_amount || 0)}
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
    )
  }

  // Desktop view
  return (
    <Card>
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
                  <tr key={order.id} className="border-b hover:bg-muted/50">
                    <td className="py-3">
                      <div>
                        <div className="font-medium">{order.order_no}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.order_items?.length || 0} item
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div>
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.customer_phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div>
                        <div>{new Date(order.delivery_date).toLocaleDateString('id-ID')}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.delivery_date).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="font-medium">
                        {formatCurrency(order.total_amount || 0)}
                      </div>
                      <Badge className={getPaymentInfo(order.payment_status).color} variant="outline">
                        {getPaymentInfo(order.payment_status).label}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
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
                      <Badge className={getPriorityInfo(order.priority).color}>
                        {getPriorityInfo(order.priority).label}
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
                          onClick={() => onDeleteOrder(order.id)}
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
  )
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.orders === nextProps.orders &&
    prevProps.loading === nextProps.loading
  )
})

export default OrdersList