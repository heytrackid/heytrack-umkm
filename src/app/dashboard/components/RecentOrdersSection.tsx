'use client'




import { Calendar, Filter, ShoppingCart, X } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useCurrency } from '@/hooks/useCurrency'

interface RecentOrdersSectionProps {
  orders?: Array<{
    id: string
    customer: string
    amount: number | null
    status: string | null
    created_at: string | null
  }>
}

const RecentOrdersSection = ({
  orders = []
}: RecentOrdersSectionProps): JSX.Element => {
  const { formatCurrency } = useCurrency()
  const router = useRouter()
  


  const getStatusBadge = (status: string | null) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
      PENDING: { label: 'Pending', variant: 'secondary' },
      CONFIRMED: { label: 'Dikonfirmasi', variant: 'default' },
      IN_PROGRESS: { label: 'Diproses', variant: 'default' },
      COMPLETED: { label: 'Selesai', variant: 'outline' },
      CANCELLED: { label: 'Dibatalkan', variant: 'destructive' }
    }

    const statusInfo = statusMap[status ?? 'PENDING'] ?? statusMap['PENDING']
    if (!statusInfo) {return <Badge variant="secondary">Unknown</Badge>}
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  // Use all orders (date filtering removed)
  const filteredOrders = orders

  // Show skeleton if orders is undefined
  if (orders === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Pesanan Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Pesanan Terbaru
          </CardTitle>
        </div>
        

      </CardHeader>
      
      <CardContent className="space-y-4">

        
        {(() => {
          if (filteredOrders.length === 0 && orders.length === 0) {
            return (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                <p>Belum ada pesanan terbaru</p>
                <p className="text-sm">Pesanan akan muncul di sini ketika ada data</p>
              </div>
            )
          }
          if (filteredOrders.length === 0 && orders.length > 0) {
            return (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                <p>Belum ada pesanan terbaru</p>
                <p className="text-sm">Pesanan akan muncul di sini ketika ada data</p>
              </div>
            )
          }
          return (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div
                  key={order['id']}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => router.push(`/orders/${order['id']}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      router.push(`/orders/${order['id']}`)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-wrap-mobile">{order.customer}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(order.amount ?? 0)}
                      {order.created_at && (
                        <span className="ml-2">
                          • {new Date(order.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(order['status'])}
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
        
        <Button variant="outline" className="w-full" onClick={() => router.push('/orders')}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Lihat Semua Pesanan
        </Button>
      </CardContent>
    </Card>
  )
}

export default RecentOrdersSection
