'use client'

import { useRouter } from 'next/navigation'
import { memo, useMemo, useState } from 'react'

import { SharedDataTable } from '@/components/shared/SharedDataTable'
import { DeleteConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { useDeleteOrder } from '@/hooks/api/useOrders'

import type { Row } from '@/types/database'


type OrderForTable = Row<'orders'>

const OrderSection = ({
  orders,
  formatCurrency,
  formatDate,
  isLoading = false,
}: {
  orders: OrderForTable[]
  formatCurrency: (n: number) => string
  formatDate: (d: string) => string
  isLoading?: boolean
}) => {
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<OrderForTable | null>(null)
  const deleteOrderMutation = useDeleteOrder()

  const router = useRouter()

  const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string }> = useMemo(() => ({
    PENDING: { label: "Pending", color: 'bg-yellow-100 text-yellow-800' },
    CONFIRMED: { label: "Confirmed", color: 'bg-blue-100 text-blue-800' },
    IN_PROGRESS: { label: "In Production", color: 'bg-purple-100 text-purple-800' },
    COMPLETED: { label: "Completed", color: 'bg-green-100 text-green-800' },
    CANCELLED: { label: "Cancelled", color: 'bg-red-100 text-red-800' }
  }), [])

  const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = useMemo(() => ({
    UNPAID: { label: "Unpaid", color: 'bg-red-100 text-red-800' },
    PARTIAL: { label: "Partial", color: 'bg-yellow-100 text-yellow-800' },
    PAID: { label: "Paid", color: 'bg-green-100 text-green-800' }
  }), [])

  // Delete handler
  const handleDeleteOrder = async (): Promise<void> => {
    if (!orderToDelete) {return}

    try {
      await deleteOrderMutation.mutateAsync(orderToDelete.id)
      setDeleteDialogOpen(false)
      setOrderToDelete(null)
      router.refresh()
    } catch (error) {
      // Error handling is done in mutation
    }
  }

  const handleViewOrder = (order: OrderForTable): void => {
    router.push(`/orders/${order['id']}`)
  }

  const handleEditOrder = (order: OrderForTable): void => {
    router.push(`/orders/${order['id']}/edit`)
  }

  const handleDeleteClick = (order: OrderForTable): void => {
    setOrderToDelete(order)
    setDeleteDialogOpen(true)
  }

  const handleBulkDelete = async (ordersToDelete: OrderForTable[]): Promise<void> => {
    try {
      // For bulk delete, we'll delete them one by one
      // In production, you'd want a bulk delete API endpoint
      for (const order of ordersToDelete) {
        await deleteOrderMutation.mutateAsync(order.id)
      }
      toast.success(`${ordersToDelete.length} pesanan berhasil dihapus`)
      router.refresh()
    } catch (error) {
      // Error handling is done in mutation
    }
  }

  return (
    <>
      <SharedDataTable
        data={orders}
        columns={[
          {
            key: 'order_no',
            header: 'No. Pesanan',
            render: (value) => <span className="font-medium">{value as string}</span>,
            sortable: true,
          },
          {
            key: 'customer_name',
            header: 'Pelanggan',
            render: (_, item) => (
              <div className="flex flex-col">
                <span className="font-medium">{item.customer_name ?? '-'}</span>
                {item.customer_phone && (
                  <span className="text-xs text-muted-foreground">{item.customer_phone}</span>
                )}
              </div>
            ),
            sortable: true,
          },
          {
            key: 'order_date',
            header: 'Tanggal Order',
            render: (value) => value ? formatDate(value as string) : '-',
            sortable: true,
          },
          {
            key: 'delivery_date',
            header: 'Tanggal Kirim',
            render: (value) => value ? formatDate(value as string) : '-',
            sortable: true,
          },
          {
            key: 'status',
            header: 'Status',
            render: (value) => {
              const status = value as string
              const config = ORDER_STATUS_CONFIG[status] ?? { label: status, color: 'bg-secondary text-secondary-foreground' }
              return (
                <span className={`text-xs px-2 py-1 rounded ${config.color}`}>
                  {config.label}
                </span>
              )
            },
            filterable: true,
            filterType: 'select',
            filterOptions: [
              { label: 'Pending', value: 'PENDING' },
              { label: 'Confirmed', value: 'CONFIRMED' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ],
          },
          {
            key: 'payment_status',
            header: 'Payment',
            render: (value) => {
              const status = value as string
              const config = PAYMENT_STATUS_CONFIG[status] ?? { label: status, color: 'bg-secondary text-secondary-foreground' }
              return (
                <span className={`text-xs px-2 py-1 rounded ${config.color}`}>
                  {config.label}
                </span>
              )
            },
            filterable: true,
            filterType: 'select',
            filterOptions: [
              { label: 'Unpaid', value: 'UNPAID' },
              { label: 'Partial', value: 'PARTIAL' },
              { label: 'Paid', value: 'PAID' },
            ],
          },
          {
            key: 'total_amount',
            header: 'Total',
            render: (value) => (
              <div className="text-right font-medium">
                {formatCurrency((value as number) ?? 0)}
              </div>
            ),
            sortable: true,
            className: 'text-right',
          },
        ]}
        loading={isLoading}
        onView={handleViewOrder}
        onEdit={handleEditOrder}
        onDelete={handleDeleteClick}
        onBulkDelete={handleBulkDelete}
        enableBulkActions={true}
        searchPlaceholder="Cari pesanan, pelanggan..."
        emptyMessage="Belum ada pesanan"
        emptyDescription="Pesanan akan muncul di sini setelah dibuat"
        exportable={true}
        refreshable={false}
        enablePagination={true}
        pageSizeOptions={[10, 20, 50, 100]}
        initialPageSize={20}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={`Order ${orderToDelete?.order_no ?? ''}`}
        onConfirm={handleDeleteOrder}
        loading={deleteOrderMutation.isPending}
      />
    </>
  )
}

export const OrderSectionMemo = memo(OrderSection)
