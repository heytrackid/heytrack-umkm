'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { Clock, CheckCircle, Package, XCircle } from '@/components/icons'
import { memo, useRef, type ComponentType } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'


import type { Row } from '@/types/database'

type Order = Row<'orders'> & {
  items?: Array<{
    id: string
    product_name: string | null
    quantity: number
    unit_price: number
    total_price: number
  }>
}

interface VirtualizedOrderCardsProps {
  orders: Order[]
  onOrderClick: (orderId: string) => void
  formatCurrency: (amount: number) => string
}

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; icon: ComponentType<{ className?: string }>; className: string }> = {
    PENDING: { label: 'Pending', icon: Clock, className: 'bg-muted text-muted-foreground' },
    CONFIRMED: { label: 'Dikonfirmasi', icon: CheckCircle, className: 'bg-blue-50 text-blue-700' },
    IN_PROGRESS: { label: 'Sedang Diproses', icon: Package, className: 'bg-yellow-50 text-yellow-700' },
    READY: { label: 'Siap', icon: CheckCircle, className: 'bg-green-50 text-green-700' },
    DELIVERED: { label: 'Terkirim', icon: CheckCircle, className: 'bg-green-50 text-green-700' },
    CANCELLED: { label: 'Dibatalkan', icon: XCircle, className: 'bg-red-50 text-red-700' },
  }

  const config = statusConfig[status] ?? statusConfig['PENDING']
  if (!config) {return null}
  const Icon = config.icon

  return (
    <Badge className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}

export const VirtualizedOrderCards = memo(({
  orders,
  onOrderClick,
  formatCurrency
}: VirtualizedOrderCardsProps) => {
  const parentRef = useRef<HTMLDivElement>(null)

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimated height of each card
    overscan: 5, // Render 5 extra items outside visible area
  })

VirtualizedOrderCards.displayName = 'VirtualizedOrderCards'
  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
      style={{
        contain: 'strict', // CSS containment for better performance
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const order = orders[virtualItem.index]
          if (!order) {return null}
          return (
            <div
              key={order['id']}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <Card
                className="transition-all cursor-pointer mb-3"
                onClick={() => onOrderClick(order['id'])}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">#{order['order_no']}</h3>
                        {getStatusBadge(order['status'] ?? 'PENDING')}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Pelanggan: {order['customer_name']}</p>
                        <p>Tanggal: {order.order_date ? new Date(order.order_date).toLocaleDateString('id-ID') : 'No date set'}</p>
                        {order.delivery_date && (
                          <p>Pengiriman: {new Date(order.delivery_date).toLocaleDateString('id-ID')}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatCurrency(order.total_amount ?? 0)}
                      </p>
                      {order.items && order.items.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.items.length} item
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
})