'use client'

import { Clock, DollarSign, Phone, Eye, Edit, Trash2 } from '@/components/icons'
import { memo, useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SkeletonText } from '@/components/ui/skeleton'
import { VirtualizedTable } from '@/components/ui/virtualized-table'
import { useCurrency } from '@/hooks/useCurrency'

import type { Order } from '@/types/index'

import { OrderStatusBadge, OrderProgress } from '@/components/orders/OrderStatusBadge'



interface VirtualizedOrdersListProps {
  orders: Order[]
  onViewOrder: (orderId: string) => void
  onEditOrder: (orderId: string) => void
  onDeleteOrder: (orderId: string) => void
  onUpdateStatus: (orderId: string, status: string) => void
  loading?: boolean
}

// Cell renderers defined outside component to avoid unstable nested components
const renderOrderNoCell = (order: Order) => (
  <div>
    <div className="font-medium">{order['order_no']}</div>
    <div className="text-sm text-muted-foreground">{order['customer_name']}</div>
  </div>
)

const renderStatusCell = (order: Order) => (
  <div className="flex flex-col gap-1">
    <OrderStatusBadge status={order['status'] ?? 'PENDING'} compact />
    <OrderProgress currentStatus={order['status'] ?? 'PENDING'} />
  </div>
)

const renderDeliveryDateCell = (order: Order) => (
  <div className="flex items-center gap-2">
    <Clock className="h-4 w-4 text-muted-foreground" />
    <span>{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('id-ID') : 'No date set'}</span>
  </div>
)

const renderCustomerCell = (order: Order) => (
  <div>
    <div>{order['customer_name']}</div>
    {order.customer_phone && (
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Phone className="h-3 w-3" />
        <span>{order.customer_phone}</span>
      </div>
    )}
  </div>
)

const renderAmountCell = (formatCurrency: (amount: number) => string) => {
  const CellComponent = (order: Order) => (
    <div className="flex items-center gap-2">
      <DollarSign className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">
        {formatCurrency(order.total_amount ?? 0)}
      </span>
    </div>
  )
  
  CellComponent.displayName = 'renderAmountCell'
  
  return CellComponent
}

const renderPriorityCell = (order: Order) => {
  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'high':
        return { label: 'Tinggi', color: 'bg-red-100 text-red-800' }
      case 'medium':
        return { label: 'Sedang', color: 'bg-yellow-100 text-yellow-800' }
      default:
        return { label: 'Normal', color: 'bg-muted text-muted-foreground' }
    }
  }

  return (
    <Badge className={getPriorityInfo(order.priority ?? 'normal').color}>
      {getPriorityInfo(order.priority ?? 'normal').label}
    </Badge>
  )
}

const renderActionsCell = (
  onViewOrder: (orderId: string) => void,
  onEditOrder: (orderId: string) => void,
  onDeleteOrder: (orderId: string) => void,
  onUpdateStatus: (orderId: string, status: string) => void
) => {
  const CellComponent = (order: Order) => (
    <div className="flex items-center gap-2">
      <select
        value={order['status'] ?? 'PENDING'}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdateStatus(order['id'], e.target.value)}
        className="bg-transparent border border-input rounded px-2 py-1 text-sm"
      >
        <option value="PENDING">Menunggu</option>
        <option value="CONFIRMED">Dikonfirmasi</option>
        <option value="IN_PROGRESS">Dalam Proses</option>
        <option value="READY">Siap</option>
        <option value="DELIVERED">Terkirim</option>
        <option value="CANCELLED">Dibatalkan</option>
      </select>
      <Button size="sm" variant="outline" onClick={() => onViewOrder(order['id'])}>
        <Eye className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="outline" onClick={() => onEditOrder(order['id'])}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onDeleteOrder(order['id'])}
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
  
  CellComponent.displayName = 'renderActionsCell'
  
  return CellComponent
}

// ✅ PERFORMANCE: Progressive enhancement for large lists using VirtualizedTable
export const VirtualizedOrdersList = memo(({
  orders,
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onUpdateStatus,
  loading = false
}: VirtualizedOrdersListProps) => {
  const { formatCurrency } = useCurrency()

  // Define table columns
  const columns = useMemo(() => [
    {
      header: 'Order No',
      accessor: 'order_no' as keyof Order,
      cell: renderOrderNoCell
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Order,
      cell: renderStatusCell
    },
    {
      header: 'Delivery Date',
      accessor: 'delivery_date' as keyof Order,
      cell: renderDeliveryDateCell
    },
    {
      header: 'Customer',
      accessor: 'customer_name' as keyof Order,
      cell: renderCustomerCell
    },
    {
      header: 'Amount',
      accessor: 'total_amount' as keyof Order,
      cell: renderAmountCell(formatCurrency)
    },
    {
      header: 'Priority',
      accessor: 'priority' as keyof Order,
      cell: renderPriorityCell
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof Order,
      cell: renderActionsCell(onViewOrder, onEditOrder, onDeleteOrder, onUpdateStatus)
    }
  ], [formatCurrency, onViewOrder, onEditOrder, onDeleteOrder, onUpdateStatus])

  if (loading) {
    return (
      <div className="border rounded-lg p-6">
        <div className="space-y-4">
          <SkeletonText className="h-4 w-1/4" />
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonText key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <VirtualizedTable
      data={orders}
      columns={columns}
      rowHeight={80}
      className="border rounded-lg"
    />
  )
})

VirtualizedOrdersList.displayName = 'VirtualizedOrdersList'

