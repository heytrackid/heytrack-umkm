'use client'

import { ChevronLeft, ChevronRight, Eye, Edit, Trash2, MoreVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { memo, useMemo, useState, useEffect } from 'react'

import { DeleteConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu'
import { LoadingButton } from '@/components/ui/loading-button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import type { Row } from '@/types/database'


type OrderForTable = Row<'orders'>

const OrdersTableSection = ({
  orders,
  formatCurrency,
  formatDate,
}: {
  orders: OrderForTable[]
  formatCurrency: (n: number) => string
  formatDate: (d: string) => string
}) => {

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<OrderForTable | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const router = useRouter()

  const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string }> = useMemo(() => ({
    PENDING: { label: "Pending", color: 'bg-gray-100 text-gray-800' },
    CONFIRMED: { label: "Confirmed", color: 'bg-gray-200 text-gray-900' },
    IN_PROGRESS: { label: "In Production", color: 'bg-gray-300 text-gray-900' },
    COMPLETED: { label: "Completed", color: 'bg-gray-400 text-white' },
    CANCELLED: { label: "Cancelled", color: 'bg-gray-500 text-white' }
  }), [])

  const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = useMemo(() => ({
    UNPAID: { label: "Unpaid", color: 'bg-gray-100 text-gray-800' },
    PARTIAL: { label: "Partial", color: 'bg-gray-200 text-gray-900' },
    PAID: { label: "Paid", color: 'bg-gray-300 text-gray-900' }
  }), [])

  // Calculate pagination
  const totalItems = orders.length
  const totalPages = Math.ceil(totalItems / pageSize)

  // Get paginated data
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return orders.slice(startIndex, endIndex)
  }, [orders, currentPage, pageSize])

  // Reset to page 1 when orders change
  useEffect(() => {
    setCurrentPage(1)
  }, [orders.length])

  // Delete handler
  const handleDeleteOrder = async () => {
    if (!orderToDelete) {return}

    try {
      setIsDeleting(true)
      // TODO: Implement actual delete API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setOrderToDelete(null)
    }
  }

  const handleViewOrder = (order: OrderForTable) => {
    router.push(`/orders/${order['id']}`)
  }

  const handleEditOrder = (order: OrderForTable) => {
    router.push(`/orders/${order['id']}/edit`)
  }

  const handleDeleteClick = (order: OrderForTable) => {
    setOrderToDelete(order)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No. Pesanan</TableHead>
            <TableHead>Pelanggan</TableHead>
            <TableHead>Tanggal Order</TableHead>
            <TableHead>Tanggal Kirim</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedOrders.map((order: OrderForTable) => (
            <TableRow key={order['id']}>
              <TableCell className="font-medium">{order['order_no']}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{order['customer_name'] ?? '-'}</span>
                  {order.customer_phone && (
                    <span className="text-xs text-muted-foreground">{order.customer_phone}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>{order.order_date ? formatDate(order.order_date) : '-'}</TableCell>
              <TableCell>{order.delivery_date ? formatDate(order.delivery_date) : '-'}</TableCell>
              <TableCell>
                <span className={`text-xs px-2 py-1 rounded ${order['status'] ? ORDER_STATUS_CONFIG[order['status']]?.color : 'bg-gray-100 text-gray-800'}`}>
                  {order['status'] ? (ORDER_STATUS_CONFIG[order['status']]?.label ?? order['status']) : 'Unknown'}
                </span>
              </TableCell>
              <TableCell>
                <span className={`text-xs px-2 py-1 rounded ${order.payment_status ? PAYMENT_STATUS_CONFIG[order.payment_status]?.color : 'bg-gray-100 text-gray-800'}`}>
                  {order.payment_status ? (PAYMENT_STATUS_CONFIG[order.payment_status]?.label ?? order.payment_status) : 'Unknown'}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(order.total_amount ?? 0)}
              </TableCell>
              <TableCell className="text-center">
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <LoadingButton variant="ghost" size="sm" hapticFeedback hapticType="light">
                       <MoreVertical className="h-4 w-4" />
                     </LoadingButton>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end">
                     <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                       <Eye className="mr-2 h-4 w-4" />
                       Lihat Detail
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                       <Edit className="mr-2 h-4 w-4" />
                       Edit
                     </DropdownMenuItem>
                     <DropdownMenuItem
                       className="text-red-600 focus:text-red-600"
                       onClick={() => handleDeleteClick(order)}
                     >
                       <Trash2 className="mr-2 h-4 w-4" />
                       Hapus
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border-t bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} orders
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Per page</span>
              <Select value={pageSize.toString()} onValueChange={(value: string) => setPageSize(Number(value))}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-2">
               <LoadingButton
                 variant="outline"
                 size="sm"
                 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                 disabled={currentPage === 1}
                 hapticFeedback
                 hapticType="light"
               >
                 <ChevronLeft className="h-4 w-4" />
               </LoadingButton>

               <span className="text-sm font-medium">
                 Page {currentPage} of {totalPages}
               </span>

               <LoadingButton
                 variant="outline"
                 size="sm"
                 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                 disabled={currentPage === totalPages}
                 hapticFeedback
                 hapticType="light"
               >
                 <ChevronRight className="h-4 w-4" />
               </LoadingButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={`Order ${orderToDelete?.id ?? ''}`}
        onConfirm={handleDeleteOrder}
        loading={isDeleting}
      />
    </div>
  )
}

export default memo(OrdersTableSection)
