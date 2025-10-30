'use client'

import { useState } from 'react'
import type { Database } from '@/types/supabase-generated'
type Order = Database['public']['Tables']['orders']['Row']
type OrderItem = Database['public']['Tables']['order_items']['Row']
type OrderStatus = Database['public']['Enums']['order_status']
type PaymentStatus = Database['public']['Enums']['payment_status']
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  Eye,
  Edit,
  MoreHorizontal,
  Trash2,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  Download,
  Printer,
  RefreshCw,
  Archive
} from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

// Extended type for table display
interface OrderWithItems extends Order {
  order_items?: Array<Pick<OrderItem, 'product_name' | 'quantity'>>
}

interface OrdersTableProps {
  orders: OrderWithItems[]
  loading?: boolean
  onViewOrder: (order: OrderWithItems) => void
  onEditOrder: (order: OrderWithItems) => void
  onDeleteOrder?: (order: OrderWithItems) => void
  onUpdateStatus?: (orderId: string, status: string) => void
  onBulkAction?: (action: string, orderIds: string[]) => void
}

const OrdersTable = ({
  orders,
  loading = false,
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onUpdateStatus,
  onBulkAction
}: OrdersTableProps) => {
  const { formatCurrency } = useCurrency()
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<OrderWithItems | null>(null)

  // Status configurations
  const statusConfig = {
    'PENDING': { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', textColor: 'text-yellow-800' },
    'CONFIRMED': { label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-800', textColor: 'text-blue-800' },
    'IN_PROGRESS': { label: 'Sedang Diproses', color: 'bg-orange-100 text-orange-800', textColor: 'text-orange-800' },
    'READY': { label: 'Siap Diantar', color: 'bg-green-100 text-green-800', textColor: 'text-green-800' },
    'DELIVERED': { label: 'Dikirim', color: 'bg-gray-100 text-gray-800', textColor: 'text-gray-800' },
    'CANCELLED': { label: 'Dibatalkan', color: 'bg-red-100 text-red-800', textColor: 'text-red-800' }
  }

  const paymentStatusConfig = {
    'UNPAID': { label: 'Belum Dibayar', color: 'bg-red-100 text-red-800' },
    'PARTIAL': { label: 'Dibayar Sebagian', color: 'bg-yellow-100 text-yellow-800' },
    'PAID': { label: 'Lunas', color: 'bg-green-100 text-green-800' }
  }

  const priorityConfig = {
    'low': { label: 'Rendah', color: 'bg-gray-100 text-gray-800' },
    'normal': { label: 'Normal', color: 'bg-blue-100 text-blue-800' },
    'high': { label: 'Tinggi', color: 'bg-red-100 text-red-800' }
  }

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map(order => order.id))
    } else {
      void setSelectedOrders([])
    }
  }

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      void setSelectedOrders(prev => [...prev, orderId])
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId))
    }
  }

  const isAllSelected = orders.length > 0 && selectedOrders.length === orders.length
  const isIndeterminate = selectedOrders.length > 0 && selectedOrders.length < orders.length

  // Bulk actions
  const handleBulkAction = (action: string) => {
    if (onBulkAction && selectedOrders.length > 0) {
      onBulkAction(action, selectedOrders)
      setSelectedOrders([]) // Clear selection after action
    }
  }

  // Delete handler
  const handleDeleteOrder = (order: OrderWithItems) => {
    void setOrderToDelete(order)
    void setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (orderToDelete && onDeleteOrder) {
      onDeleteOrder(orderToDelete)
    }
    void setShowDeleteDialog(false)
    void setOrderToDelete(null)
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getPaymentBadge = (status: string) => {
    const config = paymentStatusConfig[status as keyof typeof paymentStatusConfig] || paymentStatusConfig.UNPAID
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.normal
    return (
      <Badge variant="secondary" className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

  // Using formatCurrency from useCurrency hook

  if (loading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>No. Pesanan</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Pembayaran</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                  <TableCell key={j}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <>
      {/* Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-900">
              {selectedOrders.length} pesanan dipilih
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('confirm')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Konfirmasi
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('export')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('print')}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Lainnya
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkAction('archive')}>
                  <Archive className="h-4 w-4 mr-2" />
                  Arsipkan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('cancel')}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Batalkan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedOrders([])}
            >
              Batal
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  ref={(el) => {
                    if (el) { el.indeterminate = isIndeterminate }
                  }}
                />
              </TableHead>
              <TableHead>No. Pesanan</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Pembayaran</TableHead>
              <TableHead className="w-12">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Tidak ada pesanan</p>
                  <p className="text-sm">Belum ada pesanan yang dibuat</p>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow
                  key={order.id}
                  className={selectedOrders.includes(order.id) ? 'bg-blue-50' : ''}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={(checked) => handleSelectOrder(order.id, !!checked)}
                    />
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{order.order_no}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.order_items?.length || 0} item • {order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0} produk
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{order.customer_name}</div>
                      {order.customer_phone && (
                        <div className="text-sm text-muted-foreground">{order.customer_phone}</div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2">
                      {getStatusBadge(order.status)}
                      {order.priority !== 'normal' && getPriorityBadge(order.priority)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>Pesan: {formatDate(order.order_date)}</div>
                      {order.delivery_date && (
                        <div className="text-muted-foreground">
                          Kirim: {formatDate(order.delivery_date)}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2">
                      <div className="font-medium">{formatCurrency(order.total_amount)}</div>
                      {getPaymentBadge(order.payment_status)}
                      {order.paid_amount > 0 && order.payment_status !== 'PAID' && (
                        <div className="text-xs text-muted-foreground">
                          Dibayar: {formatCurrency(order.paid_amount)}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewOrder(order)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat Detail
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => onEditOrder(order)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>


                        <DropdownMenuSeparator />

                        {order.status === 'PENDING' && onUpdateStatus && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'CONFIRMED')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Konfirmasi Pesanan
                          </DropdownMenuItem>
                        )}

                        {order.status === 'CONFIRMED' && onUpdateStatus && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'IN_PROGRESS')}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Mulai Proses
                          </DropdownMenuItem>
                        )}

                        {order.status === 'IN_PROGRESS' && onUpdateStatus && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'READY')}>
                            <Package className="h-4 w-4 mr-2" />
                            Siap Antar
                          </DropdownMenuItem>
                        )}

                        {order.status === 'READY' && onUpdateStatus && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'DELIVERED')}>
                            <Truck className="h-4 w-4 mr-2" />
                            Kirim Pesanan
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        {onDeleteOrder && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteOrder(order)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pesanan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pesanan "{orderToDelete?.order_no}"? Tindakan ini tidak dapat dibatalkan.
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

export default OrdersTable
